import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, Send, Clock, Mail, FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface EmailDialogProps {
  booking: any;
  siteSettings: any;
  onClose: () => void;
  onSent: () => void;
}

const EMAIL_TEMPLATES = [
  { value: "booking_confirmation", label: "✅ Booking Confirmation", description: "Notify guest their booking is confirmed" },
  { value: "booking_pending", label: "📋 Booking Received", description: "Acknowledge new booking submission" },
  { value: "invoice", label: "💰 Invoice", description: "Send payment invoice with deposit details" },
  { value: "booking_cancelled", label: "❌ Cancellation Notice", description: "Notify guest of booking cancellation" },
  { value: "booking_completed", label: "🌟 Safari Complete", description: "Post-trip thank you & review request" },
  { value: "custom", label: "✉️ Custom Email", description: "Write a custom email to the guest" },
];

const AdminEmailDialog = ({ booking, siteSettings, onClose, onSent }: EmailDialogProps) => {
  const [templateType, setTemplateType] = useState("booking_confirmation");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  // Extract email from booking notes
  const notesMatch = booking.notes?.match(/Email:\s*([^\s|]+)/);
  const guestEmail = notesMatch?.[1] || "";
  const nameMatch = booking.notes?.match(/Contact:\s*([^|]+)/);
  const guestName = nameMatch?.[1]?.trim() || "";

  const [recipientEmail, setRecipientEmail] = useState(guestEmail);

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error("Recipient email is required");
      return;
    }

    setSending(true);

    try {
      const totalPrice = Number(booking.total_price || 0);
      const deposit = Math.ceil(totalPrice * 0.5);
      const balance = totalPrice - deposit;

      const data = {
        packageTitle: booking.packages?.title || "Safari Package",
        travelDate: booking.travel_date || "TBD",
        guests: booking.guests,
        totalPrice: totalPrice.toLocaleString(),
        deposit: deposit.toLocaleString(),
        balance: balance.toLocaleString(),
        agentName: booking.agents?.name || "",
        agentRegion: booking.agents?.region || "",
        agentEmail: "",
        bookingId: booking.id,
        guestName: guestName,
        siteName: siteSettings?.site_name || "SafariHorizons",
        contactEmail: siteSettings?.contact_email || "",
        customMessage: additionalMessage || customBody,
      };

      // Create notification record
      const templateLabel = EMAIL_TEMPLATES.find(t => t.value === templateType)?.label || templateType;
      const { data: notif, error: notifErr } = await supabase.from("email_notifications").insert({
        booking_id: booking.id,
        recipient_email: recipientEmail,
        recipient_name: guestName,
        subject: templateType === "custom" ? customSubject : templateLabel,
        body_html: templateType === "custom" ? customBody : `Auto-generated ${templateType} email`,
        template_type: templateType,
        status: scheduleDate ? "scheduled" : "pending",
        scheduled_at: scheduleDate || null,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      } as any).select().single();

      if (notifErr) {
        console.error("Notification record error:", notifErr);
      }

      if (scheduleDate && new Date(scheduleDate) > new Date()) {
        toast.success(`Email scheduled for ${new Date(scheduleDate).toLocaleString()}`);
        onSent();
        onClose();
        setSending(false);
        return;
      }

      // Send immediately
      const { data: result, error } = await supabase.functions.invoke("send-email", {
        body: {
          templateType,
          recipientEmail,
          recipientName: guestName,
          data,
          notificationId: notif?.id,
          customSubject: templateType === "custom" ? customSubject : undefined,
          customBody: templateType === "custom" ? customBody : undefined,
        },
      });

      if (error) {
        toast.error("Failed to send email: " + error.message);
      } else if (result?.success) {
        toast.success(`Email sent to ${recipientEmail}`);
        onSent();
        onClose();
      } else {
        toast.error("Email sending failed. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }

    setSending(false);
  };

  const isCustom = templateType === "custom";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Mail size={20} className="text-primary" /> Send Email
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Booking #{booking.id.slice(0, 8)} • {booking.packages?.title}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Recipient */}
          <div>
            <Label className="text-sm font-medium">Recipient Email</Label>
            <Input
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="guest@example.com"
              className="mt-1"
              type="email"
              required
            />
            {guestName && <p className="text-xs text-muted-foreground mt-1">Guest: {guestName}</p>}
          </div>

          {/* Template selector */}
          <div>
            <Label className="text-sm font-medium">Email Template</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {EMAIL_TEMPLATES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTemplateType(t.value)}
                  className={`text-left p-3 rounded-xl border text-sm transition-all ${
                    templateType === t.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <p className="font-medium text-foreground text-xs">{t.label}</p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom fields */}
          {isCustom && (
            <>
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <Input
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Email subject line..."
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Email Body</Label>
                <Textarea
                  value={customBody}
                  onChange={e => setCustomBody(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={6}
                  className="mt-1"
                  required
                />
              </div>
            </>
          )}

          {/* Additional message for templates */}
          {!isCustom && (
            <div>
              <Label className="text-sm font-medium">Additional Message (optional)</Label>
              <Textarea
                value={additionalMessage}
                onChange={e => setAdditionalMessage(e.target.value)}
                placeholder="Add a personal note to the email..."
                rows={3}
                className="mt-1"
              />
            </div>
          )}

          {/* Schedule */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock size={14} /> Schedule (optional)
            </Label>
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Leave empty to send immediately</p>
          </div>

          {/* Booking summary */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1"><FileText size={14} /> Booking Details</p>
            <p className="text-muted-foreground">Package: {booking.packages?.title || "—"}</p>
            <p className="text-muted-foreground">Guests: {booking.guests} • Total: ${Number(booking.total_price || 0).toLocaleString()}</p>
            <p className="text-muted-foreground">Status: <span className="capitalize">{booking.status}</span></p>
            {booking.agents?.name && <p className="text-muted-foreground">Agent: {booking.agents.name} ({booking.agents.region})</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={sending || (!recipientEmail)}
            className="flex-1 rounded-full gap-2"
          >
            {sending ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" /> Sending...</>
            ) : scheduleDate && new Date(scheduleDate) > new Date() ? (
              <><Clock size={16} /> Schedule</>
            ) : (
              <><Send size={16} /> Send Now</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailDialog;
