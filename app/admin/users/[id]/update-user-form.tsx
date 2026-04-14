"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { updateUser } from "@/lib/actions/user-actions";
import { USER_ROLES } from "@/lib/constants";
import { updateUserSchema } from "@/lib/validators";
import { User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UpdateUserForm({ user }: { user: User }) {
  const router = useRouter();
  const form = useForm<User>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });

  async function onSubmit(formData: User) {
    const res = await updateUser({ ...formData, id: user.id });
    if (!res.success) {
      toast.error(res.message, { className: " !text-red-50 !bg-red-500" });
      return;
    }
    toast.success(res.message);
    router.push("/admin/users");
  }

  return (
    <form
      className="space-y-8"
      method="post"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="flex flex-col md:flex-row gap-5 max-w-xl">
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Email</FieldLabel>
              <Input
                placeholder="Enter email"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5 max-w-xl">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Name</FieldLabel>
              <Input
                placeholder="Enter name"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div className="flex flex-col md:flex-row gap-5 max-w-xl">
        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel className="w-full">Role</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value.toString()}
              >
                <SelectTrigger className="w-full ">
                  <SelectValue
                    placeholder="Select a role"
                    className="capitalize"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role[0].toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
      </div>
      <div>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          size="lg"
          className="cursor-pointer "
        >
          {form.formState.isSubmitting ? "Submitting" : `Update User`}
        </Button>
      </div>
    </form>
  );
}
