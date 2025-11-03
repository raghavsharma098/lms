# Highfield LMS Integration with Stripe & Webflow

A Node.js backend that integrates **Webflow forms** → **Stripe Checkout** → **Highfield LMS** auto-enrollment with MongoDB storage.

## 🚀 Flow Overview

```
1. User fills form on Webflow
2. Frontend calls POST /checkout/create-session
3. User redirected to Stripe Checkout
4. User completes payment
5. Stripe sends webhook to /webhook/stripe
6. Backend verifies payment
7. Backend auto-enrolls learner on Highfield LMS
8. Order saved to MongoDB
```

---

## 📦 Installation

```bash
npm install
```

---

## ⚙️ Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your environment variables:

### Required Variables:
- **MONGO_URI** - MongoDB connection string
- **STRIPE_SECRET_KEY** - Get from Stripe Dashboard
- **STRIPE_WEBHOOK_SECRET** - Get from Stripe Webhook settings
- **HF_LMS_BASE** - Highfield LMS base URL (UAT or Production)
- **HF_USERNAME** - Highfield LMS username
- **HF_PASSWORD** - Highfield LMS password
- **FRONTEND_URL** - Your Webflow site URL
- **ADMIN_KEY** - Secure key for admin endpoints

---

## 🌐 API Endpoints

### 1. Create Checkout Session
**POST** `/checkout/create-session`

Called from your Webflow form to create a Stripe checkout session.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "courseId": "12345",
  "courseName": "Food Safety Level 2",
  "price": 4999,
  "enrolToId": "67890"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Webflow Integration:**
```javascript
// Add this to your Webflow custom code
const form = document.querySelector('#enrollment-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    firstName: form.querySelector('[name="firstName"]').value,
    lastName: form.querySelector('[name="lastName"]').value,
    email: form.querySelector('[name="email"]').value,
    courseId: form.querySelector('[name="courseId"]').value,
    courseName: form.querySelector('[name="courseName"]').value,
    price: parseInt(form.querySelector('[name="price"]').value), // in pence
    enrolToId: form.querySelector('[name="enrolToId"]')?.value || ""
  };

  try {
    const response = await fetch('https://your-backend-url.com/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const { url } = await response.json();
    
    // Redirect to Stripe Checkout
    window.location.href = url;
  } catch (error) {
    console.error('Error:', error);
    alert('Payment initialization failed. Please try again.');
  }
});
```

---

### 2. Stripe Webhook
**POST** `/webhook/stripe`

Automatically receives payment confirmation from Stripe.

**Setup in Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-backend-url.com/webhook/stripe`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret to `.env`

---

### 3. Admin Endpoints

#### Get All Orders
**GET** `/admin/orders`

**Headers:**
```
x-admin-key: your_secure_admin_key
```

#### Retry Failed Enrollment
**POST** `/admin/retry/:id`

**Headers:**
```
x-admin-key: your_secure_admin_key
```

---

## 🏃 Running the Server

### Development:
```bash
npm run dev
```

### Production:
```bash
npm start
```

---

## 🗄️ MongoDB Schema

### Order Model
```javascript
{
  orderId: String,              // Stripe Payment Intent ID
  stripeSessionId: String,      // Stripe Checkout Session ID
  stripePaymentIntentId: String,
  status: String,               // "created" | "enrolling" | "enrolled" | "failed"
  firstName: String,
  lastName: String,
  email: String,
  courseId: String,
  courseName: String,
  enrolToId: String,           // Highfield tier/division ID
  paymentStatus: String,
  attempts: Number,
  payload: Object,             // Full Stripe session data
  lmsResponse: Object,         // Highfield LMS response
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Test Stripe Webhook Locally

1. Install Stripe CLI:
```bash
stripe login
```

2. Forward webhooks to local server:
```bash
stripe listen --forward-to localhost:4000/webhook/stripe
```

3. Copy the webhook signing secret to `.env`

4. Trigger test event:
```bash
stripe trigger checkout.session.completed
```

---

## 🔒 Security

- ✅ Stripe webhook signature verification
- ✅ Admin endpoints protected with API key
- ✅ MongoDB connection secured
- ✅ Environment variables for sensitive data
- ✅ HTTPS required in production

---

## 📝 Price Format

Stripe uses **smallest currency unit**:
- £49.99 = 4999 pence
- £100.00 = 10000 pence

Make sure your Webflow form sends prices in pence!

---

## 🚨 Troubleshooting

### Webhook not working:
1. Check Stripe webhook secret is correct
2. Ensure endpoint is publicly accessible
3. Verify webhook event type is `checkout.session.completed`
4. Check server logs for errors

### LMS enrollment failing:
1. Verify Highfield credentials in `.env`
2. Check `courseId` and `enrolToId` are correct
3. Review LMS response in MongoDB `lmsResponse` field
4. Use `/admin/retry/:id` to retry failed enrollments

### MongoDB connection issues:
1. Check `MONGO_URI` format
2. Verify network access if using MongoDB Atlas
3. Ensure database user has proper permissions

---

## 📚 Additional Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Highfield LMS API Docs](https://lms-uat.highfieldelearning.com/api/docs)

---

## 🤝 Support

For issues or questions, check:
1. Server logs
2. MongoDB records
3. Stripe Dashboard events
4. Highfield LMS response

---

## 📄 License

MIT
