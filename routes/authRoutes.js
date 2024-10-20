const express = require('express');
const { signup, login, logout, getCurrentUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', authMiddleware, logout);
router.get('/current', authMiddleware, getCurrentUser);

module.exports = router;
