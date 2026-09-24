const pool = require('../config/db');
const crypto = require('crypto');
const Razorpay = require('razorpay');

function getRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

exports.createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay is not configured on the server.' });

    const studentId = Number(req.body.student_id);
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!studentId || items.length === 0) return res.status(400).json({ success: false, message: 'Student and at least one fee item are required.' });

    const feeHeadIds = items.map(item => Number(item.fee_head_id)).filter(Boolean);
    const result = await pool.query(`
      SELECT fh.fee_head_id, fh.head_name, fh.amount,
             COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount_paid ELSE 0 END), 0) AS paid
      FROM fee_heads fh
      LEFT JOIN payments p ON p.fee_head_id = fh.fee_head_id AND p.student_id = $1
      WHERE fh.fee_head_id = ANY($2::int[])
      GROUP BY fh.fee_head_id
    `, [studentId, feeHeadIds]);

    const requested = new Map(items.map(item => [Number(item.fee_head_id), Number(item.amount)]));
    const validItems = result.rows.map(row => {
      const remaining = Math.max(0, Number(row.amount) - Number(row.paid));
      const amount = requested.get(Number(row.fee_head_id));
      if (!amount || amount > remaining) throw new Error(`Invalid amount for ${row.head_name}.`);
      return { fee_head_id: Number(row.fee_head_id), amount, head_name: row.head_name };
    });
    if (validItems.length !== items.length) return res.status(400).json({ success: false, message: 'One or more fee items are invalid.' });

    const amount = validItems.reduce((total, item) => total + item.amount, 0);
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), currency: 'INR', receipt: `fee_${studentId}_${Date.now()}`,
      notes: { student_id: String(studentId), fee_head_ids: feeHeadIds.join(',') },
    });
    return res.status(201).json({ success: true, order: { id: order.id, amount: order.amount, currency: order.currency }, items: validItems, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Unable to create Razorpay order.' });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, student_id, items } = req.body || {};
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !student_id || !Array.isArray(items)) return res.status(400).json({ success: false, message: 'Incomplete Razorpay payment details.' });

  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (!process.env.RAZORPAY_KEY_SECRET || expectedSignature !== razorpay_signature) return res.status(400).json({ success: false, message: 'Razorpay signature verification failed.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const records = [];
    for (const item of items) {
      const amount = Number(item.amount);
      if (!Number(item.fee_head_id) || !amount || amount < 0) throw new Error('Invalid payment item.');
      const balance = await client.query(`
        SELECT fh.amount - COALESCE(SUM(CASE WHEN p.status = 'success' THEN p.amount_paid ELSE 0 END), 0) AS remaining
        FROM fee_heads fh
        LEFT JOIN payments p ON p.fee_head_id = fh.fee_head_id AND p.student_id = $1
        WHERE fh.fee_head_id = $2
        GROUP BY fh.fee_head_id, fh.amount
      `, [Number(student_id), Number(item.fee_head_id)]);
      if (!balance.rows[0] || amount > Math.max(0, Number(balance.rows[0].remaining))) throw new Error('This fee amount is no longer payable. Refresh and try again.');
      const payment = await client.query(`
        INSERT INTO payments (student_id, fee_head_id, amount_paid, payment_mode, gateway, transaction_id, status, recorded_by)
        VALUES ($1, $2, $3, 'online', 'Razorpay', $4, 'success', 'student')
        RETURNING payment_id, student_id, fee_head_id, amount_paid, gateway, transaction_id, payment_date, status
      `, [Number(student_id), Number(item.fee_head_id), amount, `${razorpay_payment_id}_${item.fee_head_id}`]);
      const paymentRow = payment.rows[0];
      const receiptNumber = `RCP-${new Date().getFullYear()}-${String(paymentRow.payment_id).padStart(4, '0')}`;
      const receipt = await client.query(`INSERT INTO receipts (payment_id, receipt_number) VALUES ($1, $2) RETURNING receipt_id, payment_id, receipt_number, generated_at`, [paymentRow.payment_id, receiptNumber]);
      records.push({ payment: paymentRow, receipt: receipt.rows[0] });
    }
    await client.query('COMMIT');
    return res.status(201).json({ success: true, message: 'Razorpay payment verified and recorded.', records });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Verify Razorpay payment error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification succeeded, but recording failed.' });
  } finally { client.release(); }
};

exports.getAllPayments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.payment_id, p.student_id, p.fee_head_id, p.amount_paid, p.payment_mode,
             p.gateway, p.transaction_id, p.payment_date, p.status, p.recorded_by,
             s.full_name AS student_name
      FROM payments p
      LEFT JOIN students s ON s.student_id = p.student_id
      ORDER BY p.payment_id DESC
    `);

    return res.json({ success: true, count: result.rows.length, payments: result.rows });
  } catch (error) {
    console.error('Get payments error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch payments.' });
  }
};

exports.getPaymentsByStudent = async (req, res) => {
  try {
    const sid = Number(req.params.studentId);
    const result = await pool.query(`
      SELECT p.payment_id, p.student_id, p.fee_head_id, p.amount_paid, p.payment_mode,
             p.gateway, p.transaction_id, p.payment_date, p.status, p.recorded_by
      FROM payments p
      WHERE p.student_id = $1
      ORDER BY p.payment_id DESC
    `, [sid]);

    return res.json({ success: true, count: result.rows.length, payments: result.rows });
  } catch (error) {
    console.error('Get student payments error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch student payments.' });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { student_id, fee_head_id, amount_paid, payment_mode, gateway, transaction_id, recorded_by } = req.body;
    if (!student_id || !fee_head_id || !amount_paid || !payment_mode) {
      return res.status(400).json({ success: false, message: 'Student ID, Fee Head, Amount, and Mode are required.' });
    }

    const insertResult = await pool.query(`
      INSERT INTO payments (student_id, fee_head_id, amount_paid, payment_mode, gateway, transaction_id, status, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, 'success', $7)
      RETURNING payment_id, student_id, fee_head_id, amount_paid, payment_mode, gateway, transaction_id, payment_date, status, recorded_by
    `, [
      Number(student_id),
      Number(fee_head_id),
      Number(amount_paid),
      payment_mode,
      gateway || (payment_mode === 'online' ? 'Razorpay' : 'Offline Counter'),
      transaction_id || `TXN${Date.now()}`,
      recorded_by || 'student'
    ]);

    const payment = insertResult.rows[0];
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(payment.payment_id).padStart(4, '0')}`;
    const receiptResult = await pool.query(`
      INSERT INTO receipts (payment_id, receipt_number, generated_at)
      VALUES ($1, $2, NOW())
      RETURNING receipt_id, payment_id, receipt_number, generated_at
    `, [payment.payment_id, receiptNumber]);

    return res.status(201).json({
      success: true,
      message: 'Payment processed and receipt generated successfully!',
      payment,
      receipt: receiptResult.rows[0]
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return res.status(500).json({ success: false, message: 'Unable to process payment.' });
  }
};
