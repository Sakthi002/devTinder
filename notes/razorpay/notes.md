# RAZORPAY INTEGRATION (DEVTINDER)

## 1. FLOW

```
Frontend                    Backend                       Razorpay
   │  Click "Get Silver"       │                              │
   │ ── POST /payment/create ─►│                              │
   │                           │ ── create order (secret) ──► │
   │                           │ ◄────── order_xxx ────────── │
   │                           │ save Payment (status=created)│
   │ ◄── orderId + keyId ───── │                              │
   │                           │                              │
   │ ── open checkout popup (order_id) ─────────────────────► │
   │           user pays                                      │
   │                           │ ◄── webhook (payment.captured)│
   │                           │ verify signature             │
   │                           │ update Payment + User premium│
   │ ── GET /premium/verify ──►│                              │
   │ ◄── { isPremium: true } ──│                              │
```

1. User clicks a plan → frontend calls backend to create an order
2. Backend creates the order on Razorpay using the secret key
3. Razorpay returns the order ID → backend saves it and returns it to the frontend
4. Frontend opens the Razorpay checkout popup with that order ID
5. After payment, Razorpay sends a webhook to the backend
6. Backend verifies the webhook, updates the payment status and makes the user premium
7. Frontend calls /premium/verify to check the status and update the UI

### Why webhooks?
- The frontend can't be trusted to say "payment successful" (the user could fake it).
- Razorpay calls our backend directly, with a signature we can verify → only real payments upgrade users.

---

## 2. RAZORPAY DASHBOARD SETUP

### Account
- Sign up at razorpay.com
- Use TEST mode for development (toggle at the top). No KYC needed for test mode.
- Live mode (real money) needs account activation: PAN, bank account, business details.

### API keys
- Account & Settings → Website and app settings → API keys → Generate test key
- Key ID → used by frontend + backend (public)
- Key Secret → backend only (never in frontend or Git)

### Webhook
- Account & Settings → Webhooks → Add new webhook
  - Webhook URL: https://sakthivelmunusami.in/api/payment/webhook (must be public HTTPS)
  - Secret: any strong string → same value goes in .env
  - Active events: payment.captured, payment.failed (optional: payment.authorized)
- Webhooks are sent to the DEPLOYED server, even when testing checkout from localhost.

### Payment capture
- Account & Settings → Payments and refunds → Capture and refund settings
- Automatic capture (default) → payments move from Authorized to Captured automatically.
- Auto-capture works ONLY for payments made through an order (Orders API).

### .env (backend, local and server)
```
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx
```

---

## 3. BACKEND

### Install
```bash
npm install razorpay
```

### Razorpay instance (src/utils/razorpay.js)
```js
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpayInstance;
```

### Plan prices (src/utils/constants.js)
```js
const membershipAmount = {
  silver: 299,
  gold: 699,
};

module.exports = { membershipAmount };
```

### Payment model (src/models/payment.js)
```js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    paymentId: { type: String },
    orderId: { type: String, required: true },
    status: { type: String, required: true },
    amount: { type: Number, required: true },   // Number, in paise
    currency: { type: String, required: true },
    receipt: { type: String, required: true },
    notes: {
      firstName: { type: String },
      lastName: { type: String },
      emailId: { type: String },
      membershipType: { type: String },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
```

### User model fields
```js
isPremium: { type: Boolean, default: false },
membershipType: { type: String },
```

### Raw body for webhook signature (src/app.js)
- The signature must be checked against the exact bytes Razorpay sent.
- JSON.stringify(req.body) can differ from the original → valid webhooks rejected.
```js
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); },
}));
```

### Routes (src/routes/payment.js)
```js
const express = require("express");
const paymentRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const { membershipAmount } = require("../utils/constants");
const Payment = require("../models/payment");
const User = require("../models/user");
const { validateWebhookSignature } = require("razorpay/dist/utils/razorpay-utils");

// 1. Create order
paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;

    if (!membershipAmount[membershipType]) {
      return res.status(400).json({ message: "Invalid membership type" });
    }

    const { firstName, lastName, emailId } = req.user;

    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100, // rupees → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { firstName, lastName, emailId, membershipType },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      receipt: order.receipt,
    });

    const savedPayment = await payment.save();

    res.json({
      message: "Order created successfully",
      data: savedPayment,                 // contains orderId
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Webhook (called by Razorpay, no userAuth)
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const signature = req.get("X-Razorpay-Signature");

    const isValid = validateWebhookSignature(
      req.rawBody,
      signature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isValid) {
      console.error("[webhook] Invalid signature");
      return res.status(400).json({ message: "Webhook signature not valid!" });
    }

    const event = req.body.event;
    const paymentDetails = req.body.payload.payment.entity;
    console.log("[webhook]", event, paymentDetails.order_id, paymentDetails.status);

    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    if (!payment) {
      console.error("[webhook] No payment found for", paymentDetails.order_id);
      return res.status(200).json({ message: "Order not found, ignored" });
    }

    payment.paymentId = paymentDetails.id;
    payment.status = paymentDetails.status;     // "captured" or "failed"
    await payment.save();

    // Only a captured payment makes the user premium
    if (event === "payment.captured") {
      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;
        await user.save();
        console.log("[webhook] User upgraded:", user._id.toString());
      }
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("[webhook] Error:", error.message);
    return res.status(500).json({ message: error.message });
  }
});

// 3. Verify premium status
paymentRouter.get("/premium/verify", userAuth, async (req, res) => {
  try {
    const { isPremium, membershipType } = req.user;
    res.json({ isPremium, membershipType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = paymentRouter;
```

