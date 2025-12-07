import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../utils/middleware.js';

const router = express.Router();

router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.get('/profile', authMiddleware, AuthController.getProfile.bind(AuthController));

export default router;

