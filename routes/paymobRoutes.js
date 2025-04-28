const express = require("express");
const {
  createPayment,
  paymentCallback,
} = require("../services/paymobController");

const router = express.Router();

router.post("/create-payment", createPayment);
router.post("/callback", express.json({ type: "*/*" }), paymentCallback);

module.exports = router;
