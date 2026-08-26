"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  submitContactForm,
  ContactFormState,
} from "@/app/contact/actions";

const initialState: ContactFormState = { attempt: 0 };

const fieldClass =
  "w-full px-3 py-2.5 rounded-md border border-card-border bg-card text-text placeholder:text-text-muted text-sm outline-none focus:border-accent-2 transition-colors";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-text-muted mb-2";

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="font-semibold text-sm px-6 py-3 rounded-xl bg-gradient-to-br from-accent-2 to-[#5a3fe0] text-white hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Sending…" : "Submit"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <p className="text-sm rounded-2xl border border-card-border bg-card p-6 max-w-md backdrop-blur">
        <span className="font-semibold">Thanks — your message is on its way.</span>{" "}
        We read everything and reply when we can.
      </p>
    );
  }

  return (
    <form key={state.attempt} action={formAction} className="space-y-4 max-w-md w-full">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={state.values?.name}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={state.values?.email}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Comment or Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          defaultValue={state.values?.message}
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1"
        />
        <label htmlFor="consent" className="text-xs text-text-muted leading-relaxed">
          I consent to DeciderSpin collecting my name and email for the
          purpose of responding to my inquiry. See our{" "}
          <a href="/privacy-policy/" className="underline hover:text-text">
            Privacy Policy
          </a>{" "}
          for details.
        </label>
      </div>

      {/* Honeypot — clipped to zero height rather than display:none, since
          some bots specifically skip display:none fields. */}
      <div className="h-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.error && (
        <p className="text-sm text-[#ffb4c8]" role="alert">
          {state.error}
        </p>
      )}

      <SendButton />
    </form>
  );
}
