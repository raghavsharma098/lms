import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.HF_BASE_URL;
const USERNAME = process.env.HF_USERNAME;
const PASSWORD = process.env.HF_PASSWORD;

let cachedToken = null;
let tokenExpiry = 0;

// ✅ STEP 1: Get Token (cached)
export async function getToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) return cachedToken;

  const { data } = await axios.post(
    `${BASE_URL}/login`,
    new URLSearchParams({
      username: USERNAME,
      password: PASSWORD
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!data.success) throw new Error("Login failed: " + data.message);
  cachedToken = data.data.token;
  tokenExpiry = now + 19 * 60 * 1000;
  console.log("🔑 LMS token retrieved successfully");
  return cachedToken;
}

// ✅ STEP 2: Enrol Learner
export async function enrolLearner({ firstname, lastname, email, course_id, tier_id }) {
  const token = await getToken();

  const payload = new URLSearchParams({
    token,
    firstname,
    lastname,
    username: email,
    email,
    password: "Temp@123",
    course_id: String(course_id),
    tier_id: String(tier_id),
    test: "0" // Add explicitly — even if not required
  });

  console.log("📤 Sending enrol payload:", Object.fromEntries(payload.entries()));

  try {
    const { data } = await axios.post(`${BASE_URL}/autoEnrol`, payload, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("📨 LMS Response:", data);

    if (!data.success) {
      throw new Error(data.message || "LMS enrolment failed");
    }

    console.log(`🎉 Learner enrolled successfully: ${email}`);
    return data;
  } catch (err) {
    console.error("❌ Enrolment error:", err.response?.data || err.message);
    throw err;
  }
}



