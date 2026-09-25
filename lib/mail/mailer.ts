import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { ContactSubmission } from "@/lib/db/schema";

/**
 * SMTP-backed mailer for admin notifications. If SMTP isn't configured the
 * helpers log and return — a missing mail setup must never break a form.
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  if (!transporter) {
    const port = Number(SMTP_PORT) || 587;
    // SMTP_SECURE overrides the port heuristic when set explicitly.
    const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
    const secure = secureEnv ? secureEnv === "true" : port === 465; // 465 = implicit TLS; 587 upgrades via STARTTLS
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function notifyAdminOfInquiry(inquiry: ContactSubmission): Promise<void> {
  const mailer = getTransporter();
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!mailer || !to) {
    console.warn("[mailer] SMTP not configured — skipping admin notification.");
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const fields: [string, string | null][] = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Company", inquiry.company],
    ["Service", inquiry.service],
    ["Budget", inquiry.budget],
  ];
  const present = fields.filter((f): f is [string, string] => Boolean(f[1]));

  const text = [
    ...present.map(([k, v]) => `${k}: ${v}`),
    "",
    inquiry.message,
    "",
    `View in admin: ${siteUrl}/admin/messages`,
  ].join("\n");

  const html = `
    <h2 style="margin:0 0 12px">New contact inquiry</h2>
    <table cellpadding="4" style="border-collapse:collapse">
      ${present
        .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
        .join("")}
    </table>
    <p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
    <p><a href="${siteUrl}/admin/messages">View in admin</a></p>`;

  await mailer.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: inquiry.email,
    subject: `New inquiry from ${inquiry.name.replace(/[\r\n]+/g, " ")}`,
    text,
    html,
  });
}

/**
 * Short admin notification for team/QR events (member created, deactivated,
 * QR generated). Fire-and-forget: failures are logged, never thrown.
 */
export async function notifyAdmin(subject: string, lines: string[], adminPath?: string): Promise<void> {
  const mailer = getTransporter();
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;
  if (!mailer || !to) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const link = adminPath ? `${siteUrl}${adminPath}` : null;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: subject.replace(/[\r\n]+/g, " "),
      text: [...lines, ...(link ? ["", `Open in admin: ${link}`] : [])].join("\n"),
      html: `
    <h2 style="margin:0 0 12px">${escapeHtml(subject)}</h2>
    ${lines.map((l) => `<p style="margin:4px 0">${escapeHtml(l)}</p>`).join("")}
    ${link ? `<p><a href="${escapeHtml(link)}">Open in admin</a></p>` : ""}`,
    });
  } catch (err) {
    console.error("[mailer] admin notification failed:", err);
  }
}
