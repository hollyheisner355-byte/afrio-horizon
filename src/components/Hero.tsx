import { motion } from "framer-motion";
import { ChevronDown, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import heroImg from "@/assets/hero-safari.jpg";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "5,000+", label: "Happy Travellers" },
  { value: "50+", label: "Safari Routes" },
  { value: "12", label: "Countries" },
];

const Hero = () => {
  const { settings } = useSiteSettings();

  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="African safari landscape with wildlife at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(25_35%_8%/0.5)] via-[hsl(25_35%_8%/0.4)] to-[hsl(25_35%_8%/0.85)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-5 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary-foreground text-sm font-medium tracking-wide">
                {settings.tagline || "Experience the Wild"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.08] mb-6"
            >
              Your Gateway to
              <br />
              Africa's Most{" "}
              <span className="text-gradient-gold italic">Extraordinary</span>
              <br />
              Wildlife
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-primary-foreground/75 text-base sm:text-lg max-w-xl mb-10 leading-relaxed"
            >
              Luxury safaris, curated tours & bespoke accommodations across East & Southern Africa — 
              serving travellers from Australia, Europe & the Americas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                onClick={scrollToPackages}
                size="lg"
                className="rounded-full px-8 sm:px-10 py-6 text-base font-medium shadow-safari"
              >
                Explore Packages
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full px-8 sm:px-10 py-6 text-base font-medium border-primary-foreground/30 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 hover:text-primary-foreground backdrop-blur-sm"
              >
                <Play size={16} className="mr-2" /> Our Story
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        className="relative z-10 border-t border-primary-foreground/10"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/10">
            {stats.map((stat) => (
              <div key={stat.label} className="py-6 md:py-8 px-4 md:px-8 text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-primary-foreground/50 text-xs sm:text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToPackages}
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="absolute bottom-32 md:bottom-28 left-1/2 -translate-x-1/2 text-primary-foreground/40 z-10"
      >
        <ChevronDown size={28} />
      </motion.button>
    </section>
  );
};

export default Hero;
