import nodemailer from "nodemailer";

// SMTP credentials for the site's real Hostinger-hosted mailbox
// (admin@deciderspin.com) — secrets, set in .env.local only, never committed.
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const CONTACT_TO_EMAIL =
  process.env.CONTACT_TO_EMAIL || "admin@deciderspin.com";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Transient connection hiccups (DNS blips, momentary timeouts) are worth
// one retry; auth/config problems never resolve by retrying, so they fail
// immediately instead of doubling the wait before showing the same error.
const RETRYABLE_CODES = new Set([
  "ETIMEDOUT",
  "ESOCKET",
  "EDNS",
  "ECONNRESET",
  "ECONNREFUSED",
]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendContactEmail({
  name,
  email,
  message,
}: ContactMessage): Promise<void> {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) {
    throw new Error(
      "Email sending is not configured — set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env.local."
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // 465 = implicit TLS, 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
  });

  const mail = {
    from: `"DeciderSpin contact form" <${SMTP_USER}>`,
    to: CONTACT_TO_EMAIL,
    replyTo: `"${name}" <${email}>`,
    subject: `New contact form message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`,
  };

  try {
    await transporter.sendMail(mail);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code && RETRYABLE_CODES.has(code)) {
      await sleep(1000);
      await transporter.sendMail(mail);
      return;
    }
    throw err;
  }
}
