import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const WhatsAppButton = () => {
  const { settings } = useSiteSettings();
  
  // Extract digits, ensure country code prefix
  const rawPhone = settings.contact_phone?.replace(/[^0-9+]/g, "") || "";
  // If starts with +, strip it; if starts with 0, prepend 254 (Kenya default)
  let phone = rawPhone.replace(/^\+/, "");
  if (phone.startsWith("0")) {
    phone = "254" + phone.slice(1);
  }
  if (!phone) phone = "254700123456";
  
  const message = encodeURIComponent(
    `Hi ${settings.site_name || "there"}, I'd like to inquire about your safari packages.`
  );

  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_40%)] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
};

export default WhatsAppButton;
