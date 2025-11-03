import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  stripeSessionId: { type: String, unique: true, sparse: true },
  stripePaymentIntentId: { type: String },
  status: { type: String, enum: ["created", "enrolling", "enrolled", "failed"], default: "created" },
  firstName: String,
  lastName: String,
  email: String,
  courseId: String,
  courseName: String,
  enrolToId: String,
  paymentStatus: String,
  attempts: { type: Number, default: 0 },
  payload: Object,
  lmsResponse: Object
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
