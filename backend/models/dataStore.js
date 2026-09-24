/**
 * Backend Data Store & In-Memory Database
 * Seeded with full college branches and transactions
 */

const dataStore = {
  users: [
    { user_id: 1, username: 'saiprakash', email: 'saiprakash9813@gmail.com', password: 'Sai@1978', role: 'admin', name: 'Sai Prakash (Admin)' },
    { user_id: 2, username: 'admin', email: 'admin@fms.edu', password: 'Sai@1978', role: 'admin', name: 'Dr. Ramesh Patel' },
    { user_id: 3, username: 'staff', email: 'staff@fms.edu', password: 'demo123', role: 'staff', name: 'Mrs. Sunita Verma' },
    { user_id: 4, username: 'arjun', email: 'student@fms.edu', password: 'demo123', role: 'student', name: 'Arjun Sharma', student_id: 1 },
  ],

  courses: [
    'B.Tech CSE', 'B.Tech ECE', 'B.Tech Mechanical', 'B.Tech Civil',
    'B.Tech EEE', 'B.Tech IT', 'B.Tech AI & DS', 'B.Tech Chemical',
    'B.Tech Biotechnology', 'B.Sc Computer Science', 'B.Sc Mathematics',
    'B.Sc Physics', 'B.Sc Chemistry', 'BCA', 'MCA', 'B.Com General',
    'B.Com Computers', 'B.Com Honours', 'BBA', 'MBA', 'M.Tech CSE', 'M.Tech VLSI'
  ],

  students: [
    { student_id: 1, user_id: 4, roll: 'BTC2301', name: 'Arjun Sharma', course: 'B.Tech CSE', semester: 'Sem 5', contact: '9876543210', fee_structure_id: 1, category: 'regular', status: 'active', email: 'student@fms.edu' },
    { student_id: 2, user_id: null, roll: 'BTC2302', name: 'Priya Singh', course: 'B.Tech CSE', semester: 'Sem 5', contact: '9876543211', fee_structure_id: 1, category: 'regular', status: 'active', email: 'priya@fms.edu' },
    { student_id: 3, user_id: null, roll: 'ECE2401', name: 'Rahul Varma', course: 'B.Tech ECE', semester: 'Sem 3', contact: '9876543230', fee_structure_id: 9, category: 'regular', status: 'active', email: 'rahul.ece@fms.edu' },
    { student_id: 4, user_id: null, roll: 'MEC2401', name: 'Neha Kulkarni', course: 'B.Tech Mechanical', semester: 'Sem 3', contact: '9876543231', fee_structure_id: 10, category: 'regular', status: 'active', email: 'neha.mech@fms.edu' },
    { student_id: 5, user_id: null, roll: 'CIV2401', name: 'Manoj Kumar', course: 'B.Tech Civil', semester: 'Sem 1', contact: '9876543232', fee_structure_id: 11, category: 'regular', status: 'active', email: 'manoj.civil@fms.edu' },
    { student_id: 6, user_id: null, roll: 'BSC2401', name: 'Aishwarya Roy', course: 'B.Sc Computer Science', semester: 'Sem 1', contact: '9876543233', fee_structure_id: 12, category: 'regular', status: 'active', email: 'aish.bsc@fms.edu' },
  ],

  fee_structures: [
    { fee_structure_id: 1, name: 'B.Tech CSE – Sem 5', course: 'B.Tech CSE', semester: 'Sem 5', total_amount: 67500 },
    { fee_structure_id: 2, name: 'MBA – Sem 3', course: 'MBA', semester: 'Sem 3', total_amount: 80500 },
    { fee_structure_id: 3, name: 'BCA – Sem 5', course: 'BCA', semester: 'Sem 5', total_amount: 47000 },
    { fee_structure_id: 9, name: 'B.Tech ECE – Sem 3', course: 'B.Tech ECE', semester: 'Sem 3', total_amount: 63000 },
    { fee_structure_id: 10, name: 'B.Tech Mechanical – Sem 3', course: 'B.Tech Mechanical', semester: 'Sem 3', total_amount: 60000 },
    { fee_structure_id: 11, name: 'B.Tech Civil – Sem 1', course: 'B.Tech Civil', semester: 'Sem 1', total_amount: 58000 },
    { fee_structure_id: 12, name: 'B.Sc Computer Science – Sem 1', course: 'B.Sc Computer Science', semester: 'Sem 1', total_amount: 38000 },
  ],

  fee_heads: [
    { fee_head_id: 1, fee_structure_id: 1, head_name: 'Tuition Fee', amount: 45000, due_date: '2026-07-31' },
    { fee_head_id: 2, fee_structure_id: 1, head_name: 'Hostel Fee', amount: 15000, due_date: '2026-07-31' },
    { fee_head_id: 3, fee_structure_id: 1, head_name: 'Transport Fee', amount: 5000, due_date: '2026-07-31' },
    { fee_head_id: 4, fee_structure_id: 1, head_name: 'Exam Fee', amount: 2000, due_date: '2026-09-30' },
    { fee_head_id: 5, fee_structure_id: 1, head_name: 'Library Fine', amount: 500, due_date: '2026-08-15' },
    { fee_head_id: 14, fee_structure_id: 9, head_name: 'Tuition Fee', amount: 42000, due_date: '2026-07-31' },
    { fee_head_id: 15, fee_structure_id: 9, head_name: 'Lab Fee', amount: 15000, due_date: '2026-07-31' },
  ],

  payments: [
    { payment_id: 1, student_id: 1, fee_head_id: 1, amount_paid: 45000, payment_mode: 'online', gateway: 'Razorpay', transaction_id: 'TXN2026080001', payment_date: '2026-08-01T10:23:00', status: 'success', recorded_by: 'student' },
    { payment_id: 2, student_id: 1, fee_head_id: 2, amount_paid: 15000, payment_mode: 'online', gateway: 'PhonePe UPI', transaction_id: 'TXN2026080002', payment_date: '2026-08-01T10:35:00', status: 'success', recorded_by: 'student' },
  ],

  receipts: [
    { receipt_id: 1, payment_id: 1, receipt_number: 'RCP-2026-0001', generated_at: '2026-08-01T10:23:05' },
    { receipt_id: 2, payment_id: 2, receipt_number: 'RCP-2026-0002', generated_at: '2026-08-01T10:35:05' },
  ],

  audit_logs: [
    { log_id: 1, user_id: 1, action: 'Admin Sai Prakash logged into FMS API', entity: 'Auth', timestamp: new Date().toISOString() }
  ]
};

module.exports = dataStore;
