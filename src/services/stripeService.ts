import Stripe from "stripe";
import { config } from "../config";

export const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
});

export class StripeService {
  async createCheckoutSession(cart: any[]) {
    const line_items = cart.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: { name: item.product.name },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${config.frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/cancel`,
    });

    return { url: session.url };
  }

  async retrieveSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId);
  }
}
