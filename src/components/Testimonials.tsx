import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    location: "Sydney, Australia",
    text: "SafariHorizons made our dream African safari a reality. The attention to detail was extraordinary — from the luxury lodges to the expert guides. We saw the Big Five on our first game drive!",
    rating: 5,
    avatar: "SM",
  },
  {
    name: "James & Emma Porter",
    location: "London, UK",
    text: "We've travelled extensively, but nothing compares to the experience SafariHorizons curated for us. The Serengeti at sunrise is something we'll never forget. Truly life-changing.",
    rating: 5,
    avatar: "JP",
  },
  {
    name: "Michael & Lisa Chen",
    location: "San Francisco, USA",
    text: "From the moment we enquired to the day we returned home, everything was seamless. Our local agent in the US was incredibly helpful, and the on-ground team in Kenya was exceptional.",
    rating: 5,
    avatar: "MC",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
            What They Say
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Traveller Stories
          </h2>
          <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto">
            Hear from adventurers who experienced the magic of Africa with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-secondary-foreground/5 backdrop-blur-sm border border-secondary-foreground/10 rounded-2xl p-8 relative"
            >
              <Quote className="text-primary/30 mb-4" size={40} />
              <p className="text-secondary-foreground/90 leading-relaxed mb-6 text-sm">
                "{t.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-secondary-foreground">{t.name}</p>
                  <p className="text-secondary-foreground/60 text-sm">{t.location}</p>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="text-primary fill-primary" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
