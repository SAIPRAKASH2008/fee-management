const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/users', authController.getUsers);
router.post('/users', authController.createManagedUser);

module.exports = router;
