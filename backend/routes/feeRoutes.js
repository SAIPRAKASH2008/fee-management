const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');

router.get('/structures', feeController.getFeeStructures);
router.get('/structures/:id/heads', feeController.getFeeHeadsByStructure);
router.post('/structures', feeController.createFeeStructure);

module.exports = router;
