const pool = require('../config/db');

function mapStudentRow(row) {
  return {
    student_id: row.student_id,
    user_id: row.user_id,
    roll: row.roll,
    name: row.name,
    course: row.course,
    semester: row.semester,
    contact: row.contact,
    email: row.email,
    category: row.category,
    fee_structure_id: row.fee_structure_id,
    status: row.status,
  };
}

// GET all students
exports.getAllStudents = async (req, res) => {
  try {
    const { course, status, search } = req.query;
    let query = `
      SELECT s.student_id, s.user_id, s.roll_number AS roll, s.full_name AS name,
             s.course, s.semester_year AS semester, s.contact_number AS contact,
             s.email, s.category, s.fee_structure_id, s.status
      FROM students s
      WHERE 1 = 1
    `;
    const params = [];

    if (course) {
      params.push(course);
      query += ` AND s.course = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${String(search).trim()}%`);
      query += ` AND (
        LOWER(s.full_name) LIKE LOWER($${params.length}) OR
        LOWER(s.roll_number) LIKE LOWER($${params.length}) OR
        LOWER(s.course) LIKE LOWER($${params.length})
      )`;
    }

    query += ' ORDER BY s.student_id';

    const result = await pool.query(query, params);
    const students = result.rows.map(mapStudentRow);

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch students.' });
  }
};

// GET student by ID
exports.getStudentById = async (req, res) => {
  try {
    const studentResult = await pool.query(`
      SELECT s.student_id, s.user_id, s.roll_number AS roll, s.full_name AS name,
             s.course, s.semester_year AS semester, s.contact_number AS contact,
             s.email, s.category, s.fee_structure_id, s.status,
             fs.total_amount
      FROM students s
      LEFT JOIN fee_structures fs ON fs.fee_structure_id = s.fee_structure_id
      WHERE s.student_id = $1
    `, [req.params.id]);

    const studentRow = studentResult.rows[0];
    if (!studentRow) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const student = mapStudentRow(studentRow);
    const paymentsResult = await pool.query(
      'SELECT COALESCE(SUM(amount_paid), 0) AS paid FROM payments WHERE student_id = $1 AND status = $2',
      [req.params.id, 'success']
    );

    const total = Number(studentRow.total_amount || 0);
    const paid = Number(paymentsResult.rows[0]?.paid || 0);
    const pending = Math.max(0, total - paid);

    return res.json({ success: true, student, financialSummary: { total, paid, pending } });
  } catch (error) {
    console.error('Get student by ID error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch student details.' });
  }
};

// POST add new student (Admin & Staff permission)
exports.createStudent = async (req, res) => {
  try {
    const { name, roll, course, semester, contact, email, category, fee_structure_id } = req.body;
    if (!name || !roll || !course || !semester) {
      return res.status(400).json({ success: false, message: 'Name, Roll number, Course, and Semester are required.' });
    }

    const feeId = Number(fee_structure_id) || 1;
    const studentEmail = email || `${String(roll).toLowerCase()}@fms.edu`;
    const newStudent = await pool.query(`
      INSERT INTO students (user_id, roll_number, full_name, course, semester_year, contact_number, email, category, fee_structure_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
      RETURNING student_id, user_id, roll_number AS roll, full_name AS name,
                course, semester_year AS semester, contact_number AS contact,
                email, category, fee_structure_id, status
    `, [null, roll, name, course, semester, contact || '9876543210', studentEmail, category || 'regular', feeId]);

    const student = mapStudentRow(newStudent.rows[0]);
    return res.status(201).json({
      success: true,
      message: `Student ${name} successfully registered in ${course} (${semester})!`,
      student,
    });
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ success: false, message: 'Unable to create student.' });
  }
};

// PUT update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, roll, course, semester, contact, email, category, fee_structure_id, status } = req.body;
    const fields = [];
    const params = [];

    if (name) { fields.push('full_name = $' + (params.length + 1)); params.push(name); }
    if (roll) { fields.push('roll_number = $' + (params.length + 1)); params.push(roll); }
    if (course) { fields.push('course = $' + (params.length + 1)); params.push(course); }
    if (semester) { fields.push('semester_year = $' + (params.length + 1)); params.push(semester); }
    if (contact) { fields.push('contact_number = $' + (params.length + 1)); params.push(contact); }
    if (email) { fields.push('email = $' + (params.length + 1)); params.push(email); }
    if (category) { fields.push('category = $' + (params.length + 1)); params.push(category); }
    if (fee_structure_id) { fields.push('fee_structure_id = $' + (params.length + 1)); params.push(Number(fee_structure_id)); }
    if (status) { fields.push('status = $' + (params.length + 1)); params.push(status); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields supplied for update.' });
    }

    params.push(req.params.id);
    const result = await pool.query(`
      UPDATE students
      SET ${fields.join(', ')}
      WHERE student_id = $${params.length}
      RETURNING student_id, user_id, roll_number AS roll, full_name AS name,
                course, semester_year AS semester, contact_number AS contact,
                email, category, fee_structure_id, status
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    return res.json({
      success: true,
      message: 'Student updated successfully!',
      student: mapStudentRow(result.rows[0]),
    });
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ success: false, message: 'Unable to update student.' });
  }
};
