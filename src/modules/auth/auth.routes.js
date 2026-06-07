const express = require('express');
const AuthController = require('./auth.controller');
const { authenticate } = require('../../shared/middleware/auth');
const { validate } = require('../../shared/middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema } = require('./auth.validation');

const router = express.Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, validate(changePasswordSchema), AuthController.changePassword);

module.exports = router;
