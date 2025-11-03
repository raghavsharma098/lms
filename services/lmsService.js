import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.HF_BASE_URL; // e.g. https://lms-uat.highfieldelearning.com/lms/api
const USERNAME = process.env.HF_USERNAME; // e.g. annechoran@yahoo.co.uk
const PASSWORD = process.env.HF_PASSWORD; // e.g. Test2025

let cachedToken = null;
let tokenExpiry = 0;

// ✅ Get token (Highfield expects form-urlencoded body)
export async function getToken() {
  const now = Date.now();

  // Use cached token if still valid
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
    tokenExpiry = now + 19 * 60 * 1000; // cache token for ~19 mins

    console.log("🔑 LMS token retrieved successfully");
    return token;
  } catch (err) {
    console.error("❌ LMS login error:", err.response?.data || err.message);
    throw new Error("Login failed: " + (err.response?.data?.message || err.message));
  }
}

// ✅ Enrol learner
export async function enrolLearner({ firstname, lastname, email, course_id, tier_id }) {
  try {
    const token = await getToken();

    // ✅ Highfield expects form-urlencoded body, not JSON
    const payload = new URLSearchParams({
      token,
      firstname,
      lastname,
      username: email,
      email,
      password: "Temp@123",
      course_id: String(course_id),
      tier_id: String(tier_id)
    });

    const { data } = await axios.post(
      `${BASE_URL}/autoEnrol`,
      payload,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

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



