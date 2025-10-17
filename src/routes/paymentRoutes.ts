import { Router } from "express";
import {
  createCheckoutSession,
  getSessionDetails,
  handleWebhook,
} from "../controllers/paymentController";
import express from "express";

const router = Router();

router.post("/api/stripe/create-checkout-session", createCheckoutSession);
router.get("/api/stripe/session/:id", getSessionDetails);

// Webhook route — raw body required!
router.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

export default router;
