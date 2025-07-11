const ZarinpalCheckout = require("zarinpal-checkout");

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const ZARINPAL_CALLBACK_URL =
  process.env.ZARINPAL_CALLBACK_URL || "http://localhost:3000/payment/verify";

const zarinpal = ZARINPAL_MERCHANT_ID
  ? ZarinpalCheckout.create(ZARINPAL_MERCHANT_ID, false)
  : null;

async function initiatePayment({ amount, userId, bookingId, method }) {
  if (zarinpal) {
    try {
      const response = await zarinpal.PaymentRequest({
        Amount: amount,
        CallbackURL: ZARINPAL_CALLBACK_URL,
        Description: `Booking #${bookingId}`,
        Email: undefined,
        Mobile: undefined,
      });
      if (response.status === 100) {
        return {
          paymentUrl: response.url,
          transactionId: response.authority,
          status: "pending",
        };
      }
      throw new Error("Zarinpal PaymentRequest failed");
    } catch (err) {
      console.error("Zarinpal error:", err.message);
      return { error: err.message };
    }
  } else {
    // Fallback: mock
    return {
      paymentUrl: `https://mock-gateway/pay?booking=${bookingId}`,
      transactionId: `mock-tx-${Date.now()}`,
      status: "pending",
    };
  }
}

async function verifyPayment({ transactionId }) {
  if (zarinpal) {
    try {
      const response = await zarinpal.PaymentVerification({
        Amount: 1000, // You should look up the real amount by transactionId
        Authority: transactionId,
      });
      if (response.status === 100) {
        return {
          transactionId,
          status: "paid",
        };
      }
      return { transactionId, status: "failed" };
    } catch (err) {
      console.error("Zarinpal verify error:", err.message);
      return { transactionId, status: "failed", error: err.message };
    }
  } else {
    // Fallback: always success
    return {
      transactionId,
      status: "paid",
    };
  }
}

module.exports = { initiatePayment, verifyPayment };
