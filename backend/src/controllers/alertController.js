import { randomUUID } from 'node:crypto';
import db from '../config/db.js';
import { HttpError, requireString, requireUuid } from '../utils/http.js';

export const listAlerts = async (req, res) => {
  const result = await db.query(
    `SELECT a.id, a.title, a.message, a.resolved_at AS "resolvedAt",
            a.created_at AS "createdAt", u.full_name AS "createdBy"
     FROM family_alerts a JOIN users u ON u.id = a.created_by
     WHERE a.household_id = $1 ORDER BY (a.resolved_at IS NULL) DESC, a.created_at DESC`,
    [req.user.householdId],
  );
  res.json({ alerts: result.rows });
};

export const createAlert = async (req, res) => {
  const title = requireString(req.body.title, 'Title', { max: 160 });
  const message = requireString(req.body.message, 'Message', { max: 3000 });
  const result = await db.query(
    `INSERT INTO family_alerts (id, household_id, created_by, title, message)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, message, resolved_at AS "resolvedAt", created_at AS "createdAt"`,
    [randomUUID(), req.user.householdId, req.user.sub, title, message],
  );
  res.status(201).json({ alert: result.rows[0] });
};

export const resolveAlert = async (req, res) => {
  const id = requireUuid(req.params.id, 'Alert ID');
  const result = await db.query(
    `UPDATE family_alerts SET resolved_at = COALESCE(resolved_at, NOW())
     WHERE id = $1 AND household_id = $2
     RETURNING id, title, message, resolved_at AS "resolvedAt", created_at AS "createdAt"`,
    [id, req.user.householdId],
  );
  if (!result.rowCount) throw new HttpError(404, 'Family alert not found.', 'ALERT_NOT_FOUND');
  res.json({ alert: result.rows[0] });
};
