import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "npm:@supabase/supabase-js@2.49.4/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Email templates
const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  booking_confirmation: (data) => ({
    subject: `🎉 Booking Confirmed - ${data.packageTitle || "Your Safari"}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1a4d2e 0%,#2d7a4a 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Booking Confirmed! ✅</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${data.siteName || "SafariHorizons"}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Your safari booking has been confirmed! Here are your details:</p>
    
    <table width="100%" style="background:#f8faf9;border-radius:12px;padding:20px;margin:0 0 24px;">
      <tr><td style="padding:8px 20px;"><span style="color:#888;font-size:13px;">Package</span><br><strong style="color:#333;">${data.packageTitle || "Safari Package"}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:13px;">Travel Date</span><br><strong style="color:#333;">${data.travelDate || "TBD"}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:13px;">Guests</span><br><strong style="color:#333;">${data.guests || 1}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:13px;">Total Price</span><br><strong style="color:#1a4d2e;font-size:18px;">$${data.totalPrice || "0"}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:13px;">Deposit (50%)</span><br><strong style="color:#c9822a;">$${data.deposit || "0"}</strong></td></tr>
      ${data.agentName ? `<tr><td style="padding:8px 20px;border-top:1px solid #e8ece9;"><span style="color:#888;font-size:13px;">Your Agent</span><br><strong style="color:#333;">${data.agentName}</strong> (${data.agentRegion || ""})</td></tr>` : ""}
    </table>
    
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px;">Your assigned agent will contact you to arrange the deposit payment and finalize your travel plans.</p>
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Happy travels! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#f8faf9;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),

  booking_pending: (data) => ({
    subject: `📋 New Booking Received - ${data.packageTitle || "Safari"}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#c9822a 0%,#e6a84d 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Booking Received 📋</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${data.siteName || "SafariHorizons"}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Thank you for your booking! We've received your request and our team is reviewing it. You'll receive a confirmation shortly.</p>
    
    <table width="100%" style="background:#fdf8f0;border-radius:12px;padding:20px;margin:0 0 24px;">
      <tr><td style="padding:8px 20px;"><span style="color:#888;font-size:13px;">Package</span><br><strong style="color:#333;">${data.packageTitle || "Safari Package"}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #f0e6d6;"><span style="color:#888;font-size:13px;">Guests</span><br><strong style="color:#333;">${data.guests || 1}</strong></td></tr>
      <tr><td style="padding:8px 20px;border-top:1px solid #f0e6d6;"><span style="color:#888;font-size:13px;">Total</span><br><strong style="color:#333;">$${data.totalPrice || "0"}</strong></td></tr>
    </table>
    
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#fdf8f0;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),

  invoice: (data) => ({
    subject: `💰 Invoice - ${data.packageTitle || "Safari Booking"} #${(data.bookingId || "").slice(0, 8)}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1a2b4a 0%,#2e4a7a 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Invoice 💰</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${data.siteName || "SafariHorizons"}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Here is your invoice for booking <strong>#${(data.bookingId || "").slice(0, 8)}</strong>:</p>
    
    <table width="100%" style="border:1px solid #e0e4e8;border-radius:12px;overflow:hidden;margin:0 0 24px;">
      <tr style="background:#f0f3f6;"><td style="padding:12px 20px;font-weight:bold;color:#333;">Item</td><td style="padding:12px 20px;text-align:right;font-weight:bold;color:#333;">Amount</td></tr>
      <tr><td style="padding:12px 20px;color:#555;border-top:1px solid #e0e4e8;">${data.packageTitle || "Safari Package"} × ${data.guests || 1} guest(s)</td><td style="padding:12px 20px;text-align:right;color:#333;border-top:1px solid #e0e4e8;">$${data.totalPrice || "0"}</td></tr>
      <tr style="background:#f0f3f6;"><td style="padding:12px 20px;font-weight:bold;color:#333;">Deposit Required (50%)</td><td style="padding:12px 20px;text-align:right;font-weight:bold;color:#c9822a;font-size:18px;">$${data.deposit || "0"}</td></tr>
      <tr><td style="padding:12px 20px;color:#888;border-top:1px solid #e0e4e8;">Balance Due Before Departure</td><td style="padding:12px 20px;text-align:right;color:#333;border-top:1px solid #e0e4e8;">$${data.balance || "0"}</td></tr>
    </table>
    
    ${data.customMessage ? `<div style="background:#f8faf9;border-left:4px solid #2d7a4a;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"><p style="color:#555;font-size:14px;margin:0;">${data.customMessage}</p></div>` : ""}
    
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 8px;">Please contact your assigned agent to arrange payment.</p>
    ${data.agentName ? `<p style="color:#555;font-size:14px;margin:0 0 24px;"><strong>Agent:</strong> ${data.agentName} ${data.agentEmail ? `(<a href="mailto:${data.agentEmail}" style="color:#2d7a4a;">${data.agentEmail}</a>)` : ""}</p>` : ""}
    
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Thank you for choosing us! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#f0f3f6;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),

  booking_cancelled: (data) => ({
    subject: `❌ Booking Cancelled - ${data.packageTitle || "Safari"}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#8b2020 0%,#b33a3a 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Booking Cancelled</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${data.siteName || "SafariHorizons"}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">Unfortunately, your booking for <strong>${data.packageTitle || "Safari"}</strong> has been cancelled.</p>
    ${data.customMessage ? `<div style="background:#fef2f2;border-left:4px solid #b33a3a;padding:16px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;"><p style="color:#555;font-size:14px;margin:0;">${data.customMessage}</p></div>` : ""}
    <p style="color:#555;font-size:14px;line-height:1.6;">If you have any questions, please don't hesitate to contact us.</p>
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#fef2f2;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),

  custom: (data) => ({
    subject: data.subject || "Message from SafariHorizons",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#1a4d2e 0%,#2d7a4a 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:24px;margin:0;">${data.siteName || "SafariHorizons"}</h1>
  </td></tr>
  <tr><td style="padding:40px;">
    ${data.guestName ? `<p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName}</strong>,</p>` : ""}
    <div style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px;">${data.customMessage || data.body || ""}</div>
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Best regards,<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#f8faf9;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),

  booking_completed: (data) => ({
    subject: `🌟 Safari Complete! Leave us a review - ${data.siteName || "SafariHorizons"}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:linear-gradient(135deg,#c9822a 0%,#e6a84d 100%);padding:40px 40px 30px;text-align:center;">
    <h1 style="color:#ffffff;font-size:28px;margin:0 0 8px;">Safari Complete! 🌟</h1>
    <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:0;">${data.siteName || "SafariHorizons"}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 20px;">Dear <strong>${data.guestName || "Traveler"}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">We hope you had an incredible experience on your <strong>${data.packageTitle || "Safari"}</strong>! 🎉</p>
    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">We'd love to hear about your adventure. Your feedback helps other travelers discover the magic of Africa.</p>
    <p style="color:#888;font-size:13px;margin:24px 0 0;">Until next time! 🌍<br><strong>${data.siteName || "SafariHorizons"} Team</strong></p>
  </td></tr>
  <tr><td style="background:#fdf8f0;padding:20px 40px;text-align:center;">
    <p style="color:#aaa;font-size:12px;margin:0;">${data.siteName || "SafariHorizons"} • ${data.contactEmail || ""}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`,
  }),
};

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

    // Build template data
    const templateData = { ...data, guestName: recipientName || data?.guestName };
    
    // For custom emails, allow subject/body override
    if (templateType === "custom" && customSubject) {
      templateData.subject = customSubject;
    }
    if (templateType === "custom" && customBody) {
      templateData.customMessage = customBody;
    }

    const templateFn = templates[templateType] || templates.custom;
    const { subject, html } = templateFn(templateData);

    // Send email using Lovable AI Gateway
    const emailResponse = await fetch("https://email-service.lovable.dev/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html,
        from: `${data?.siteName || "SafariHorizons"} <noreply@lovable.dev>`,
      }),
    });

    let emailResult: any = {};
    let sent = false;
    
    if (emailResponse.ok) {
      emailResult = await emailResponse.json();
      sent = true;
    } else {
      const errText = await emailResponse.text();
      console.error("Email send failed:", errText);
      emailResult = { error: errText };
    }

    // Update notification record if provided
    if (notificationId) {
      await supabaseAdmin.from("email_notifications").update({
        status: sent ? "sent" : "failed",
        sent_at: sent ? new Date().toISOString() : null,
      }).eq("id", notificationId);
    }

    return new Response(JSON.stringify({ success: sent, ...emailResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: sent ? 200 : 500,
    });
  } catch (err: any) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
