import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { enrolLearner } from "../services/lmsService.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

const Order = mongoose.model("Order");

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const meta = session.metadata;

    try {
      const order = await Order.findById(meta.order_id);
      if (!order) return res.json({ received: true });

      order.status = "paid";
      order.stripeSessionId = session.id;
      await order.save();

      // Auto enrol to LMS
      const enrolResult = await enrolLearner({
        firstname: meta.firstName,
        lastname: meta.lastName,
        email: meta.email,
        course_id: meta.courseId,
        enrol_to_id: meta.enrolToId
      });

      order.status = enrolResult.success ? "enrolled" : "enrol_failed";
      order.lmsResponse = enrolResult;
      await order.save();

      console.log("✅ LMS Enrolment:", enrolResult);
    } catch (err) {
      console.error("❌ Webhook enrolment error:", err);
    }
  }

  res.json({ received: true });
});

export default router;
