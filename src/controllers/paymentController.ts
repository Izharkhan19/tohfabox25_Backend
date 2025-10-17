import { Request, Response } from "express";
import { StripeService, stripe } from "../services/stripeService";
import { config } from "../config";
import { handleError } from "../utils/errorHandler";

const stripeService = new StripeService();

// ✅ Create Checkout Session
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { cart } = req.body;
    const result = await stripeService.createCheckoutSession(cart);
    res.json(result);
  } catch (err) {
    handleError(res, err, "Error creating Checkout Session");
  }
};

// ✅ Retrieve Session
export const getSessionDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await stripeService.retrieveSession(id);
    res.json(session);
  } catch (err) {
    handleError(res, err, "Error fetching session details");
  }
};

// ✅ Webhook Handler
export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      config.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as any;
      console.log("✅ Payment completed for session:", session.id);
      break;
    case "payment_intent.succeeded":
      console.log("✅ PaymentIntent succeeded");
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};
