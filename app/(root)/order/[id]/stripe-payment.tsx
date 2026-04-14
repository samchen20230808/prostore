// refer to react stripe js
"use client";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
  LinkAuthenticationElement,
} from "@stripe/react-stripe-js";
import { useTheme } from "next-themes";
import { FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";

export default function StripePayment({
  priceInCents,
  orderId,
  clientSecret,
}: {
  priceInCents: number;
  orderId: string;
  clientSecret: string;
}) {
  const publicKey: string = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "";
  const stripePromise = useMemo(() => loadStripe(publicKey), [publicKey]);
  const { theme } = useTheme();
  const options = useMemo(
    () =>
      ({
        clientSecret,
        appearance: { theme: theme === "dark" ? "night" : "stripe" },
      }) as StripeElementsOptions,
    [theme, clientSecret],
  );
  return (
    <Elements stripe={stripePromise} options={options}>
      <StripeForm priceInCents={priceInCents} orderId={orderId} />
    </Elements>
  );
}

function StripeForm({
  priceInCents,
  orderId,
}: {
  priceInCents: number;
  orderId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("submit");
    if (!stripe || !elements || !email) return;
    setIsLoading(true);
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${SERVER_URL}/order/${orderId}/stripe-payment-success`,
        },
      })
      .then(({ error }) => {
        if (
          error?.type === "card_error" ||
          error?.type === "validation_error"
        ) {
          setErrorMessage(error?.message ?? "An unknown error");
        } else setErrorMessage("Another unknown error");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="text-xl">Stripe Checkout</div>
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      <PaymentElement />
      <div>
        <LinkAuthenticationElement
          onChange={(e) => {
            setEmail(e.value.email);
          }}
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading
          ? "Purchasing..."
          : `Purchase ${formatCurrency(priceInCents / 100)}`}
      </Button>
    </form>
  );
}
