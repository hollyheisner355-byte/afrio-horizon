import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Packages", href: "/packages" },
  { label: "Stays", href: "/accommodations" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith("/#")) {
      if (!isHome) return; // Link component handles navigation
      const id = href.replace("/#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showTransparent = isHome && !scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${showTransparent ? "bg-transparent" : "bg-background/95 backdrop-blur-md shadow-safari border-b border-border"}`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <span className={`font-display text-2xl font-bold tracking-tight ${showTransparent ? "text-primary-foreground" : "text-foreground"}`}>
              Safari<span className="text-primary">Horizons</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("/#") ? (
                isHome ? (
                  <button key={link.label} onClick={() => handleNavClick(link.href)}
                    className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/90" : "text-foreground"}`}>
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.label} to={link.href}
                    className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/90" : "text-foreground"}`}>
                    {link.label}
                  </Link>
                )
              ) : (
                <Link key={link.label} to={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-primary ${showTransparent ? "text-primary-foreground/90" : "text-foreground"}`}>
                  {link.label}
                </Link>
              )
            )}
            <Link to="/auth">
              <Button variant="default" size="sm" className="rounded-full px-6 font-medium">Book Now</Button>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className={`lg:hidden ${showTransparent ? "text-primary-foreground" : "text-foreground"}`}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-background border-b border-border">
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.label} to={link.href} onClick={() => setIsOpen(false)}
                  className="text-foreground font-medium text-left py-2 hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-full mt-2">Book Now</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
