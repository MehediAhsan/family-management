import db from '../config/db.js';
import { HttpError, requireString, requireUuid } from '../utils/http.js';

const phonePattern = /^\+?[0-9][0-9\s().-]{6,30}$/;

const normalizePhone = (value) => {
  const phone = requireString(value, 'Phone number', { max: 32 });
  if (!phonePattern.test(phone)) {
    throw new HttpError(400, 'Enter a valid phone number.', 'VALIDATION_ERROR');
  }
  return phone.replace(/[\s().-]/g, '');
};

export const getProfile = async (req, res) => {
  const result = await db.query(
    `SELECT u.id, u.full_name AS "fullName", u.phone_number AS "phoneNumber",
            u.role, u.bio, u.emergency_info AS "emergencyInfo",
            h.id AS "householdId", h.name AS "householdName", h.invite_code AS "inviteCode"
     FROM users u LEFT JOIN households h ON h.id = u.household_id
     WHERE u.id = $1`,
    [req.user.sub],
  );
  if (!result.rowCount) throw new HttpError(404, 'User profile not found.', 'USER_NOT_FOUND');
  const row = result.rows[0];
  res.json({
    user: {
      id: row.id,
      fullName: row.fullName,
      phoneNumber: row.phoneNumber,
      role: row.role,
      bio: row.bio,
      emergencyInfo: row.emergencyInfo,
      household: row.householdId ? {
        id: row.householdId,
        name: row.householdName,
        inviteCode: row.inviteCode,
      } : null,
    },
  });
};

export const listHouseholdUsers = async (req, res) => {
  const result = await db.query(
    `SELECT id, full_name AS "fullName", phone_number AS "phoneNumber", role
     FROM users WHERE household_id = $1 ORDER BY full_name`,
    [req.user.householdId],
  );
  res.json({ users: result.rows });
};

export const updateProfile = async (req, res) => {
  const fullName = requireString(req.body.fullName, 'Full name', { max: 120 });
  const phoneNumber = normalizePhone(req.body.phoneNumber);
  const bio = typeof req.body.bio === 'string' ? req.body.bio.trim() : '';
  const emergencyInfo = typeof req.body.emergencyInfo === 'string' ? req.body.emergencyInfo.trim() : '';
  if (bio.length > 2000 || emergencyInfo.length > 2000) {
    throw new HttpError(400, 'Bio and emergency information must be at most 2000 characters.', 'VALIDATION_ERROR');
  }

  try {
    const result = await db.query(
      `UPDATE users SET full_name = $2, phone_number = $3, bio = $4, emergency_info = $5
       WHERE id = $1
       RETURNING id, full_name AS "fullName", phone_number AS "phoneNumber",
                 role, bio, emergency_info AS "emergencyInfo"`,
      [req.user.sub, fullName, phoneNumber, bio, emergencyInfo],
    );
    if (!result.rowCount) throw new HttpError(404, 'User profile not found.', 'USER_NOT_FOUND');
    res.json({ user: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'That phone number is already in use.', 'PHONE_IN_USE');
    }
    throw error;
  }
};

export const updateUserRole = async (req, res) => {
  const id = requireUuid(req.params.id, 'User ID');
  const { role } = req.body;
  if (!['ADMIN', 'MEMBER'].includes(role)) {
    throw new HttpError(400, 'Role must be ADMIN or MEMBER.', 'VALIDATION_ERROR');
  }
  if (id === req.user.sub && role !== req.user.role) {
    throw new HttpError(400, 'An admin cannot change their own role.', 'SELF_ROLE_CHANGE');
  }
  const result = await db.query(
    `UPDATE users SET role = $3 WHERE id = $1 AND household_id = $2
     RETURNING id, full_name AS "fullName", role`,
    [id, req.user.householdId, role],
  );
  if (!result.rowCount) throw new HttpError(404, 'Household member not found.', 'USER_NOT_FOUND');
  res.json({ user: result.rows[0] });
};
