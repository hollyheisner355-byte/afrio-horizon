import { motion } from "framer-motion";
import { Shield, Globe, Heart, Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import gameDriveImg from "@/assets/game-drive.jpg";

const features = [
  { icon: Globe, title: "Global Reach", description: "Agents in Australia, Europe & the Americas paired with expert local guides." },
  { icon: Shield, title: "Trusted & Secure", description: "Transparent pricing, insured travel, and secure deposit arrangements." },
  { icon: Heart, title: "Tailored Experiences", description: "Every safari is bespoke — crafted around your preferences and pace." },
  { icon: Compass, title: "End-to-End Service", description: "Flights, lodges, game drives, beach extensions — we handle everything." },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden aspect-[4/5]">
              <img src={gameDriveImg} alt="Safari game drive experience" className="w-full h-full object-cover" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-8 bg-card border border-border rounded-xl p-5 shadow-card-hover max-w-[200px]">
              <p className="text-3xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground mt-1">Years crafting unforgettable African safaris</p>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">
              Why Choose Us
            </p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Africa's Premier{" "}
              <span className="text-gradient-gold italic">Touring Company</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Born from a deep love of Africa's wild landscapes, we connect international 
              travellers with authentic, luxury safari experiences. We are storytellers, 
              conservationists, and your personal gateway to the African dream.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="text-primary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-0.5">{f.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Get in Touch <ArrowRight size={16} />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
