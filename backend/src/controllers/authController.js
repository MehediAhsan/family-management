import { randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { getJwtSecret } from '../middleware/authMiddleware.js';
import { HttpError, requireString } from '../utils/http.js';

const phonePattern = /^\+?[0-9][0-9\s().-]{6,30}$/;

const normalizePhone = (value) => {
  const phone = requireString(value, 'Phone number', { max: 32 });
  if (!phonePattern.test(phone)) {
    throw new HttpError(400, 'Enter a valid phone number.', 'VALIDATION_ERROR');
  }
  return phone.replace(/[\s().-]/g, '');
};

const parsePassword = (value) => {
  if (typeof value !== 'string' || value.length < 10 || Buffer.byteLength(value, 'utf8') > 72) {
    throw new HttpError(400, 'Password must be at least 10 characters and no more than 72 UTF-8 bytes.', 'VALIDATION_ERROR');
  }
  return value;
};

const userResponse = (user) => ({
  id: user.id,
  fullName: user.full_name,
  phoneNumber: user.phone_number,
  role: user.role,
  householdId: user.household_id,
});

const signToken = (user) => jwt.sign({
  sub: user.id,
  role: user.role,
  householdId: user.household_id,
}, getJwtSecret(), { expiresIn: '8h', issuer: 'family-management-system' });

export const register = async (req, res) => {
  const fullName = requireString(req.body.fullName, 'Full name', { max: 120 });
  const phoneNumber = normalizePhone(req.body.phoneNumber);
  const password = parsePassword(req.body.password);
  const inviteCode = typeof req.body.inviteCode === 'string' ? req.body.inviteCode.trim() : '';
  const householdName = typeof req.body.householdName === 'string' ? req.body.householdName.trim() : '';
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) {
    throw new HttpError(400, 'Password must include at least one letter and one number.', 'VALIDATION_ERROR');
  }
  if (!inviteCode && !householdName) {
    throw new HttpError(400, 'Provide a household name or an invite code.', 'VALIDATION_ERROR');
  }
  if (householdName.length > 120) {
    throw new HttpError(400, 'Household name must be at most 120 characters.', 'VALIDATION_ERROR');
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    const existing = await client.query('SELECT id FROM users WHERE phone_number = $1', [phoneNumber]);
    if (existing.rowCount) {
      throw new HttpError(409, 'An account with this phone number already exists.', 'PHONE_IN_USE');
    }

    let household;
    let role = 'ADMIN';
    if (inviteCode) {
      const result = await client.query(
        'SELECT id, name FROM households WHERE invite_code = $1 FOR UPDATE',
        [inviteCode.toUpperCase()],
      );
      if (!result.rowCount) {
        throw new HttpError(400, 'That household invite code is invalid.', 'INVALID_INVITE_CODE');
      }
      household = result.rows[0];
      role = 'MEMBER';
    } else {
      household = {
        id: randomUUID(),
        name: householdName,
        invite_code: randomBytes(6).toString('hex').toUpperCase(),
      };
      await client.query(
        'INSERT INTO households (id, name, invite_code) VALUES ($1, $2, $3)',
        [household.id, household.name, household.invite_code],
      );
    }

    const user = {
      id: randomUUID(),
      household_id: household.id,
      phone_number: phoneNumber,
      password_hash: await bcrypt.hash(password, 12),
      full_name: fullName,
      role,
    };
    await client.query(
      `INSERT INTO users (id, household_id, phone_number, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [user.id, user.household_id, user.phone_number, user.password_hash, user.full_name, user.role],
    );
    await client.query('COMMIT');

    res.status(201).json({
      token: signToken(user),
      user: userResponse(user),
      household: { id: household.id, name: household.name, inviteCode: household.invite_code ?? null },
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Registration transaction rollback failed:', rollbackError);
    }
    if (error.code === '23505' && error.constraint === 'users_phone_number_key') {
      throw new HttpError(409, 'An account with this phone number already exists.', 'PHONE_IN_USE');
    }
    throw error;
  } finally {
    client.release();
  }
};

export const login = async (req, res) => {
  const phoneNumber = normalizePhone(req.body.phoneNumber);
  const password = parsePassword(req.body.password);
  const result = await db.query(
    `SELECT u.id, u.household_id, u.phone_number, u.password_hash, u.full_name, u.role
     FROM users u WHERE u.phone_number = $1`,
    [phoneNumber],
  );
  if (!result.rowCount) {
    throw new HttpError(404, 'No account uses this phone number. You can create an account.', 'USER_NOT_FOUND');
  }

  const user = result.rows[0];
  if (!await bcrypt.compare(password, user.password_hash)) {
    throw new HttpError(401, 'Phone number or password is incorrect.', 'INVALID_CREDENTIALS');
  }
  res.json({ token: signToken(user), user: userResponse(user) });
};
