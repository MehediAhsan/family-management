import { randomUUID } from 'node:crypto';
import db from '../config/db.js';
import { HttpError, requireString, requireUuid } from '../utils/http.js';

const moods = new Set(['HAPPY', 'NEUTRAL', 'SAD']);
const entryDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const validateDate = (value) => {
  if (value === undefined || value === '') return new Date().toISOString().slice(0, 10);
  if (typeof value !== 'string' || !entryDatePattern.test(value)
    || Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, 'Date must be a valid YYYY-MM-DD date.', 'VALIDATION_ERROR');
  }
  return value;
};

const parseEntry = (body) => {
  const title = requireString(body.title, 'Title', { max: 160 });
  const content = requireString(body.content, 'Content', { max: 20_000 });
  const mood = body.mood === undefined ? 'NEUTRAL' : body.mood;
  if (!moods.has(mood)) {
    throw new HttpError(400, 'Mood must be HAPPY, NEUTRAL, or SAD.', 'VALIDATION_ERROR');
  }
  if (body.isPrivate !== undefined && typeof body.isPrivate !== 'boolean') {
    throw new HttpError(400, 'Confidentiality must be a boolean value.', 'VALIDATION_ERROR');
  }
  return { title, content, mood, isPrivate: body.isPrivate ?? true, entryDate: validateDate(body.entryDate) };
};

export const listEntries = async (req, res) => {
  const result = await db.query(
    `SELECT d.id, d.user_id AS "userId", u.full_name AS "authorName",
            d.title, d.content, d.mood, d.is_private AS "isPrivate",
            d.entry_date AS "entryDate", d.created_at AS "createdAt",
            d.updated_at AS "updatedAt"
     FROM diary_entries d JOIN users u ON u.id = d.user_id
     WHERE d.user_id = $1 OR (u.household_id = $2 AND d.is_private = FALSE)
     ORDER BY d.entry_date DESC, d.created_at DESC`,
    [req.user.sub, req.user.householdId],
  );
  res.json({ entries: result.rows });
};

export const createEntry = async (req, res) => {
  const entry = parseEntry(req.body);
  const result = await db.query(
    `INSERT INTO diary_entries (id, user_id, title, content, mood, is_private, entry_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, content, mood, is_private AS "isPrivate",
               entry_date AS "entryDate", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [randomUUID(), req.user.sub, entry.title, entry.content, entry.mood, entry.isPrivate, entry.entryDate],
  );
  res.status(201).json({ entry: result.rows[0] });
};

export const updateEntry = async (req, res) => {
  const id = requireUuid(req.params.id, 'Diary entry ID');
  const entry = parseEntry(req.body);
  const result = await db.query(
    `UPDATE diary_entries SET title = $3, content = $4, mood = $5,
       is_private = $6, entry_date = $7, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, title, content, mood, is_private AS "isPrivate",
               entry_date AS "entryDate", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [id, req.user.sub, entry.title, entry.content, entry.mood, entry.isPrivate, entry.entryDate],
  );
  if (!result.rowCount) throw new HttpError(404, 'Diary entry not found.', 'ENTRY_NOT_FOUND');
  res.json({ entry: result.rows[0] });
};

export const deleteEntry = async (req, res) => {
  const id = requireUuid(req.params.id, 'Diary entry ID');
  const result = await db.query(
    'DELETE FROM diary_entries WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.sub],
  );
  if (!result.rowCount) throw new HttpError(404, 'Diary entry not found.', 'ENTRY_NOT_FOUND');
  res.status(204).end();
};
