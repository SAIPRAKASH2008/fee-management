const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const statsQuery = await pool.query(`
      SELECT
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE status = 'success'), 0) AS total_collected,
        COALESCE((SELECT COUNT(*)::int FROM students WHERE status = 'active'), 0) AS total_students,
        COALESCE((SELECT COUNT(*)::int FROM payments), 0) AS total_transactions,
        COALESCE((SELECT COUNT(*)::int FROM (SELECT DISTINCT course FROM fee_structures) AS branches), 0) AS available_branches
    `);

    const stats = statsQuery.rows[0];
    return res.json({
      success: true,
      stats: {
        totalCollected: Number(stats.total_collected || 0),
        totalStudents: Number(stats.total_students || 0),
        totalTransactions: Number(stats.total_transactions || 0),
        availableBranches: Number(stats.available_branches || 0)
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch dashboard statistics.' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.log_id, a.user_id, a.action, a.entity_affected AS entity, a.timestamp, u.name AS user_name
      FROM audit_logs a
      LEFT JOIN users u ON u.user_id = a.user_id
      ORDER BY a.timestamp DESC
    `);

    return res.json({ success: true, count: result.rows.length, logs: result.rows });
  } catch (error) {
    console.error('Audit logs error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch audit logs.' });
  }
};
