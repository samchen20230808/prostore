"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfile } from "@/lib/actions/user-actions";
import { updateProfileSchema } from "@/lib/validators";
import { Profile } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ProfileForm() {
  const { data: session, update: updateSession } = useSession();
  const form = useForm<Profile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: session?.user?.name ?? "",
      email: session?.user?.email ?? "",
    },
  });

  async function onSubmit(data: Profile) {
    console.log({ data });
    const res = await updateProfile(data);
    if (!res.success) {
      toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
      return;
    }

    // update session
    const newSession = {
      ...session,
      user: { ...session?.user, name: data.name },
    };
    console.log({ newSession });
    await updateSession(newSession);
    toast.success(res.message);
  }
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-5">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                disabled
                placeholder="Email"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                placeholder="Name"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <Button
        size="lg"
        type="submit"
        className="w-full cursor-pointer"
        disabled={form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Submitting..." : "Update Profile"}
      </Button>
    </form>
  );
}
