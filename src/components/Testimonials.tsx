import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const fallbackTestimonials = [
  { name: "Sarah Mitchell", location: "Sydney, Australia", text: "SafariHorizons made our dream African safari a reality. The attention to detail was extraordinary — from the luxury lodges to the expert guides.", rating: 5, avatar: "SM" },
  { name: "James & Emma Porter", location: "London, UK", text: "We've travelled extensively, but nothing compares to the experience SafariHorizons curated for us. The Serengeti at sunrise is something we'll never forget.", rating: 5, avatar: "JP" },
  { name: "Michael & Lisa Chen", location: "San Francisco, USA", text: "From the moment we enquired to the day we returned home, everything was seamless. Our local agent in the US was incredibly helpful.", rating: 5, avatar: "MC" },
];

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>(fallbackTestimonials);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("testimonials").select("*").eq("is_approved", true).order("created_at", { ascending: false }).limit(6);
      if (data && data.length > 0) setTestimonials(data.map(t => ({ ...t, avatar: t.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2) })));
    };
    fetch();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">
            What They Say
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-secondary-foreground mb-4">
            Traveller Stories
          </h2>
          <p className="text-secondary-foreground/60 text-base max-w-lg mx-auto">
            Hear from adventurers who experienced the magic of Africa with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((t, i) => (
            <motion.div
              key={t.name + i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-secondary-foreground/5 backdrop-blur-sm border border-secondary-foreground/10 rounded-2xl p-7 relative group hover:bg-secondary-foreground/8 transition-colors"
            >
              <Quote className="text-primary/20 mb-4" size={36} />
              <p className="text-secondary-foreground/85 leading-relaxed mb-6 text-sm">
                "{t.text}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground font-bold text-xs">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-foreground text-sm">{t.name}</p>
                    <p className="text-secondary-foreground/50 text-xs">{t.location}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating || 5 }).map((_, j) => (
                    <Star key={j} size={12} className="text-primary fill-primary" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
