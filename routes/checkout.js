import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Simple MongoDB schema for orders
const orderSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  courseId: String,
  courseName: String,
  price: Number,
  enrolToId: String,
  status: { type: String, default: "pending" },
  stripeSessionId: String,
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

router.post("/create-session", async (req, res) => {
  try {
    const { firstName, lastName, email, courseId, courseName, price, enrolToId } = req.body;

    const order = await Order.create({
      firstName, lastName, email, courseId, courseName, price, enrolToId
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: { name: courseName },
          unit_amount: price
        },
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        order_id: order._id.toString(),
        firstName, lastName, email, courseId, enrolToId
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating Stripe session:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
