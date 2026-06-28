import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Manually load .env before using it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔍 [stripe.js] STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ YES' : '❌ NO');

let stripe = null;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    console.log('🔍 [stripe.js] Initializing Stripe...');
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    });
    console.log('✅ Stripe initialized successfully');
  } else {
    console.warn('⚠️ STRIPE_SECRET_KEY not found. Stripe features disabled.');
  }
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
}

console.log('🔍 [stripe.js] stripe object:', stripe ? '✅ NOT NULL' : '❌ NULL');

export default stripe;