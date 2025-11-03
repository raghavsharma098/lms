// Test data for Stripe Checkout Integration
// Use this with Postman, Thunder Client, or curl

// ===================================
// 1. CREATE CHECKOUT SESSION
// ===================================
// POST http://localhost:4000/checkout/create-session
// Content-Type: application/json

const checkoutRequest = {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "courseId": "12345",
  "courseName": "Food Safety Level 2",
  "price": 4999,  // £49.99 in pence
  "enrolToId": "67890"  // Optional: Highfield tier/division ID
};

// ===================================
// 2. GET ALL ORDERS (Admin)
// ===================================
// GET http://localhost:4000/admin/orders
// x-admin-key: your_secure_admin_key

// ===================================
// 3. RETRY FAILED ENROLLMENT (Admin)
// ===================================
// POST http://localhost:4000/admin/retry/{order_id}
// x-admin-key: your_secure_admin_key

// ===================================
// CURL EXAMPLES
// ===================================

// Create Checkout Session:
/*
curl -X POST http://localhost:4000/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "courseId": "12345",
    "courseName": "Food Safety Level 2",
    "price": 4999,
    "enrolToId": "67890"
  }'
*/

// Get Orders:
/*
curl -X GET http://localhost:4000/admin/orders \
  -H "x-admin-key: your_secure_admin_key"
*/

// Retry Enrollment:
/*
curl -X POST http://localhost:4000/admin/retry/ORDER_ID_HERE \
  -H "x-admin-key: your_secure_admin_key"
*/

// ===================================
// STRIPE TEST CARDS
// ===================================
// Success: 4242 4242 4242 4242
// Declined: 4000 0000 0000 0002
// Requires Auth: 4000 0025 0000 3155
// Any future date, any 3-digit CVC

export { checkoutRequest };
