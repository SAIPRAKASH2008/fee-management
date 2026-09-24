const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);
router.post('/razorpay/order', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);
router.post('/', paymentController.recordPayment);

module.exports = router;
