const axios = require("axios");

const BASE_URL = "https://accept.paymob.com/api";
const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

async function generatePaymentURL(
  cartData,
  shippingAddress,
  totalOrderPrice,
  user
) {
  // Step 1: Authentication
  const { data: authData } = await axios.post(`${BASE_URL}/auth/tokens`, {
    api_key: PAYMOB_API_KEY,
  });
  const token = authData.token;

  // Step 2: Create Paymob Order
  const { data: orderData } = await axios.post(`${BASE_URL}/ecommerce/orders`, {
    auth_token: token,
    delivery_needed: false,
    amount_cents: totalOrderPrice * 100,
    currency: "EGP",
    items: cartData.map((item) => ({
      name: item.title || item.product?.title || "Item",
      amount_cents: item.price * 100,
      quantity: item.quantity,
    })),
  });

  // Step 3: Generate Payment Key
  const { data: paymentKeyData } = await axios.post(
    `${BASE_URL}/acceptance/payment_keys`,
    {
      auth_token: token,
      amount_cents: totalOrderPrice * 100,
      expiration: 3600,
      order_id: orderData.id,
      billing_data: {
        first_name: user.name,
        last_name: user.name,
        email: user.email,
        phone_number: shippingAddress.phone,
        apartment: "NA",
        floor: "NA",
        street: shippingAddress.details,
        building: "NA",
        city: shippingAddress.city,
        country: "EG",
        state: shippingAddress.city,
      },
      currency: "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
    }
  );

  const paymentURL = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`;

  return {
    paymentURL,
    paymentToken: paymentKeyData.token,
    paymobOrderId: orderData.id,
  };
}

module.exports = { generatePaymentURL };
