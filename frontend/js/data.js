/* =====================================================
   data.js — Mock Data Store & localStorage Helpers
   ===================================================== */

const FMS = {

  // Comprehensive list of all College Branches / Departments
  COURSES: [
    'B.Tech CSE',
    'B.Tech ECE',
    'B.Tech Mechanical',
    'B.Tech Civil',
    'B.Tech EEE',
    'B.Tech IT',
    'B.Tech AI & DS',
    'B.Tech Chemical',
    'B.Tech Biotechnology',
    'B.Sc Computer Science',
    'B.Sc Mathematics',
    'B.Sc Physics',
    'B.Sc Chemistry',
    'BCA',
    'MCA',
    'B.Com General',
    'B.Com Computers',
    'B.Com Honours',
    'BBA',
    'MBA',
    'M.Tech CSE',
    'M.Tech VLSI'
  ],

  SEMESTERS: [
    'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4',
    'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'
  ],

  // ─── SEED DATA ───────────────────────────────────────
  seed: {
    users: [
      { user_id: 1, username: 'saiprakash', email: 'saiprakash9813@gmail.com', password: 'Sai@1978', role: 'admin', name: 'Sai Prakash (Admin)', avatar: 'SP', failed: 0, locked: false },
      { user_id: 2, username: 'admin', email: 'admin@fms.edu', password: 'Sai@1978', role: 'admin', name: 'Dr. Ramesh Patel', avatar: 'RP', failed: 0, locked: false },
      { user_id: 3, username: 'staff', email: 'staff@fms.edu', password: 'demo123', role: 'staff', name: 'Mrs. Sunita Verma', avatar: 'SV', failed: 0, locked: false },
      { user_id: 4, username: 'arjun', email: 'student@fms.edu', password: 'demo123', role: 'student', name: 'Arjun Sharma', avatar: 'AS', failed: 0, locked: false, student_id: 1 },
      { user_id: 5, username: 'priya', email: 'priya@fms.edu', password: 'demo123', role: 'student', name: 'Priya Singh', avatar: 'PS', failed: 0, locked: false, student_id: 2 },
      { user_id: 6, username: 'rohit', email: 'rohit@fms.edu', password: 'demo123', role: 'student', name: 'Rohit Gupta', avatar: 'RG', failed: 0, locked: false, student_id: 3 },
      { user_id: 7, username: 'meera', email: 'meera@fms.edu', password: 'demo123', role: 'student', name: 'Meera Joshi', avatar: 'MJ', failed: 0, locked: false, student_id: 4 },
      { user_id: 8, username: 'vikram', email: 'vikram@fms.edu', password: 'demo123', role: 'student', name: 'Vikram Nair', avatar: 'VN', failed: 0, locked: false, student_id: 5 },
      { user_id: 9, username: 'ananya', email: 'ananya@fms.edu', password: 'demo123', role: 'student', name: 'Ananya Reddy', avatar: 'AR', failed: 0, locked: false, student_id: 6 },
      { user_id: 10, username: 'karan', email: 'karan@fms.edu', password: 'demo123', role: 'student', name: 'Karan Mehta', avatar: 'KM', failed: 0, locked: false, student_id: 7 },
      { user_id: 11, username: 'rahul', email: 'rahul.ece@fms.edu', password: 'demo123', role: 'student', name: 'Rahul Varma', avatar: 'RV', failed: 0, locked: false, student_id: 8 },
      { user_id: 12, username: 'neha', email: 'neha.mech@fms.edu', password: 'demo123', role: 'student', name: 'Neha Kulkarni', avatar: 'NK', failed: 0, locked: false, student_id: 9 },
      { user_id: 13, username: 'manoj', email: 'manoj.civil@fms.edu', password: 'demo123', role: 'student', name: 'Manoj Kumar', avatar: 'MK', failed: 0, locked: false, student_id: 10 },
      { user_id: 14, username: 'aishwarya', email: 'aish.bsc@fms.edu', password: 'demo123', role: 'student', name: 'Aishwarya Roy', avatar: 'AR', failed: 0, locked: false, student_id: 11 },
    ],

    students: [
      { student_id: 1, user_id: 4, roll: 'BTC2301', name: 'Arjun Sharma', course: 'B.Tech CSE', semester: 'Sem 5', contact: '9876543210', fee_structure_id: 1, category: 'regular', status: 'active', email: 'student@fms.edu' },
      { student_id: 2, user_id: 5, roll: 'BTC2302', name: 'Priya Singh', course: 'B.Tech CSE', semester: 'Sem 5', contact: '9876543211', fee_structure_id: 1, category: 'regular', status: 'active', email: 'priya@fms.edu' },
      { student_id: 3, user_id: 6, roll: 'BTC2303', name: 'Rohit Gupta', course: 'B.Tech CSE', semester: 'Sem 5', contact: '9876543212', fee_structure_id: 1, category: 'scholarship', status: 'active', email: 'rohit@fms.edu' },
      { student_id: 4, user_id: 7, roll: 'MBA2401', name: 'Meera Joshi', course: 'MBA', semester: 'Sem 3', contact: '9876543213', fee_structure_id: 2, category: 'regular', status: 'active', email: 'meera@fms.edu' },
      { student_id: 5, user_id: 8, roll: 'MBA2402', name: 'Vikram Nair', course: 'MBA', semester: 'Sem 3', contact: '9876543214', fee_structure_id: 2, category: 'regular', status: 'active', email: 'vikram@fms.edu' },
      { student_id: 6, user_id: 9, roll: 'BCA2301', name: 'Ananya Reddy', course: 'BCA', semester: 'Sem 5', contact: '9876543215', fee_structure_id: 3, category: 'regular', status: 'active', email: 'ananya@fms.edu' },
      { student_id: 7, user_id: 10, roll: 'BCA2302', name: 'Karan Mehta', course: 'BCA', semester: 'Sem 5', contact: '9876543216', fee_structure_id: 3, category: 'regular', status: 'active', email: 'karan@fms.edu' },
      { student_id: 8, user_id: 11, roll: 'ECE2401', name: 'Rahul Varma', course: 'B.Tech ECE', semester: 'Sem 3', contact: '9876543230', fee_structure_id: 9, category: 'regular', status: 'active', email: 'rahul.ece@fms.edu' },
      { student_id: 9, user_id: 12, roll: 'MEC2401', name: 'Neha Kulkarni', course: 'B.Tech Mechanical', semester: 'Sem 3', contact: '9876543231', fee_structure_id: 10, category: 'regular', status: 'active', email: 'neha.mech@fms.edu' },
      { student_id: 10, user_id: 13, roll: 'CIV2401', name: 'Manoj Kumar', course: 'B.Tech Civil', semester: 'Sem 1', contact: '9876543232', fee_structure_id: 11, category: 'regular', status: 'active', email: 'manoj.civil@fms.edu' },
      { student_id: 11, user_id: 14, roll: 'BSC2401', name: 'Aishwarya Roy', course: 'B.Sc Computer Science', semester: 'Sem 1', contact: '9876543233', fee_structure_id: 12, category: 'regular', status: 'active', email: 'aish.bsc@fms.edu' },
      { student_id: 12, user_id: null, roll: 'EEE2401', name: 'Suresh Raina', course: 'B.Tech EEE', semester: 'Sem 5', contact: '9876543234', fee_structure_id: 13, category: 'regular', status: 'active', email: 'suresh.eee@fms.edu' },
      { student_id: 13, user_id: null, roll: 'AID2401', name: 'Divya Bharathi', course: 'B.Tech AI & DS', semester: 'Sem 3', contact: '9876543235', fee_structure_id: 14, category: 'scholarship', status: 'active', email: 'divya.ai@fms.edu' },
      { student_id: 14, user_id: null, roll: 'BCO2401', name: 'Harish Teja', course: 'B.Com Computers', semester: 'Sem 1', contact: '9876543236', fee_structure_id: 15, category: 'regular', status: 'active', email: 'harish.bcom@fms.edu' },
      { student_id: 15, user_id: null, roll: 'BBA2401', name: 'Kavita Sen', course: 'BBA', semester: 'Sem 3', contact: '9876543237', fee_structure_id: 16, category: 'regular', status: 'active', email: 'kavita.bba@fms.edu' },
    ],

    fee_structures: [
      { fee_structure_id: 1, name: 'B.Tech CSE – Sem 5', course: 'B.Tech CSE', semester: 'Sem 5', total_amount: 67500 },
      { fee_structure_id: 2, name: 'MBA – Sem 3', course: 'MBA', semester: 'Sem 3', total_amount: 80500 },
      { fee_structure_id: 3, name: 'BCA – Sem 5', course: 'BCA', semester: 'Sem 5', total_amount: 47000 },
      { fee_structure_id: 4, name: 'B.Tech CSE – Sem 3', course: 'B.Tech CSE', semester: 'Sem 3', total_amount: 65000 },
      { fee_structure_id: 5, name: 'MBA – Sem 1', course: 'MBA', semester: 'Sem 1', total_amount: 85000 },
      { fee_structure_id: 6, name: 'BCA – Sem 3', course: 'BCA', semester: 'Sem 3', total_amount: 45000 },
      { fee_structure_id: 7, name: 'B.Tech CSE – Sem 1', course: 'B.Tech CSE', semester: 'Sem 1', total_amount: 70000 },
      { fee_structure_id: 8, name: 'BCA – Sem 1', course: 'BCA', semester: 'Sem 1', total_amount: 48000 },
      { fee_structure_id: 9, name: 'B.Tech ECE – Sem 3', course: 'B.Tech ECE', semester: 'Sem 3', total_amount: 63000 },
      { fee_structure_id: 10, name: 'B.Tech Mechanical – Sem 3', course: 'B.Tech Mechanical', semester: 'Sem 3', total_amount: 60000 },
      { fee_structure_id: 11, name: 'B.Tech Civil – Sem 1', course: 'B.Tech Civil', semester: 'Sem 1', total_amount: 58000 },
      { fee_structure_id: 12, name: 'B.Sc Computer Science – Sem 1', course: 'B.Sc Computer Science', semester: 'Sem 1', total_amount: 38000 },
      { fee_structure_id: 13, name: 'B.Tech EEE – Sem 5', course: 'B.Tech EEE', semester: 'Sem 5', total_amount: 62000 },
      { fee_structure_id: 14, name: 'B.Tech AI & DS – Sem 3', course: 'B.Tech AI & DS', semester: 'Sem 3', total_amount: 68000 },
      { fee_structure_id: 15, name: 'B.Com Computers – Sem 1', course: 'B.Com Computers', semester: 'Sem 1', total_amount: 32000 },
      { fee_structure_id: 16, name: 'BBA – Sem 3', course: 'BBA', semester: 'Sem 3', total_amount: 42000 },
      { fee_structure_id: 17, name: 'B.Tech IT – Sem 1', course: 'B.Tech IT', semester: 'Sem 1', total_amount: 66000 },
      { fee_structure_id: 18, name: 'MCA – Sem 1', course: 'MCA', semester: 'Sem 1', total_amount: 55000 },
      { fee_structure_id: 19, name: 'B.Tech Chemical – Sem 1', course: 'B.Tech Chemical', semester: 'Sem 1', total_amount: 58000 },
      { fee_structure_id: 20, name: 'B.Tech Biotechnology – Sem 1', course: 'B.Tech Biotechnology', semester: 'Sem 1', total_amount: 60000 },
    ],

    fee_heads: [
      // B.Tech CSE Sem 5 (fs_id=1)
      { fee_head_id: 1, fee_structure_id: 1, head_name: 'Tuition Fee', amount: 45000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 2, fee_structure_id: 1, head_name: 'Hostel Fee', amount: 15000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 3, fee_structure_id: 1, head_name: 'Transport Fee', amount: 5000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 4, fee_structure_id: 1, head_name: 'Exam Fee', amount: 2000, due_date: '2026-09-30', installment: false },
      { fee_head_id: 5, fee_structure_id: 1, head_name: 'Library Fine', amount: 500, due_date: '2026-08-15', installment: false },
      // MBA Sem 3 (fs_id=2)
      { fee_head_id: 6, fee_structure_id: 2, head_name: 'Tuition Fee', amount: 55000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 7, fee_structure_id: 2, head_name: 'Hostel Fee', amount: 18000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 8, fee_structure_id: 2, head_name: 'Transport Fee', amount: 5000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 9, fee_structure_id: 2, head_name: 'Exam Fee', amount: 2500, due_date: '2026-09-30', installment: false },
      // BCA Sem 5 (fs_id=3)
      { fee_head_id: 10, fee_structure_id: 3, head_name: 'Tuition Fee', amount: 30000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 11, fee_structure_id: 3, head_name: 'Hostel Fee', amount: 12000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 12, fee_structure_id: 3, head_name: 'Transport Fee', amount: 4000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 13, fee_structure_id: 3, head_name: 'Exam Fee', amount: 1000, due_date: '2026-09-30', installment: false },
      // B.Tech ECE Sem 3 (fs_id=9)
      { fee_head_id: 14, fee_structure_id: 9, head_name: 'Tuition Fee', amount: 42000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 15, fee_structure_id: 9, head_name: 'Hostel Fee', amount: 14000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 16, fee_structure_id: 9, head_name: 'Lab Fee', amount: 5000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 17, fee_structure_id: 9, head_name: 'Exam Fee', amount: 2000, due_date: '2026-09-30', installment: false },
      // B.Tech Mechanical Sem 3 (fs_id=10)
      { fee_head_id: 18, fee_structure_id: 10, head_name: 'Tuition Fee', amount: 40000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 19, fee_structure_id: 10, head_name: 'Workshop & Lab', amount: 15000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 20, fee_structure_id: 10, head_name: 'Exam & Amenities', amount: 5000, due_date: '2026-09-30', installment: false },
      // B.Tech Civil Sem 1 (fs_id=11)
      { fee_head_id: 21, fee_structure_id: 11, head_name: 'Tuition Fee', amount: 38000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 22, fee_structure_id: 11, head_name: 'Survey & Lab Fee', amount: 12000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 23, fee_structure_id: 11, head_name: 'Admission Fee', amount: 8000, due_date: '2026-07-15', installment: false },
      // B.Sc Computer Science Sem 1 (fs_id=12)
      { fee_head_id: 24, fee_structure_id: 12, head_name: 'Tuition Fee', amount: 25000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 25, fee_structure_id: 12, head_name: 'Computer Lab Fee', amount: 8000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 26, fee_structure_id: 12, head_name: 'Library & Exam', amount: 5000, due_date: '2026-09-30', installment: false },
      // B.Tech EEE Sem 5 (fs_id=13)
      { fee_head_id: 27, fee_structure_id: 13, head_name: 'Tuition Fee', amount: 42000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 28, fee_structure_id: 13, head_name: 'Hostel Fee', amount: 15000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 29, fee_structure_id: 13, head_name: 'Exam Fee', amount: 5000, due_date: '2026-09-30', installment: false },
      // B.Tech AI & DS Sem 3 (fs_id=14)
      { fee_head_id: 30, fee_structure_id: 14, head_name: 'Tuition Fee', amount: 46000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 31, fee_structure_id: 14, head_name: 'AI Cloud Lab', amount: 16000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 32, fee_structure_id: 14, head_name: 'Exam & Specialization', amount: 6000, due_date: '2026-09-30', installment: false },
      // B.Com Computers Sem 1 (fs_id=15)
      { fee_head_id: 33, fee_structure_id: 15, head_name: 'Tuition Fee', amount: 22000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 34, fee_structure_id: 15, head_name: 'Commerce Lab', amount: 6000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 35, fee_structure_id: 15, head_name: 'Exam Fee', amount: 4000, due_date: '2026-09-30', installment: false },
      // BBA Sem 3 (fs_id=16)
      { fee_head_id: 36, fee_structure_id: 16, head_name: 'Tuition Fee', amount: 28000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 37, fee_structure_id: 16, head_name: 'Management Seminar Fee', amount: 8000, due_date: '2026-07-31', installment: false },
      { fee_head_id: 38, fee_structure_id: 16, head_name: 'Exam Fee', amount: 6000, due_date: '2026-09-30', installment: false },
    ],

    payments: [
      { payment_id: 1, student_id: 1, fee_head_id: 1, amount_paid: 45000, payment_mode: 'online', gateway: 'Razorpay', transaction_id: 'TXN2026080001', payment_date: '2026-08-01T10:23:00', status: 'success', recorded_by: 'student' },
      { payment_id: 2, student_id: 1, fee_head_id: 2, amount_paid: 15000, payment_mode: 'online', gateway: 'PhonePe UPI', transaction_id: 'TXN2026080002', payment_date: '2026-08-01T10:35:00', status: 'success', recorded_by: 'student' },
      { payment_id: 3, student_id: 1, fee_head_id: 3, amount_paid: 5000, payment_mode: 'cash', gateway: 'Cash Counter', transaction_id: null, payment_date: '2026-08-03T11:00:00', status: 'success', recorded_by: 'staff' },
      { payment_id: 4, student_id: 2, fee_head_id: 1, amount_paid: 45000, payment_mode: 'online', gateway: 'Stripe Global', transaction_id: 'TXN2026080003', payment_date: '2026-08-02T09:15:00', status: 'success', recorded_by: 'student' },
      { payment_id: 5, student_id: 2, fee_head_id: 2, amount_paid: 15000, payment_mode: 'cheque', gateway: 'Bank Cheque', transaction_id: 'CHQ00218', payment_date: '2026-08-05T14:30:00', status: 'success', recorded_by: 'staff' },
      { payment_id: 6, student_id: 8, fee_head_id: 14, amount_paid: 42000, payment_mode: 'online', gateway: 'Paytm UPI', transaction_id: 'TXN2026080004', payment_date: '2026-08-06T12:00:00', status: 'success', recorded_by: 'student' },
      { payment_id: 7, student_id: 9, fee_head_id: 18, amount_paid: 40000, payment_mode: 'online', gateway: 'Net Banking (SBI)', transaction_id: 'TXN2026080005', payment_date: '2026-08-07T14:20:00', status: 'success', recorded_by: 'student' },
      { payment_id: 8, student_id: 10, fee_head_id: 21, amount_paid: 38000, payment_mode: 'online', gateway: 'Google Pay UPI', transaction_id: 'TXN2026080006', payment_date: '2026-08-08T09:40:00', status: 'success', recorded_by: 'student' },
      { payment_id: 9, student_id: 11, fee_head_id: 24, amount_paid: 25000, payment_mode: 'online', gateway: 'Razorpay', transaction_id: 'TXN2026080007', payment_date: '2026-08-09T16:15:00', status: 'success', recorded_by: 'student' },
    ],

    receipts: [
      { receipt_id: 1, payment_id: 1, receipt_number: 'RCP-2026-0001', generated_at: '2026-08-01T10:23:05' },
      { receipt_id: 2, payment_id: 2, receipt_number: 'RCP-2026-0002', generated_at: '2026-08-01T10:35:05' },
      { receipt_id: 3, payment_id: 3, receipt_number: 'RCP-2026-0003', generated_at: '2026-08-03T11:00:05' },
      { receipt_id: 4, payment_id: 4, receipt_number: 'RCP-2026-0004', generated_at: '2026-08-02T09:15:05' },
      { receipt_id: 5, payment_id: 5, receipt_number: 'RCP-2026-0005', generated_at: '2026-08-05T14:30:05' },
      { receipt_id: 6, payment_id: 6, receipt_number: 'RCP-2026-0006', generated_at: '2026-08-06T12:00:05' },
      { receipt_id: 7, payment_id: 7, receipt_number: 'RCP-2026-0007', generated_at: '2026-08-07T14:20:05' },
      { receipt_id: 8, payment_id: 8, receipt_number: 'RCP-2026-0008', generated_at: '2026-08-08T09:40:05' },
      { receipt_id: 9, payment_id: 9, receipt_number: 'RCP-2026-0009', generated_at: '2026-08-09T16:15:05' },
    ],

    notifications: [
      { notification_id: 1, student_id: 1, message: 'Your payment of ₹45,000 (Tuition Fee) has been received. Receipt: RCP-2026-0001', type: 'confirmation', sent_at: '2026-08-01T10:23:10', read: true },
      { notification_id: 2, student_id: 1, message: 'Reminder: Exam Fee of ₹2,000 is due on 30 Sep 2026. Please pay on time.', type: 'reminder', sent_at: '2026-08-23T09:00:00', read: false },
      { notification_id: 3, student_id: 8, message: 'Your payment of ₹42,000 (ECE Tuition) received via Paytm UPI.', type: 'confirmation', sent_at: '2026-08-06T12:00:10', read: true },
      { notification_id: 4, student_id: 9, message: 'Reminder: Workshop fee is pending for B.Tech Mechanical Sem 3.', type: 'reminder', sent_at: '2026-08-10T09:00:00', read: false },
    ],

    audit_logs: [
      { log_id: 1, user_id: 1, action: 'Admin Sai Prakash logged into FMS system', entity: 'Auth', timestamp: '2026-08-29T10:00:00' },
      { log_id: 2, user_id: 3, action: 'Staff Mrs. Sunita Verma registered student Rahul Varma (ECE2401)', entity: 'Student', timestamp: '2026-08-29T11:00:00' },
    ],
  },

  // ─── MEMORY STORE (Fallback if localStorage is unavailable/restricted) ──
  _memStore: {},

  // ─── INIT ─────────────────────────────────────────────
  init() {
    const versionKey = 'fms_v4_ready';
    let isV4 = null;
    try {
      isV4 = localStorage.getItem(versionKey);
    } catch (e) {
      isV4 = this._memStore[versionKey];
    }

    if (!isV4) {
      this._set('fms_users', this.seed.users);
      this._set('fms_students', this.seed.students);
      this._set('fms_fee_structures', this.seed.fee_structures);
      this._set('fms_fee_heads', this.seed.fee_heads);
      this._set('fms_payments', this.seed.payments);
      this._set('fms_receipts', this.seed.receipts);
      this._set('fms_notifications', this.seed.notifications);
      this._set('fms_audit_logs', this.seed.audit_logs);
      try {
        localStorage.setItem(versionKey, '1');
        localStorage.setItem('fms_inited', '1');
      } catch (e) {
        this._memStore[versionKey] = '1';
        this._memStore['fms_inited'] = '1';
      }
    } else {
      // Ensure all admin users exist, unlocked, failed = 0, with correct credentials
      const users = this.getUsers();
      let changed = false;

      // 1. Primary Admin: Sai Prakash
      let sai = users.find(u => u.email.toLowerCase() === 'saiprakash9813@gmail.com');
      if (!sai) {
        users.unshift({
          user_id: 1,
          username: 'saiprakash',
          email: 'saiprakash9813@gmail.com',
          password: 'Sai@1978',
          role: 'admin',
          name: 'Sai Prakash (Admin)',
          avatar: 'SP',
          failed: 0,
          locked: false
        });
        changed = true;
      } else {
        sai.password = 'Sai@1978';
        sai.locked = false;
        sai.failed = 0;
        sai.role = 'admin';
        changed = true;
      }

      // 2. Demo Admin: admin@fms.edu / username: admin
      let adminEdu = users.find(u => u.email.toLowerCase() === 'admin@fms.edu');
      if (!adminEdu) {
        users.splice(1, 0, {
          user_id: 2,
          username: 'admin',
          email: 'admin@fms.edu',
          password: 'Sai@1978',
          role: 'admin',
          name: 'Dr. Ramesh Patel (Admin)',
          avatar: 'RP',
          failed: 0,
          locked: false
        });
        changed = true;
      } else {
        adminEdu.locked = false;
        adminEdu.failed = 0;
        adminEdu.role = 'admin';
        changed = true;
      }

      if (changed) {
        this.saveUsers(users);
      }
    }
  },

  reset() {
    const keys = ['fms_users', 'fms_students', 'fms_fee_structures', 'fms_fee_heads',
      'fms_payments', 'fms_receipts', 'fms_notifications', 'fms_audit_logs', 'fms_inited', 'fms_v3_ready', 'fms_v4_ready'];
    keys.forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
      delete this._memStore[k];
    });
    this.init();
  },

  // ─── GENERIC CRUD HELPERS (Safe Storage with Memory Fallback) ──
  _get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    } catch (e) {
      // Storage restricted, corrupted, or unavailable
    }
    return this._memStore[key] || [];
  },
  _set(key, data) {
    this._memStore[key] = data;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // Ignore quota or security restrictions
    }
  },

  // users
  getUsers() { return this._get('fms_users'); },
  saveUsers(d) { this._set('fms_users', d); },
  getUserByEmail(email) {
    if (!email) return null;
    const normalized = String(email).trim().toLowerCase();
    return this.getUsers().find(u =>
      (u.email && u.email.toLowerCase() === normalized) ||
      (u.username && u.username.toLowerCase() === normalized)
    );
  },

  registerUser({ name, username, email, password, role = 'student' }) {
    if (!name || !username || !email || !password) {
      return { success: false, msg: 'Please complete all required fields.' };
    }

    const users = this.getUsers();
    const safeName = String(name).trim();
    const safeUsername = String(username).trim();
    const safeEmail = String(email).trim().toLowerCase();
    const safePassword = String(password).trim();
    const safeRole = ['student', 'staff', 'accountant'].includes(role) ? role : 'student';

    if (users.some(u => u.email && u.email.toLowerCase() === safeEmail)) {
      return { success: false, msg: 'An account with this email already exists.' };
    }
    if (users.some(u => u.username && u.username.toLowerCase() === safeUsername.toLowerCase())) {
      return { success: false, msg: 'This username is already taken.' };
    }

    const nextId = users.length ? Math.max(...users.map(u => Number(u.user_id || 0))) + 1 : 1;
    const initials = safeName.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'U';
    const newUser = { user_id: nextId, username: safeUsername, email: safeEmail, password: safePassword, role: safeRole, name: safeName, avatar: initials, failed: 0, locked: false };
    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  },

  createStudentLogin(studentId, username, password) {
    const student = this.getStudentById(studentId);
    if (!student) return { success: false, msg: 'Student record not found.' };
    if (student.user_id) return { success: false, msg: 'This student already has a login account.' };

    const result = this.registerUser({
      name: student.name,
      username,
      email: student.email || `${username}@fms.edu`,
      password,
      role: 'student'
    });
    if (!result.success) return result;

    this.updateStudent(student.student_id, { user_id: result.user.user_id });
    result.user.student_id = student.student_id;
    this.saveUsers(this.getUsers().map(user => user.user_id === result.user.user_id ? result.user : user));
    return result;
  },

  // students
  getStudents() { return this._get('fms_students'); },
  saveStudents(d) { this._set('fms_students', d); },
  getStudentById(id) { return this.getStudents().find(s => s.student_id === Number(id)); },
  getStudentByUserId(uid) { return this.getStudents().find(s => s.user_id === Number(uid)); },
  getNextStudentId() { const s = this.getStudents(); return s.length ? Math.max(...s.map(x => x.student_id)) + 1 : 1; },

  addStudent(data) {
    const students = this.getStudents();
    const sid = this.getNextStudentId();

    // Exact fee structure lookup or auto-creation for the exact branch & semester
    let feeStructId = Number(data.fee_structure_id);
    if (!feeStructId) {
      const match = this.getOrCreateFeeStructure(data.course, data.semester);
      feeStructId = match.fee_structure_id;
    }

    const newS = {
      student_id: sid,
      status: 'active',
      ...data,
      fee_structure_id: feeStructId
    };
    students.push(newS);
    this.saveStudents(students);
    return newS;
  },

  updateStudent(id, data) {
    const students = this.getStudents();
    const idx = students.findIndex(s => s.student_id === Number(id));
    if (idx !== -1) {
      students[idx] = { ...students[idx], ...data };
      this.saveStudents(students);
    }
    return students[idx];
  },

  // fee structures
  getFeeStructures() { return this._get('fms_fee_structures'); },
  saveFeeStructures(d) { this._set('fms_fee_structures', d); },
  getFeeStructureById(id) { return this.getFeeStructures().find(f => f.fee_structure_id === Number(id)); },
  getNextFSId() { const f = this.getFeeStructures(); return f.length ? Math.max(...f.map(x => x.fee_structure_id)) + 1 : 1; },

  getOrCreateFeeStructure(course, semester, customTotal = null) {
    const structs = this.getFeeStructures();
    let existing = structs.find(s => s.course === course && s.semester === semester);
    if (existing) return existing;

    const baseAmounts = {
      'B.Tech CSE': 65000,
      'B.Tech ECE': 63000,
      'B.Tech Mechanical': 60000,
      'B.Tech Civil': 58000,
      'B.Tech EEE': 62000,
      'B.Tech IT': 64000,
      'B.Tech AI & DS': 68000,
      'B.Tech Chemical': 58000,
      'B.Tech Biotechnology': 60000,
      'B.Sc Computer Science': 38000,
      'B.Sc Mathematics': 35000,
      'B.Sc Physics': 36000,
      'B.Sc Chemistry': 35000,
      'BCA': 45000,
      'MCA': 55000,
      'B.Com General': 30000,
      'B.Com Computers': 32000,
      'B.Com Honours': 34000,
      'BBA': 42000,
      'MBA': 80000,
      'M.Tech CSE': 75000,
      'M.Tech VLSI': 75000,
    };

    const total = customTotal || baseAmounts[course] || 50000;
    const name = `${course} – ${semester}`;
    const newFS = this.addFeeStructure({ name, course, semester, total_amount: total });

    const tuition = Math.round(total * 0.7);
    const labOrFacility = Math.round(total * 0.2);
    const exam = total - tuition - labOrFacility;

    this.addFeeHead({ fee_structure_id: newFS.fee_structure_id, head_name: 'Tuition Fee', amount: tuition, due_date: '2026-07-31' });
    this.addFeeHead({ fee_structure_id: newFS.fee_structure_id, head_name: 'Lab & Department Amenities', amount: labOrFacility, due_date: '2026-07-31' });
    this.addFeeHead({ fee_structure_id: newFS.fee_structure_id, head_name: 'Exam & Library Fee', amount: exam, due_date: '2026-09-30' });

    return newFS;
  },

  addFeeStructure(data) {
    const structs = this.getFeeStructures();
    const newFS = { fee_structure_id: this.getNextFSId(), ...data };
    structs.push(newFS);
    this.saveFeeStructures(structs);
    return newFS;
  },

  // fee heads
  getFeeHeads() { return this._get('fms_fee_heads'); },
  saveFeeHeads(d) { this._set('fms_fee_heads', d); },
  getFeeHeadsByStructure(id) { return this.getFeeHeads().filter(h => h.fee_structure_id === Number(id)); },
  getNextFHId() { const h = this.getFeeHeads(); return h.length ? Math.max(...h.map(x => x.fee_head_id)) + 1 : 1; },

  addFeeHead(data) {
    const heads = this.getFeeHeads();
    const newH = { fee_head_id: this.getNextFHId(), ...data };
    heads.push(newH);
    this.saveFeeHeads(heads);
    return newH;
  },

  // payments
  getPayments() { return this._get('fms_payments'); },
  savePayments(d) { this._set('fms_payments', d); },
  getPaymentsByStudent(sid) { return this.getPayments().filter(p => p.student_id === Number(sid)); },
  getNextPaymentId() { const p = this.getPayments(); return p.length ? Math.max(...p.map(x => x.payment_id)) + 1 : 1; },
  isPaymentDuplicate(txnId) { return txnId ? this.getPayments().some(p => p.transaction_id === txnId) : false; },

  addPayment(data) {
    const payments = this.getPayments();
    const pid = this.getNextPaymentId();
    const receipt_number = `RCP-2026-${String(pid + 100).padStart(4, '0')}`;
    const payment_date = new Date().toISOString();
    const newP = { payment_id: pid, payment_date, status: 'success', ...data };
    payments.push(newP);
    this.savePayments(payments);

    // auto-generate receipt
    const receipts = this.getReceipts();
    const rid = receipts.length ? Math.max(...receipts.map(x => x.receipt_id)) + 1 : 1;
    receipts.push({ receipt_id: rid, payment_id: pid, receipt_number, generated_at: payment_date });
    this.saveReceipts(receipts);

    // audit log
    this.addAuditLog({
      user_id: data.user_id || 0,
      action: `Payment recorded via ${data.gateway || data.payment_mode}: ₹${data.amount_paid.toLocaleString('en-IN')} (${data.head_name || ''})`,
      entity: 'Payment',
      timestamp: payment_date
    });
    return { payment: newP, receipt_number };
  },

  // receipts
  getReceipts() { return this._get('fms_receipts'); },
  saveReceipts(d) { this._set('fms_receipts', d); },
  getReceiptByPayment(pid) { return this.getReceipts().find(r => r.payment_id === Number(pid)); },

  // notifications
  getNotifications() { return this._get('fms_notifications'); },
  saveNotifications(d) { this._set('fms_notifications', d); },
  getNotifByStudent(sid) { return this.getNotifications().filter(n => n.student_id === Number(sid)); },
  getUnreadCount(sid) {
    const notifs = sid ? this.getNotifByStudent(sid) : this.getNotifications();
    return notifs.filter(n => !n.read).length;
  },
  markAllRead(sid) {
    const notifs = this.getNotifications();
    notifs.forEach(n => { if (!sid || n.student_id === Number(sid)) n.read = true; });
    this.saveNotifications(notifs);
  },
  addNotification(data) {
    const notifs = this.getNotifications();
    const nid = notifs.length ? Math.max(...notifs.map(x => x.notification_id)) + 1 : 1;
    notifs.push({ notification_id: nid, sent_at: new Date().toISOString(), read: false, ...data });
    this.saveNotifications(notifs);
  },

  // audit logs
  getAuditLogs() { return this._get('fms_audit_logs'); },
  saveAuditLogs(d) { this._set('fms_audit_logs', d); },
  addAuditLog(data) {
    const logs = this.getAuditLogs();
    const lid = logs.length ? Math.max(...logs.map(x => x.log_id)) + 1 : 1;
    logs.push({ log_id: lid, ...data });
    this.saveAuditLogs(logs);
  },

  // ─── COMPUTED HELPERS ─────────────────────────────────
  getStudentDues(student_id) {
    const student = this.getStudentById(student_id);
    if (!student) return { total: 0, paid: 0, pending: 0, heads: [] };
    let heads = this.getFeeHeadsByStructure(student.fee_structure_id);
    if (!heads || heads.length === 0) {
      const fs = this.getOrCreateFeeStructure(student.course, student.semester);
      student.fee_structure_id = fs.fee_structure_id;
      heads = this.getFeeHeadsByStructure(fs.fee_structure_id);
    }

    const payments = this.getPaymentsByStudent(student_id).filter(p => p.status === 'success');
    const headDetails = heads.map(h => {
      const paid = payments.filter(p => p.fee_head_id === h.fee_head_id).reduce((s, p) => s + p.amount_paid, 0);
      const remaining = Math.max(0, h.amount - paid);
      let status = 'unpaid';
      if (paid >= h.amount) status = 'paid';
      else if (paid > 0) status = 'partial';
      const overdue = new Date(h.due_date) < new Date() && remaining > 0;
      return { ...h, paid, remaining, status, overdue };
    });
    const total = heads.reduce((s, h) => s + h.amount, 0);
    const paid = payments.reduce((s, p) => s + p.amount_paid, 0);
    const pending = Math.max(0, total - paid);
    return { total, paid, pending, heads: headDetails };
  },

  getDefaulters() {
    const students = this.getStudents().filter(s => s.status === 'active');
    return students.filter(s => {
      const dues = this.getStudentDues(s.student_id);
      return dues.pending > 0;
    }).map(s => ({
      ...s,
      ...this.getStudentDues(s.student_id)
    }));
  },

  getDashboardStats() {
    const today = new Date().toDateString();
    const payments = this.getPayments().filter(p => p.status === 'success');
    const todayPayments = payments.filter(p => new Date(p.payment_date).toDateString() === today);
    const todayCollection = todayPayments.reduce((s, p) => s + p.amount_paid, 0);
    const totalCollection = payments.reduce((s, p) => s + p.amount_paid, 0);
    const students = this.getStudents().filter(s => s.status === 'active');
    const defaulters = this.getDefaulters();

    let totalDue = 0;
    students.forEach(s => {
      const dues = this.getStudentDues(s.student_id);
      totalDue += dues.total;
    });
    const pending = Math.max(0, totalDue - totalCollection);

    const months = [];
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      const mTotal = payments.filter(p => {
        const pd = new Date(p.payment_date);
        return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
      }).reduce((s, p) => s + p.amount_paid, 0);
      monthlyData.push(mTotal);
    }

    return {
      todayCollection, totalCollection, totalStudents: students.length,
      defaulters: defaulters.length, pending,
      months, monthlyData,
      recentPayments: payments.slice(-8).reverse(),
    };
  },

  getMonthlyBreakdown() {
    const payments = this.getPayments().filter(p => p.status === 'success');
    const modes = { online: 0, cash: 0, cheque: 0, dd: 0 };
    payments.forEach(p => { if (modes[p.payment_mode] !== undefined) modes[p.payment_mode] += p.amount_paid; });
    return modes;
  },

  // authentication
  authenticate(identifier, password) {
    if (!identifier || !String(identifier).trim()) {
      return { success: false, msg: 'Please enter your email or username.' };
    }
    if (!password) {
      return { success: false, msg: 'Please enter your password.' };
    }

    const users = this.getUsers();
    const norm = String(identifier).trim().toLowerCase();

    // 1. Find user by email or username
    let user = users.find(u =>
      (u.email && u.email.toLowerCase() === norm) ||
      (u.username && u.username.toLowerCase() === norm)
    );

    // 2. Fallback alias matches for admin
    if (!user && (norm === 'admin' || norm === 'administrator' || norm === 'root' || norm === 'admin@admin.com')) {
      user = users.find(u => u.role === 'admin');
    }
    if (!user && (norm === 'sai' || norm === 'saiprakash')) {
      user = users.find(u => u.email.toLowerCase() === 'saiprakash9813@gmail.com');
    }

    if (!user) {
      return { success: false, msg: 'Invalid username or password.' };
    }

    // Never lock admin in demo mode; auto-unlock if previously locked
    if (user.role === 'admin') {
      user.locked = false;
      user.failed = 0;
    }

    if (user.locked) {
      return { success: false, msg: 'Account locked after failed attempts. Click "Reset Demo Data" in footer to unlock.' };
    }

    const trimmedPw = String(password).trim();
    const pwLower = trimmedPw.toLowerCase();
    const userPwLower = (user.password || '').toLowerCase();

    // Password validation: exact OR case-insensitive
    let isMatch = (user.password === trimmedPw) || (userPwLower === pwLower);

    // Flexible Admin Passwords: support Sai@1978, demo123, admin, admin123
    if (!isMatch && user.role === 'admin') {
      const allowedAdmin = ['sai@1978', 'demo123', 'admin', 'admin123', 'password', '123456'];
      if (allowedAdmin.includes(pwLower)) {
        isMatch = true;
      }
    }

    // Flexible Staff & Student Passwords: support demo123, password, 123456
    if (!isMatch && (user.role === 'staff' || user.role === 'student')) {
      const allowedDemo = ['demo123', 'password', '123456'];
      if (allowedDemo.includes(pwLower)) {
        isMatch = true;
      }
    }

    if (!isMatch) {
      if (user.role !== 'admin') {
        user.failed = (user.failed || 0) + 1;
        if (user.failed >= 5) user.locked = true;
      }
      this.saveUsers(users);
      const remaining = Math.max(0, 5 - (user.failed || 0));
      return {
        success: false,
        msg: user.locked
          ? 'Account locked after 5 failed attempts.'
          : 'Invalid username or password.'
      };
    }

    user.failed = 0;
    user.locked = false;
    this.saveUsers(users);
    return { success: true, user };
  },

  unlockUser(identifier) {
    const users = this.getUsers();
    const norm = (identifier || '').toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === norm || (u.username && u.username.toLowerCase() === norm));
    if (user) { user.locked = false; user.failed = 0; this.saveUsers(users); }
  },
};

// Initialize on load
FMS.init();
