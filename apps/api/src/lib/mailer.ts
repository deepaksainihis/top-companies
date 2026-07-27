import nodemailer from "nodemailer";
import { env } from "@/config/env";

// In dev (no SMTP_HOST configured) we use Nodemailer's built-in jsonTransport,
// which never sends anything over the network - it just resolves so the rest
// of the flow (token creation, expiry, etc.) is exercised the same way it
// would be in production. Setting SMTP_* env vars swaps in real delivery with
// no code changes.
const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export const sendMail = async (options: { to: string; subject: string; html: string }) => {
  const info = await transporter.sendMail({
    from: env.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (!env.SMTP_HOST) {
    console.log(`\n[mailer] Dev mode - email not actually sent. Subject: "${options.subject}" -> ${options.to}`);
  }

  return info;
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  await sendMail({
    to,
    subject: "Reset your Top Companies admin password",
    html: `
      <p>We received a request to reset your Top Companies admin password.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in ${env.PASSWORD_RESET_EXPIRES_IN_MINUTES} minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });

  console.log(`\n[mailer] Password reset link for ${to}:\n  ${resetUrl}\n`);
};
