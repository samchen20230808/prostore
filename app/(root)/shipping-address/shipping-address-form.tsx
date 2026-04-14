"use client";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateUserAddress } from "@/lib/actions/user-actions";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { shippingAddressSchema } from "@/lib/validators";
import { ShippingAddress } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ShippingAddressForm({
  address,
}: {
  address: ShippingAddress;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  function onSubmit(data: ShippingAddress) {
    // Do something with the form values.
    console.log(data);
    startTransition(async () => {
      const res = await updateUserAddress(data);
      if (!res.success) {
        toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
        return;
      }
      toast.success(res.message);
      router.push("/payment-method");
    });
  }
  return (
    <>
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">
          Please enter and address to ship to
        </p>

        <form
          method="post"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <Controller
            name="fullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="w-full">Full Name</FieldLabel>
                  <Input
                    placeholder="Enter full name"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              </div>
            )}
          />
          <Controller
            name="streetAddress"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Address</FieldLabel>
                  <Input
                    placeholder="Enter address"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              </div>
            )}
          />
          <Controller
            name="city"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>City</FieldLabel>
                  <Input
                    placeholder="Enter city"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              </div>
            )}
          />
          <Controller
            name="postCode"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Post code</FieldLabel>
                  <Input
                    placeholder="Enter post code"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              </div>
            )}
          />
          <Controller
            name="country"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col md:flex-row gap-5">
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Country</FieldLabel>
                  <Input
                    placeholder="Enter country"
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
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
