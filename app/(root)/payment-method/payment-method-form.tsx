"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user-actions";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { paymentMethodSchema } from "@/lib/validators";
import { PaymentMethod } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function PaymentMethodForm({
  preferedPaymentMethod,
}: {
  preferedPaymentMethod?: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<PaymentMethod>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: { type: preferedPaymentMethod || DEFAULT_PAYMENT_METHOD },
  });

  function onSubmit(data: PaymentMethod) {
    console.log(data);
    startTransition(async () => {
      const res = await updateUserPaymentMethod(data);
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
      router.push("/place-order");
    });
  }
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Payment Method</h1>
        <p className="text-sm text-muted-foreground">
          Please select a payment method
        </p>

        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={preferedPaymentMethod}
                    {...field}
                    className="flex flex-col gap-y-2"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <div key={method} className="flex items-center gap-x-3">
                        <RadioGroupItem value={method} id={method} />
                        <Label htmlFor={method}>{method}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              </div>
            )}
          />

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              Continue
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
