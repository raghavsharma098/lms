import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.HF_BASE_URL;
const USERNAME = process.env.HF_USERNAME;
const PASSWORD = process.env.HF_PASSWORD;
let cachedToken = null;
let tokenExpiry = 0;

// Get token
export async function getToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiry > now) return cachedToken;

  const { data } = await axios.post(`${BASE_URL}/login`, {
    username: USERNAME,
    password: PASSWORD
  });

  if (!data.success) throw new Error("Login failed: " + data.message);
  const token = data.data.token;
  cachedToken = token;
  tokenExpiry = now + 19 * 60 * 1000; // 19 mins cache
  return token;
}

// Enrol learner
export async function enrolLearner({ firstname, lastname, email, course_id, enrol_to_id }) {
  const token = await getToken();
  const payload = {
    token,
    firstname,
    lastname,
    username: email,
    email,
    password: "Temp@123",
    course_id,
    enrol_to_id: enrol_to_id || process.env.HF_DEFAULT_ENROL_TO_ID
  };

  const { data } = await axios.post(`${BASE_URL}/autoEnrol`, payload);
  return data;
}
