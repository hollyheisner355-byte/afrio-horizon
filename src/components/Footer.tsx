import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings, splitBrandName } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings } = useSiteSettings();
  const brand = splitBrandName(settings.site_name);

  return (
    <footer className="bg-foreground text-background/80 py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {settings.logo_url && (
                <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-8 rounded-lg object-cover" />
              )}
              <h3 className="font-display text-xl font-bold text-background">
                {brand.first}<span className="text-primary">{brand.accent}</span>
              </h3>
            </div>
            <p className="text-background/50 text-sm leading-relaxed mb-5">
              Your gateway to Africa's most extraordinary wildlife experiences. 
              Luxury safaris crafted with passion.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-background/5 hover:bg-primary/20 flex items-center justify-center text-background/40 hover:text-primary transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-background text-sm mb-4 tracking-wide uppercase">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Destinations", to: "/#destinations" },
                { label: "Tour Packages", to: "/packages" },
                { label: "Accommodations", to: "/accommodations" },
                { label: "Blog", to: "/blog" },
                { label: "About Us", to: "/#about" },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-background/50 hover:text-primary transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background text-sm mb-4 tracking-wide uppercase">Destinations</h4>
            <ul className="space-y-2.5 text-sm">
              {["Kenya", "Tanzania", "South Africa", "Zanzibar", "Uganda", "Botswana"].map((dest) => (
                <li key={dest}>
                  <a href="#" className="text-background/50 hover:text-primary transition-colors">{dest}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background text-sm mb-4 tracking-wide uppercase">Head Office</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2.5 text-background/50">
                <MapPin size={15} className="text-primary shrink-0" /> Nairobi, Kenya
              </p>
              <p className="flex items-center gap-2.5 text-background/50">
                <Phone size={15} className="text-primary shrink-0" /> {settings.contact_phone || "+254 700 123 456"}
              </p>
              <p className="flex items-center gap-2.5 text-background/50">
                <Mail size={15} className="text-primary shrink-0" /> {settings.contact_email || "info@safarihorizons.com"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-background/30 text-xs">
            © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
          </p>
          <div className="flex gap-5 text-xs text-background/30">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
