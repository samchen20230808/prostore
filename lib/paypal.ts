const base = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

export const paypal = {
  createOrder: async function createOrder(price: number) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;
    console.log({ accessToken });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
            },
          },
        ],
      }),
    });
    const data = await handleResponse(response);
    return data;
  },

  capturePayment: async function capturePayment(orderId: string) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;
    console.log({ url });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    try {
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.log("capturePayment error");
      throw error;
    }
  },
};

// curl -v -X POST "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
//  -u "CLIENT_ID:CLIENT_SECRET" \
//  -H "Content-Type: application/x-www-form-urlencoded" \
//  -d "grant_type=client_credentials"

export async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env;
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    "base64",
  );
  console.log({ PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET });
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`, //  對應 -u
    },
    body: "grant_type=client_credentials", // 對應 -d
  });
  const data = await handleResponse(response);
  return data.access_token;
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return await response.json();
}
