import express from 'express';
import {
  createReport,
  getAllReports,
  dismissReport,
  removeRecipeFromReport,
  getReportStats,
} from '../controllers/report.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// Protected routes (User)
router.post('/', verifyTokenMiddleware, createReport);

// Admin only routes
router.get('/all', verifyTokenMiddleware, verifyAdmin, getAllReports);
router.get('/stats', verifyTokenMiddleware, verifyAdmin, getReportStats);
router.patch('/:id/dismiss', verifyTokenMiddleware, verifyAdmin, dismissReport);
router.delete('/:id/remove', verifyTokenMiddleware, verifyAdmin, removeRecipeFromReport);

export default router;