import express from "express";
import Order from "../models/Order.js";
import { enrolLearner } from "../services/lmsService.js";

const router = express.Router();

router.get("/orders", async (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY)
    return res.status(401).json({ message: "Unauthorized" });

  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  res.json(orders);
});

router.post("/retry/:id", async (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY)
    return res.status(401).json({ message: "Unauthorized" });

  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.attempts += 1;
  order.status = "enrolling";
  await order.save();

  const result = await enrolLearner({
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    courseId: order.courseId,
    enrolToId: order.enrolToId,
  });
  
  order.lmsResponse = result;
  order.status = result.success ? "enrolled" : "failed";
  await order.save();

  res.json({ ok: result.success, result });
});

export default router;
