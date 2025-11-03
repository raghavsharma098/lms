import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import checkoutRoutes from "./routes/checkout.js";
import stripeWebhook from "./routes/stripeWebhook.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Important: Stripe webhook must use raw body
app.use('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Normal JSON middleware for other routes
app.use('/checkout', checkoutRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

app.get("/", (req, res) => res.send("Server running..."));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
