"use server";

import { after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { contactSubmissions } from "@/lib/db/schema";
import { notifyAdminOfInquiry } from "@/lib/mail/mailer";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(160),
  email: z.string().trim().email("Please enter a valid email address.").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  service: z.string().trim().max(160).optional().or(z.literal("")),
  budget: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a bit more about your project.").max(5000),
  // Honeypot field: real users never fill this in; bots that auto-fill every field will.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Please check the form for errors.", fieldErrors };
  }

  if (parsed.data.website) {
    // Honeypot tripped — silently pretend success so the bot moves on.
    return { status: "success" };
  }

  try {
    const [inquiry] = await db
      .insert(contactSubmissions)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        company: parsed.data.company || null,
        service: parsed.data.service || null,
        budget: parsed.data.budget || null,
        message: parsed.data.message,
      })
      .returning();

    // Send after the response so a slow/failed SMTP call never delays or fails the form.
    if (inquiry) {
      after(() =>
        notifyAdminOfInquiry(inquiry).catch((err) => console.error("[mailer] Admin notification failed:", err)),
      );
    }
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong sending your message. Please try again or email us directly." };
  }
}
