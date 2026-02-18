import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold text-background mb-4">
              Safari<span className="text-primary">Horizons</span>
            </h3>
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              Your gateway to Africa's most extraordinary wildlife experiences. 
              Luxury safaris crafted with passion since 2010.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="text-background/40 hover:text-primary transition-colors">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-background mb-4">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {["Destinations", "Tour Packages", "Accommodations", "Blog", "About Us"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-background/60 hover:text-primary transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-display font-bold text-background mb-4">Destinations</h4>
            <ul className="space-y-3 text-sm">
              {["Kenya", "Tanzania", "South Africa", "Zanzibar", "Uganda", "Botswana"].map((dest) => (
                <li key={dest}>
                  <a href="#" className="text-background/60 hover:text-primary transition-colors">{dest}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-background mb-4">Head Office</h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-background/60">
                <MapPin size={16} className="text-primary" /> Nairobi, Kenya
              </p>
              <p className="flex items-center gap-2 text-background/60">
                <Phone size={16} className="text-primary" /> +254 700 123 456
              </p>
              <p className="flex items-center gap-2 text-background/60">
                <Mail size={16} className="text-primary" /> info@safarihorizons.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/40 text-sm">
            © 2026 SafariHorizons. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-background/40">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
