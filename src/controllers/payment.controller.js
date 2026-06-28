import Payment from '../models/Payment.model.js';
import Recipe from '../models/Recipe.model.js';
import User from '../models/User.model.js';
import stripe from '../config/stripe.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ✅ Create Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, recipeId, paymentType } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Validate payment type
    if (!['recipe_purchase', 'premium_membership'].includes(paymentType)) {
      return errorResponse(res, 'Invalid payment type', 400);
    }

    // For recipe purchase, verify recipe exists
    if (paymentType === 'recipe_purchase') {
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return errorResponse(res, 'Recipe not found', 404);
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        userEmail,
        recipeId: recipeId || '',
        paymentType,
      },
    });

    // Save payment record
    const payment = new Payment({
      userEmail,
      userId,
      amount,
      recipeId: recipeId || null,
      transactionId: paymentIntent.id,
      paymentStatus: 'pending',
      paymentType,
    });

    await payment.save();

    return successResponse(res, 'Payment intent created', {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({ transactionId: paymentIntentId });
    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      payment.paymentStatus = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      // Update user premium status if premium membership
      if (payment.paymentType === 'premium_membership') {
        await User.findByIdAndUpdate(userId, { isPremium: true });
      }

      return successResponse(res, 'Payment confirmed successfully', payment);
    } else {
      payment.paymentStatus = 'failed';
      await payment.save();
      return errorResponse(res, 'Payment not completed', 400);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get User's Payment History
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });

    return successResponse(res, 'Payment history fetched', payments);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get All Transactions (Admin only)
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments();

    return successResponse(res, 'Transactions fetched', {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Payment Stats (Admin only)
export const getPaymentStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const completed = await Payment.countDocuments({ paymentStatus: 'completed' });
    const pending = await Payment.countDocuments({ paymentStatus: 'pending' });
    const failed = await Payment.countDocuments({ paymentStatus: 'failed' });

    return successResponse(res, 'Payment stats fetched', {
      totalRevenue: totalRevenue[0]?.total || 0,
      completed,
      pending,
      failed,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Stripe Webhook (Handle webhook events)
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper: Handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ transactionId: paymentIntent.id });
    if (payment && payment.paymentStatus !== 'completed') {
      payment.paymentStatus = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      // Update user premium status if premium membership
      if (payment.paymentType === 'premium_membership') {
        await User.findByIdAndUpdate(payment.userId, { isPremium: true });
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
};

// Helper: Handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const payment = await Payment.findOne({ transactionId: paymentIntent.id });
    if (payment) {
      payment.paymentStatus = 'failed';
      await payment.save();
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
};