import crypto from "crypto";

export function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  if (!secret || !signatureHeader) return true; // disable if not set
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signatureHeader === hash;
}
