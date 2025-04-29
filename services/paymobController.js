const { generatePaymentURL } = require("./paymobService");
const Order = require("../models/orderModel");

exports.createPayment = async (req, res) => {
  try {
    const { cartItems, shippingAddress, totalOrderPrice, user } = req.body;

    const { paymentURL } = await generatePaymentURL(
      cartItems,
      shippingAddress,
      totalOrderPrice,
      user
    );

    res.status(200).json({ paymentURL });
  } catch (error) {
    console.error(
      "Create Payment Error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ message: "Error creating payment link", error: error.message });
  }
};

// Webhook callback from Paymob
exports.paymentCallback = async (req, res) => {
  try {
    const { obj } = req.body;

    if (obj.success === true) {
      const userId = req.query.userId;
      const cartItems = JSON.parse(req.query.cartItems);
      const shippingAddress = JSON.parse(req.query.shippingAddress);

      const newOrder = await Order.create({
        user: userId,
        cartItems,
        shippingAddress,
        totalOrderPrice: obj.amount_cents / 100,
        paymentMethodType: "card",
        isPaid: true,
        paidAt: Date.now(),
      });

      console.log("✅ Order created after payment!", newOrder);
    }

    res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error("❌ Callback Error:", error.message);
    res.status(500).json({ message: "Callback error", error: error.message });
  }
};
