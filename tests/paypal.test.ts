import { generateAccessToken, paypal } from "../lib/paypal";

// test generateAccessToken()
test("generate token form paypal", async () => {
  const token = await generateAccessToken();
  console.log(token);
  expect(typeof token).toBe("string");
  expect(token.length).toBeGreaterThan(0);
});

// test create a paypal order
test("create a paypal order", async () => {
  const price = 10.0;
  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);

  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

// test capture order
test("simulate captureing a payment from an order", async () => {
  const orderId = "100";
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({ status: "COMPLETED" });

  const captureResponse = await paypal.capturePayment(orderId);
  console.log(captureResponse);
  expect(captureResponse).toHaveProperty("status");
  expect(captureResponse.status).toBe("COMPLETED");
  mockCapturePayment.mockRestore();
});
