import express from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  getAllTransactions,
  getPaymentStats,
  handleWebhook,
} from '../controllers/payment.controller.js';
import { verifyTokenMiddleware } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// ⚠️ Payment routes temporarily disabled
// Uncomment when Stripe is configured

// Webhook route (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes (User)
router.post('/create-intent', verifyTokenMiddleware, createPaymentIntent);
router.post('/confirm', verifyTokenMiddleware, confirmPayment);
router.get('/history', verifyTokenMiddleware, getPaymentHistory);

// Admin only routes
router.get('/transactions', verifyTokenMiddleware, verifyAdmin, getAllTransactions);
router.get('/stats', verifyTokenMiddleware, verifyAdmin, getPaymentStats);

// ✅ Test route
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Payment routes are working! Stripe is disabled.',
  });
});

export default router;