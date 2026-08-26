"use client";

import { useState, type FormEvent } from "react";

const fieldClass =
  "w-full px-3 py-2.5 rounded-md border border-card-border bg-card text-text placeholder:text-text-muted text-sm outline-none focus:border-accent-2 transition-colors";
const labelClass =
  "block text-xs font-semibold uppercase tracking-wide text-text-muted mb-2";

type Status = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
      company: formData.get("company"),
    };

    try {
      // WordPress stays running purely as a mail-relay backend for this
      // static-exported site — see wp-content/novamira-sandbox/
      // deciderspin-contact.php on the server for the endpoint itself.
      const res = await fetch("/wp-json/deciderspin/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { success?: boolean; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (res.ok && data.success) {
        setStatus("success");
        return;
      }

      setError(
        data.error ||
          "Something went wrong sending your message. Please try again, or email us directly instead."
      );
      setStatus("error");
    } catch {
      setError(
        "Something went wrong sending your message. Please try again, or email us directly instead."
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="text-sm rounded-2xl border border-card-border bg-card p-6 max-w-md backdrop-blur">
        <span className="font-semibold">
          Thanks — your message is on its way.
        </span>{" "}
        We read everything and reply when we can.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md w-full">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" name="name" type="text" required className={fieldClass} />
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
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div className="flex items-start gap-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1" />
        <label
          htmlFor="consent"
          className="text-xs text-text-muted leading-relaxed"
        >
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

      {status === "error" && error && (
        <p className="text-sm text-[#ffb4c8]" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="font-semibold text-sm px-6 py-3 rounded-xl bg-gradient-to-br from-accent-2 to-[#5a3fe0] text-white hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "sending" ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