### Register the router (src/app.js)
```js
app.use("/", require("./routes/payment"));
```

---

## 4. FRONTEND

### Load the checkout script (index.html)
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```
- Makes window.Razorpay available.

### Membership page (key parts)
```jsx
const [isPremium, setIsPremium] = useState(false);

useEffect(() => {
  verifyPremium();
}, []);

const verifyPremium = async () => {
  try {
    const res = await axios.get(API_BASE_URL + "/premium/verify", { withCredentials: true });
    setIsPremium(res.data.isPremium);
  } catch (error) {
    console.error(error.message);
  }
};

const handleSubscribe = async (planId) => {
  try {
    const order = await axios.post(
      API_BASE_URL + "/payment/create",
      { membershipType: planId },
      { withCredentials: true },
    );

    const { amount, currency, notes, orderId } = order.data.data;

    const options = {
      key: order.data.keyId,
      amount,
      currency,
      name: "DevTinder",
      description: "DevTinder membership",
      order_id: orderId,                 // Razorpay order ID, NOT Mongo _id
      prefill: {
        name: notes.firstName + " " + notes.lastName,
        email: notes.emailId,
      },
      theme: { color: "#F37254" },
      handler: verifyPremium,            // runs after successful payment
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error(error.message);
  }
};
```

### Note on handler timing
- handler runs as soon as the popup reports success.
- The webhook may arrive a few seconds later → the first /premium/verify can still return false.
- Better: retry verify a few times, or show "Payment received, activating membership…" and re-check after a short delay.

### UI
- isPremium true → show an "Active membership" card
- isPremium false → show the plan cards

---

## 5. DEPLOY

### Backend
```bash
cd ~/devTinder
git pull
npm install                     # installs razorpay
nano .env                       # RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
pm2 restart devtinder-backend
```

### Frontend
```bash
cd ~/devTinder-web
git pull
npm run build
sudo cp -r dist/* /var/www/html/
```

### URL mapping
- Razorpay calls https://sakthivelmunusami.in/api/payment/webhook
- nginx strips /api → Express receives /payment/webhook

---

## 6. TESTING
1. Keep server logs open: pm2 logs devtinder-backend --lines 0
2. Open the Membership page → choose a plan → complete the payment with Razorpay's test card / test UPI (see Razorpay test-mode docs). Don't close the popup.
3. Expected logs:
```
[webhook] payment.captured order_xxx captured
[webhook] User upgraded: <userId>
```
4. Check MongoDB:
   - payments → status: "captured", paymentId saved
   - users → isPremium: true, membershipType set
5. Razorpay dashboard → Transactions → Payments → status Captured

### Check the webhook route is reachable
```bash
curl -i -X POST https://sakthivelmunusami.in/api/payment/webhook \
  -H "Content-Type: application/json" -d '{}'
```
- 400 "signature not valid" → route works
- 404 → old code on server
- 502 → backend down
- 403 / challenge page → Cloudflare blocking

---

## 7. TROUBLESHOOTING (LESSONS LEARNED)

- Webhook logs not visible
  - Webhooks go to the deployed server, not localhost → check pm2 logs on EC2
- order_id is null in webhook / payments stuck at "Authorized"
  - Frontend passed the Mongo _id instead of the Razorpay order ID
  - Use order.data.data.orderId
  - Without a valid order, auto-capture doesn't apply → payments stay Authorized
- Payment status stays "created" in DB
  - Missing await on Payment.findOne / User.findById → .save() fails → webhook returns 500
- Failed payment made the user premium
  - Check the event: upgrade only on payment.captured
- "Webhook signature not valid" for real webhooks
  - Use req.rawBody, not JSON.stringify(req.body)
  - RAZORPAY_WEBHOOK_SECRET must exactly match the secret set in Razorpay
- "Cannot find module 'razorpay'" / app crashing (PM2 errored)
  - Run npm install on the server after git pull
- Amount NaN / order creation fails
  - Validate membershipType against membershipAmount
- Razorpay amounts are in paise → ₹299 = 29900