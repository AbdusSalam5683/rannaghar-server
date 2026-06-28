import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  blockUser,
  unblockUser,
  makePremium,
  getUserStats,
  changeUserRole,
} from '../controllers/user.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// Protected routes (User)
router.get('/me', verifyTokenMiddleware, getUserById);
router.put('/profile', verifyTokenMiddleware, updateProfile);

// Admin only routes
router.get('/all', verifyTokenMiddleware, verifyAdmin, getAllUsers);
router.get('/stats', verifyTokenMiddleware, verifyAdmin, getUserStats);
router.patch('/:id/block', verifyTokenMiddleware, verifyAdmin, blockUser);
router.patch('/:id/unblock', verifyTokenMiddleware, verifyAdmin, unblockUser);
router.patch('/:id/premium', verifyTokenMiddleware, verifyAdmin, makePremium);
router.patch('/:id/role', verifyTokenMiddleware, verifyAdmin, changeUserRole);

export default router;