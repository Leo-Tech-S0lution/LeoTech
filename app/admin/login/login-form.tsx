"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { loginAction } from "./actions";
import { Input, Label } from "@/components/admin/ui/input";
import type { ActionResult } from "@/lib/validation/common";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-slate-200">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-400"
          placeholder="you@leotechsolution.com"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-slate-200">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-blue-400"
          placeholder="••••••••"
        />
      </div>

      {state && !state.success ? (
        <p className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <Lock className="h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
