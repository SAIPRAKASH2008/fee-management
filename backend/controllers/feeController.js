const pool = require('../config/db');

exports.getFeeStructures = async (req, res) => {
  try {
    const { course, semester } = req.query;
    let query = 'SELECT fee_structure_id, name, course, semester_year AS semester, total_amount FROM fee_structures WHERE 1 = 1';
    const params = [];

    if (course) {
      params.push(course);
      query += ` AND course = $${params.length}`;
    }

    if (semester) {
      params.push(semester);
      query += ` AND semester_year = $${params.length}`;
    }

    query += ' ORDER BY fee_structure_id';
    const result = await pool.query(query, params);

    return res.json({ success: true, count: result.rows.length, feeStructures: result.rows });
  } catch (error) {
    console.error('Get fee structures error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch fee structures.' });
  }
};

exports.getFeeHeadsByStructure = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT fee_head_id, fee_structure_id, head_name, amount, due_date FROM fee_heads WHERE fee_structure_id = $1 ORDER BY fee_head_id',
      [req.params.id]
    );

    return res.json({ success: true, count: result.rows.length, feeHeads: result.rows });
  } catch (error) {
    console.error('Get fee heads error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch fee heads.' });
  }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const { name, course, semester, total_amount, fee_heads } = req.body;
    if (!name || !course || !semester || !total_amount) {
      return res.status(400).json({ success: false, message: 'All fee structure fields are required.' });
    }

    const structureResult = await pool.query(
      `INSERT INTO fee_structures (name, course, semester_year, total_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING fee_structure_id, name, course, semester_year AS semester, total_amount`,
      [name, course, semester, Number(total_amount)]
    );

    const newFS = structureResult.rows[0];

    if (Array.isArray(fee_heads)) {
      for (const head of fee_heads) {
        await pool.query(
          `INSERT INTO fee_heads (fee_structure_id, head_name, amount, due_date)
           VALUES ($1, $2, $3, $4)`,
          [newFS.fee_structure_id, head.head_name, Number(head.amount), head.due_date || '2026-07-31']
        );
      }
    }

    return res.status(201).json({ success: true, message: 'Fee structure created successfully!', feeStructure: newFS });
  } catch (error) {
    console.error('Create fee structure error:', error);
    return res.status(500).json({ success: false, message: 'Unable to create fee structure.' });
  }
};
