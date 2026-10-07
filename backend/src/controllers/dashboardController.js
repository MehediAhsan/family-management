import db from '../config/db.js';

export const getDashboard = async (req, res) => {
  const [members, entries, alerts] = await Promise.all([
    db.query(
      'SELECT COUNT(*)::int AS count FROM users WHERE household_id = $1',
      [req.user.householdId],
    ),
    db.query(
      `SELECT COUNT(*)::int AS count FROM diary_entries d
       JOIN users u ON u.id = d.user_id
       WHERE u.household_id = $1 AND d.is_private = FALSE
         AND d.entry_date >= CURRENT_DATE - INTERVAL '6 days'`,
      [req.user.householdId],
    ),
    db.query(
      'SELECT COUNT(*)::int AS count FROM family_alerts WHERE household_id = $1 AND resolved_at IS NULL',
      [req.user.householdId],
    ),
  ]);

  res.json({
    stats: {
      activeFamilyMembers: members.rows[0].count,
      recentDiaryEntries: entries.rows[0].count,
      pendingFamilyAlerts: alerts.rows[0].count,
    },
  });
};
