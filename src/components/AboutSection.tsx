import { motion } from "framer-motion";
import { Shield, Globe, Heart, Compass } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Global Reach, Local Expertise",
    description: "Agents in Australia, Europe & the Americas paired with expert local guides across Africa.",
  },
  {
    icon: Shield,
    title: "Trusted & Secure",
    description: "Secure P2P deposits, transparent pricing, and fully insured travel arrangements.",
  },
  {
    icon: Heart,
    title: "Tailored Experiences",
    description: "Every safari is bespoke — crafted around your preferences, pace, and passion.",
  },
  {
    icon: Compass,
    title: "End-to-End Service",
    description: "From flights to lodges, game drives to beach extensions — we handle everything.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
              Why Safari Horizons
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Africa's Premier <br />
              <span className="text-gradient-gold italic">Touring Company</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Born from a deep love of Africa's wild landscapes, SafariHorizons connects international 
              travellers with authentic, luxury safari experiences. We are not just a travel company — 
              we are storytellers, conservationists, and your personal gateway to the African dream.
            </p>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">15+</p>
                <p>Years Experience</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">5,000+</p>
                <p>Happy Travellers</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">50+</p>
                <p>Safari Routes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">12</p>
                <p>Countries</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-safari transition-shadow duration-300"
              >
                <f.icon className="text-primary mb-4" size={28} />
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
