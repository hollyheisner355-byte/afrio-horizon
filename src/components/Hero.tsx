import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-safari.jpg";

const Hero = () => {
  const scrollToPackages = () => {
    document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="African safari sunset with elephants"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-overlay-dark" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-6"
        >
          Experience the Wild
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-[1.1] mb-6"
        >
          Discover Africa's
          <br />
          <span className="text-gradient-gold italic">Untamed Beauty</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
        >
          Luxury safaris, curated tours & bespoke accommodations across East & Southern Africa. 
          Serving travellers from Australia, Europe & the Americas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            onClick={scrollToPackages}
            size="lg"
            className="rounded-full px-10 py-6 text-base font-medium shadow-safari"
          >
            Explore Packages
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
            className="rounded-full px-10 py-6 text-base font-medium border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            Our Story
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToPackages}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60"
      >
        <ChevronDown size={32} />
      </motion.button>
    </section>
  );
};

export default Hero;
