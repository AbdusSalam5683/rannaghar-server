import express from 'express';
import {
  register,
  login,
  googleLogin,
  logout,
  getCurrentUser,
  refreshToken,
} from '../controllers/auth.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Public routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleLogin);
router.post('/refresh', refreshToken);

// Protected routes
router.post('/logout', verifyTokenMiddleware, logout);
router.get('/me', verifyTokenMiddleware, getCurrentUser);

export default router;