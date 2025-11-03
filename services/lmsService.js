// ✅ lmsService.js (FINAL FIX)
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.HF_BASE_URL; 
const USERNAME = process.env.HF_USERNAME; 
const PASSWORD = process.env.HF_PASSWORD; 

let cachedToken = null;
let tokenExpiry = 0;

export async function getToken() {
  const now = Date.now();

  if (cachedToken && tokenExpiry > now) {
    return cachedToken;
  }

  try {
    const { data } = await axios.post(
      `${BASE_URL}/login`,
      new URLSearchParams({
        username: USERNAME,
        password: PASSWORD
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    if (!data.success) {
      throw new Error("Login failed: " + data.message);
    }

    const token = data.data.token;
    cachedToken = token;
    tokenExpiry = now + 19 * 60 * 1000;

    console.log("🔑 LMS token retrieved successfully");
    return token;
  } catch (err) {
    console.error("❌ LMS login error:", err.response?.data || err.message);
    throw new Error("Login failed: " + (err.response?.data?.message || err.message));
  }
}

export async function enrolLearner({ firstname, lastname, email, course_id, enrol_to_id }) {
  try {
    const token = await getToken();

    const payload = new URLSearchParams({
      token,
      firstname,
      lastname,
      username: email,
      email,
      password: "Temp@123",
      course_id: String(course_id),
      enrol_to_id: String(enrol_to_id),
      test: "0"
    });

    console.log("📤 Sending enrol payload:", Object.fromEntries(payload));

    const { data } = await axios.post(`${BASE_URL}/autoEnrol`, payload, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!data.success) {
      console.error("❌ LMS enrolment failed:", data.message);
      throw new Error(data.message);
    }

    console.log(`🎉 Learner enrolled successfully: ${email}`);
    return data;
  } catch (err) {
    console.error("❌ Enrolment error:", err.response?.data || err.message);
    throw err;
  }
}

