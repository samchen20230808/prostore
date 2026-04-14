"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpUser } from "@/lib/actions/user-actions";
import { signUpDefaultValues } from "@/lib/constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpUser, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={signUpDefaultValues.name}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="text"
            defaultValue={signUpDefaultValues.email}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="text"
            defaultValue={signUpDefaultValues.password}
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="text"
            defaultValue={signUpDefaultValues.confirmPassword}
          />
        </div>
        <div>
          <Button
            variant="default"
            className="w-full cursor-pointer"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Sign Up..." : "Sign Up"}
          </Button>
        </div>
        {state.success === false && (
          <div className="text-center text-destructive">{state.message}</div>
        )}
        <div className="text-sm text-center text-muted-foreground">
          Already have an account? <Link href="/signin">Sign In</Link>
        </div>
      </div>
    </form>
  );
}
