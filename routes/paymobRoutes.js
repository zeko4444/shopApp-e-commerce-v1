const express = require("express");
const {
  createPayment,
  paymentCallback,
} = require("../services/paymobController");

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/callback", express.json({ type: "*/*" }), paymentCallback);

// GET: user is redirected here after payment (success or failure)
router.get("/callback", (req, res) => {
  console.log("GET callback received", req.query);

  if (req.query.success === "true") {
    res.send("✅ Payment successful! Thank you for your order.");
  } else {
    res.send("❌ Payment failed. Please try again.");
  }
});

module.exports = router;
