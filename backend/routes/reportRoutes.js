const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/stats', reportController.getDashboardStats);
router.get('/audit-logs', reportController.getAuditLogs);

module.exports = router;
