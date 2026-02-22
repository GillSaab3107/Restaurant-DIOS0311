const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  const secret = "YOUR_RAZORPAY_WEBHOOK_SECRET";

  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body.event;

  if (event === "payment.captured") {
    const payment = req.body.payload.payment.entity;

    const orderId = payment.notes.orderId;

    await admin.firestore().collection("orders").doc(orderId).update({
      paymentStatus: "paid",
    });

    console.log("Payment verified for order:", orderId);
  }

  res.status(200).send("Webhook received");
});