"use server";

import { sendContactEmail } from "@/lib/mail";

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormState {
  success?: boolean;
  error?: string;
  // Bumped on every submission attempt so the client can force a fresh
  // mount of the form (see components/ContactForm.tsx) — re-seeds the
  // fields from `values` below without ever making them React-controlled.
  attempt: number;
  values?: ContactFormValues;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const attempt = prevState.attempt + 1;
  const rawName = formData.get("name");
  const rawEmail = formData.get("email");
  const rawMessage = formData.get("message");
  const consent = formData.get("consent");
  // Honeypot: a field real visitors never see or fill in. Bots that
  // auto-fill every input trip it — they get a fake success, no error
  // that would tip them off, and nothing is actually sent.
  const honeypot = formData.get("company");

  const values: ContactFormValues = {
    name: typeof rawName === "string" ? rawName : "",
    email: typeof rawEmail === "string" ? rawEmail : "",
    message: typeof rawMessage === "string" ? rawMessage : "",
  };

  if (typeof honeypot === "string" && honeypot.length > 0) {
    return { success: true, attempt };
  }

  if (values.name.trim().length === 0) {
    return { error: "Enter your name.", attempt, values };
  }
  if (!EMAIL_RE.test(values.email.trim())) {
    return { error: "Enter a valid email address.", attempt, values };
  }
  if (values.message.trim().length < 5) {
    return { error: "Enter a message.", attempt, values };
  }
  if (consent !== "on") {
    return {
      error: "Please check the consent box to send your message.",
      attempt,
      values,
    };
  }

  try {
    await sendContactEmail({
      name: values.name.trim(),
      email: values.email.trim(),
      message: values.message.trim(),
    });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return {
      error:
        "Something went wrong sending your message. Please try again, or email us directly instead.",
      attempt,
      values,
    };
  }

  return { success: true, attempt };
}
