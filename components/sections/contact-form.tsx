"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { gsap } from "@/components/animations/gsap-setup";
import { submitContactForm, type ContactFormState } from "@/app/(site)/contact/actions";

const initialState: ContactFormState = { status: "idle" };

interface ContactFormProps {
  serviceOptions: string[];
}

export function ContactForm({ serviceOptions }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const successRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success" && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
      formRef.current?.reset();
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div ref={successRef} className="flex flex-col items-center justify-center border border-blue-500/20 bg-blue-50 px-8 py-16 text-center">
        <CheckCircle2 className="h-10 w-10 text-blue-500" strokeWidth={1.5} />
        <h3 className="mt-4 font-display text-xl font-semibold text-heading">Message sent</h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Thanks for reaching out. We typically respond within one business day.
        </p>
      </div>
    );
  }

  const fieldError = (name: string) => (state.status === "error" ? state.fieldErrors?.[name] : undefined);

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {/* Honeypot — hidden from real users, catches naive bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" required error={fieldError("name")} />
        <Field label="Email" name="email" type="email" required error={fieldError("email")} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" type="tel" error={fieldError("phone")} />
        <Field label="Company" name="company" error={fieldError("company")} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Service
          </label>
          <select
            id="service"
            name="service"
            className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-blue-400 focus:outline-hidden"
            defaultValue=""
          >
            <option value="">Select a service</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Budget Range
          </label>
          <select
            id="budget"
            name="budget"
            className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-blue-400 focus:outline-hidden"
            defaultValue=""
          >
            <option value="">Select a range</option>
            <option value="Under $10k">Under $10k</option>
            <option value="$10k – $50k">$10k – $50k</option>
            <option value="$50k – $150k">$50k – $150k</option>
            <option value="$150k+">$150k+</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Message <span className="text-blue-500">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-blue-400 focus:outline-hidden"
        />
        {fieldError("message") && <p className="mt-1.5 text-xs text-red-600">{fieldError("message")}</p>}
      </div>

      {state.status === "error" && !state.fieldErrors && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="clip-corner-sm inline-flex w-full items-center justify-center gap-2 bg-blue-500 px-6 py-3.5 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-blue-600 disabled:opacity-60"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label} {required && <span className="text-blue-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-border bg-white px-3 py-2.5 text-sm text-heading focus:border-blue-400 focus:outline-hidden"
      />
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
