import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { enrolLearner } from "../services/lmsService.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Access your Mongoose model
const Order = mongoose.model("Order");

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];

    // ✅ If using Postman or manual test (no signature header)
    if (!sig) {
      console.warn("⚠️ No stripe-signature header — running in manual test mode");
      event = req.body;
    } else {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle the event type
  const eventType = event.type || "checkout.session.completed";

  if (eventType === "checkout.session.completed") {
    const session = event.data?.object || event;
    const meta = session.metadata || {};

    try {
      console.log("✅ Payment completed for:", session.customer_email);

      // Get order if metadata exists
      const order = meta.order_id ? await Order.findById(meta.order_id) : null;
      if (order) {
        order.status = "paid";
        order.stripeSessionId = session.id;
        await order.save();
      }

      // ✅ LMS Enrolment
      const enrolResult = await enrolLearner({
        firstname: meta.firstName || session.customer_details?.name?.split(" ")[0] || "Test",
        lastname: meta.lastName || session.customer_details?.name?.split(" ")[1] || "User",
        email: meta.email || session.customer_email,
        course_id: meta.courseId || 276, // Default: API Test Course
        tier_id: meta.tierId || 12318     // Default: Community Steps Division
      });

      if (order) {
        order.status = enrolResult.success ? "enrolled" : "enrol_failed";
        order.lmsResponse = enrolResult;
        await order.save();
      }

      console.log("🎉 LMS Enrolment Success:", enrolResult);
    } catch (err) {
      console.error("❌ Webhook enrolment error:", err.message);
    }
  }

  res.json({ received: true });
});

export default router;

