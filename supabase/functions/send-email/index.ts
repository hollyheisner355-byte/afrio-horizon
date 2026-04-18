import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---------- Email templates (compact, branded) ----------
const wrapEmail = (data: any, body: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
${body}
<tr><td style="background:#f8faf9;padding:20px 40px;text-align:center;">
  <p style="color:#aaa;font-size:12px;margin:0 0 4px;">${data.siteName || "SafariHorizons"}</p>
  ${data.contactEmail ? `<p style="color:#aaa;font-size:11px;margin:0;">${data.contactEmail}${data.contactPhone ? " • " + data.contactPhone : ""}</p>` : ""}
</td></tr>
</table></td></tr></table></body></html>`;

const header = (title: string, gradient: string, data: any) => `
<tr><td style="background:linear-gradient(135deg,${gradient});padding:40px 40px 30px;text-align:center;">
  <h1 style="color:#fff;font-size:26px;margin:0 0 6px;">${title}</h1>
  <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">${data.siteName || "SafariHorizons"}</p>
</td></tr>`;

// Renders payment methods block (used in invoice + confirmation)
const paymentBlock = (data: any) => {
  const methods = Array.isArray(data.paymentMethods) ? data.paymentMethods : [];
  if (methods.length === 0) return "";
  const intro = data.paymentIntro || "Please use one of the payment methods below to complete your payment. Always include your booking reference.";
  const methodsHtml = methods.map((m: any) => `
    <div style="border:1px solid #e0e4e8;border-radius:10px;padding:14px 18px;margin:0 0 10px;background:#fff;">
      <p style="margin:0 0 6px;color:#1a4d2e;font-weight:bold;font-size:14px;">${m.name}</p>
      <pre style="margin:0;font-family:'Courier New',monospace;font-size:12px;color:#444;white-space:pre-wrap;background:#f8faf9;padding:10px;border-radius:6px;">${(m.instructions || "").replace(/</g, "&lt;")}</pre>
    </div>`).join("");
  return `
    <div style="background:#fdf8f0;border-left:4px solid #c9822a;padding:16px 18px;border-radius:0 8px 8px 0;margin:0 0 16px;">
      <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">💳 <strong>Payment Information</strong></p>
      <p style="margin:6px 0 0;color:#555;font-size:13px;line-height:1.6;">${intro}</p>
    </div>
    ${methodsHtml}`;
};

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  booking_confirmation: (data) => ({
    subject: `🎉 Booking Confirmed - ${data.packageTitle || "Your Safari"}`,
    html: wrapEmail(data, header("Booking Confirmed! ✅", "#1a4d2e 0%,#2d7a4a 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Your safari booking has been confirmed! Here are your details:</p>
  <table width="100%" style="background:#f8faf9;border-radius:12px;padding:16px;margin:0 0 20px;">
    <tr><td style="padding:8px 16px;"><span style="color:#888;font-size:12px;">Package</span><br><strong>${data.packageTitle}</strong></td></tr>
    <tr><td style="padding:8px 16px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:12px;">Travel Date</span><br><strong>${data.travelDate || "TBD"}</strong></td></tr>
    <tr><td style="padding:8px 16px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:12px;">Guests</span><br><strong>${data.guests || 1}</strong></td></tr>
    <tr><td style="padding:8px 16px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:12px;">Total</span><br><strong style="color:#1a4d2e;font-size:17px;">$${data.totalPrice || 0}</strong></td></tr>
    <tr><td style="padding:8px 16px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:12px;">Deposit (50%)</span><br><strong style="color:#c9822a;">$${data.deposit || 0}</strong></td></tr>
    ${data.agentName ? `<tr><td style="padding:8px 16px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:12px;">Your Agent</span><br><strong>${data.agentName}</strong> (${data.agentRegion || ""})</td></tr>` : ""}
  </table>
    ${data.customMessage ? `<div style="background:#f8faf9;border-left:4px solid #2d7a4a;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px;color:#555;font-size:14px;">${data.customMessage}</div>` : ""}
  ${paymentBlock(data)}
  <p style="color:#555;font-size:14px;line-height:1.6;">Your assigned agent will contact you to arrange the deposit payment.</p>
  <p style="color:#888;font-size:13px;margin:20px 0 0;">Happy travels! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  booking_pending: (data) => ({
    subject: `📋 Booking Received - ${data.packageTitle || "Safari"}`,
    html: wrapEmail(data, header("Booking Received 📋", "#c9822a 0%,#e6a84d 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">Thank you for your booking! We've received your request and will confirm shortly.</p>
  <table width="100%" style="background:#fdf8f0;border-radius:12px;padding:16px;margin:0 0 20px;">
    <tr><td style="padding:8px 16px;"><strong>${data.packageTitle}</strong> × ${data.guests || 1} • <strong>$${data.totalPrice || 0}</strong></td></tr>
  </table>
  <p style="color:#888;font-size:13px;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  invoice: (data) => ({
    subject: `💰 Invoice - ${data.packageTitle} #${(data.bookingId || "").slice(0, 8)}`,
    html: wrapEmail(data, header("Invoice 💰", "#1a2b4a 0%,#2e4a7a 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
  <p style="color:#555;font-size:15px;margin:0 0 20px;">Invoice for booking <strong>#${(data.bookingId || "").slice(0, 8)}</strong>:</p>
  <table width="100%" style="border:1px solid #e0e4e8;border-radius:12px;overflow:hidden;margin:0 0 20px;">
    <tr style="background:#f0f3f6;"><td style="padding:12px 18px;font-weight:bold;">Item</td><td style="padding:12px 18px;text-align:right;font-weight:bold;">Amount</td></tr>
    <tr><td style="padding:12px 18px;border-top:1px solid #e0e4e8;">${data.packageTitle} × ${data.guests || 1}</td><td style="padding:12px 18px;text-align:right;border-top:1px solid #e0e4e8;">$${data.totalPrice || 0}</td></tr>
    <tr style="background:#f0f3f6;"><td style="padding:12px 18px;font-weight:bold;">Deposit (50%)</td><td style="padding:12px 18px;text-align:right;font-weight:bold;color:#c9822a;font-size:17px;">$${data.deposit || 0}</td></tr>
    <tr><td style="padding:12px 18px;color:#888;border-top:1px solid #e0e4e8;">Balance due before departure</td><td style="padding:12px 18px;text-align:right;border-top:1px solid #e0e4e8;">$${data.balance || 0}</td></tr>
  </table>
  ${data.customMessage ? `<div style="background:#f8faf9;border-left:4px solid #2d7a4a;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 20px;color:#555;font-size:14px;">${data.customMessage}</div>` : ""}
  ${paymentBlock(data)}
  <p style="color:#555;font-size:14px;">Please contact your agent to arrange payment if you have questions.</p>
  <p style="color:#888;font-size:13px;margin:20px 0 0;">Thank you! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  booking_cancelled: (data) => ({
    subject: `Booking Cancelled - ${data.packageTitle}`,
    html: wrapEmail(data, header("Booking Cancelled", "#8b2020 0%,#b33a3a 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Your booking for <strong>${data.packageTitle}</strong> has been cancelled.</p>
  ${data.customMessage ? `<div style="background:#fef2f2;border-left:4px solid #b33a3a;padding:14px 18px;border-radius:0 8px 8px 0;margin:0 0 16px;color:#555;font-size:14px;">${data.customMessage}</div>` : ""}
  <p style="color:#555;font-size:14px;">If you have any questions, please contact us.</p>
  <p style="color:#888;font-size:13px;margin:20px 0 0;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  booking_completed: (data) => ({
    subject: `🌟 Safari Complete! - ${data.siteName || "SafariHorizons"}`,
    html: wrapEmail(data, header("Safari Complete! 🌟", "#c9822a 0%,#e6a84d 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">We hope you had an incredible experience on <strong>${data.packageTitle}</strong>! 🎉</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">We'd love to hear about your adventure. Your feedback helps other travelers discover the magic of Africa.</p>
  <p style="color:#888;font-size:13px;">Until next time! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  custom: (data) => ({
    subject: data.subject || `Message from ${data.siteName || "SafariHorizons"}`,
    html: wrapEmail(data, header(data.siteName || "SafariHorizons", "#1a4d2e 0%,#2d7a4a 100%", data) + `
<tr><td style="padding:40px;">
  ${data.guestName ? `<p style="color:#333;font-size:16px;margin:0 0 16px;">Dear <strong>${data.guestName}</strong>,</p>` : ""}
  <div style="color:#555;font-size:15px;line-height:1.8;margin:0 0 20px;">${(data.customMessage || data.body || "").replace(/\n/g, "<br>")}</div>
  <p style="color:#888;font-size:13px;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
</td></tr>`),
  }),

  test: (data) => ({
    subject: `✅ SMTP Test Email - ${data.siteName || "SafariHorizons"}`,
    html: wrapEmail(data, header("SMTP Test Successful! ✅", "#1a4d2e 0%,#2d7a4a 100%", data) + `
<tr><td style="padding:40px;">
  <p style="color:#333;font-size:16px;margin:0 0 16px;">Hello!</p>
  <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Your SMTP configuration is working correctly. This email was sent at <strong>${new Date().toLocaleString()}</strong>.</p>
  <p style="color:#888;font-size:13px;margin:20px 0 0;"><strong>${data.siteName || "SafariHorizons"}</strong></p>
</td></tr>`),
  }),
};

// ---------- SMTP send with relaxed TLS + plain fallback ----------
async function sendViaSMTP(cfg: any, to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string; mode?: string }> {
  const attempts: { tls: boolean; label: string }[] = [];
  if (cfg.smtp_use_tls !== false) attempts.push({ tls: true, label: "TLS" });
  attempts.push({ tls: false, label: "PLAIN" });

  let lastError = "";
  for (const attempt of attempts) {
    try {
      const client = new SMTPClient({
        connection: {
          hostname: cfg.smtp_host,
          port: Number(cfg.smtp_port) || 587,
          tls: attempt.tls,
          auth: cfg.smtp_user
            ? { username: cfg.smtp_user, password: cfg.smtp_password }
            : undefined,
        },
      });

      await client.send({
        from: `${cfg.smtp_from_name || "SafariHorizons"} <${cfg.smtp_from_email || cfg.smtp_user}>`,
        to,
        subject,
        html,
      });
      await client.close();
      return { ok: true, mode: `SMTP-${attempt.label}` };
    } catch (e: any) {
      lastError = `${attempt.label}: ${e?.message || String(e)}`;
      console.warn(`SMTP ${attempt.label} attempt failed:`, lastError);
    }
  }
  return { ok: false, error: lastError };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { templateType, recipientEmail, recipientName, data, notificationId, customSubject, customBody } = await req.json();

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "recipientEmail is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch site settings (admin-managed) — service role bypasses RLS so we get smtp_password
    const { data: settings } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const templateData = {
      ...data,
      guestName: recipientName || data?.guestName,
      siteName: data?.siteName || settings?.site_name || "SafariHorizons",
      contactEmail: data?.contactEmail || settings?.contact_email,
      contactPhone: data?.contactPhone || settings?.contact_phone,
    };
    if (templateType === "custom" && customSubject) templateData.subject = customSubject;
    if (templateType === "custom" && customBody) templateData.customMessage = customBody;

    const templateFn = templates[templateType] || templates.custom;
    const { subject, html } = templateFn(templateData);

    // Send via admin-configured SMTP
    let result: { ok: boolean; error?: string; mode?: string };
    let usedMethod = "SMTP";

    const missing: string[] = [];
    if (!settings?.smtp_host) missing.push("smtp_host");
    if (!settings?.smtp_user) missing.push("smtp_user");
    if (!settings?.smtp_password) missing.push("smtp_password");
    if (!settings?.smtp_from_email) missing.push("smtp_from_email");

    if (missing.length > 0) {
      result = {
        ok: false,
        error: `SMTP not configured. Missing: ${missing.join(", ")}. Please configure SMTP in Admin → Settings.`,
      };
      usedMethod = "none";
    } else {
      result = await sendViaSMTP(settings, recipientEmail, subject, html);
      usedMethod = result.mode || "SMTP";
    }

    if (notificationId) {
      await supabaseAdmin.from("email_notifications").update({
        status: result.ok ? "sent" : "failed",
        sent_at: result.ok ? new Date().toISOString() : null,
      }).eq("id", notificationId);
    }

    return new Response(JSON.stringify({
      success: result.ok,
      method: usedMethod,
      error: result.error,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: result.ok ? 200 : 500,
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
