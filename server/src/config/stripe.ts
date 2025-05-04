import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECERT_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export default stripe;
