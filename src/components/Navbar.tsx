import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings, splitBrandName } from "@/hooks/useSiteSettings";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Stays", href: "/accommodations" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { settings } = useSiteSettings();
  const brand = splitBrandName(settings.site_name);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      if (!isHome) return;
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showTransparent = isHome && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${showTransparent ? "bg-transparent" : "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-18 md:h-20">
          <Link to="/" className="flex items-center gap-2.5">
            {settings.logo_url && (
              <img src={settings.logo_url} alt={settings.site_name} className="h-9 w-9 rounded-lg object-cover" />
            )}
            <span className={`font-display text-xl md:text-2xl font-bold tracking-tight ${showTransparent ? "text-primary-foreground" : "text-foreground"}`}>
              {brand.first}<span className="text-primary">{brand.accent}</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.href.startsWith("/#") ? (
                isHome ? (
                  <button key={link.label} onClick={() => handleNavClick(link.href)}
                    className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/85 hover:bg-primary-foreground/10" : "text-foreground hover:bg-muted"}`}>
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.label} to={link.href}
                    className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/85 hover:bg-primary-foreground/10" : "text-foreground hover:bg-muted"}`}>
                    {link.label}
                  </Link>
                )
              ) : (
                <Link key={link.label} to={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/85 hover:bg-primary-foreground/10" : "text-foreground hover:bg-muted"} ${location.pathname === link.href ? "text-primary" : ""}`}>
                  {link.label}
                </Link>
              )
            )}
            <Link to="/auth" className="ml-2">
              <Button variant="default" size="sm" className="rounded-full px-6 font-medium">Book Now</Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden p-2 rounded-lg ${showTransparent ? "text-primary-foreground" : "text-foreground"}`}>
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-background border-b border-border">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.href} onClick={() => setIsOpen(false)}
                  className="text-foreground font-medium py-2.5 px-3 rounded-lg hover:bg-muted hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setIsOpen(false)} className="mt-2">
                <Button className="w-full rounded-full">Book Now</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
