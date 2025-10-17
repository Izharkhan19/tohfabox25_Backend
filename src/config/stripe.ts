import Stripe from 'stripe';
import { config } from './index';

export const stripeInstance = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
});