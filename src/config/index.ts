import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY as string,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET as string,
  frontendUrl: process.env.FRONTEND_URL as string,
};
