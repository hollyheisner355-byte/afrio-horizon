import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const ContactAgents = () => {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data } = await supabase.from("agents").select("*").eq("is_active", true).order("region");
      setAgents(data || []);
    };
    fetchAgents();
  }, []);

  const fallbackAgents = [
    { id: "1", region: "Australia & New Zealand", name: "Sophie Williams", phone: "+61 2 9876 5432", email: "australia@safarihorizons.com", city: "Sydney", country: "Australia" },
    { id: "2", region: "United Kingdom & Europe", name: "Oliver Chambers", phone: "+44 20 7946 0958", email: "europe@safarihorizons.com", city: "London", country: "UK" },
    { id: "3", region: "United States & Canada", name: "Rachel Adams", phone: "+1 (212) 555-0189", email: "americas@safarihorizons.com", city: "New York", country: "USA" },
  ];

  const displayAgents = agents.length > 0 ? agents : fallbackAgents;

  return (
    <section id="contact" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Left intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">Get In Touch</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Talk to Our{" "}
              <span className="text-gradient-gold">Regional Agents</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-6">
              Our agents are based in your region and understand your travel needs. They'll guide you through every step — from itinerary planning to deposit arrangements.
            </p>
            <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
              <Globe className="text-primary shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-foreground">Available worldwide</p>
                <p className="text-xs text-muted-foreground">Agents across 3 continents for local support</p>
              </div>
            </div>
          </motion.div>

          {/* Agent cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-5">
            {displayAgents.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-card-hover hover:border-primary/20 transition-all duration-400"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{agent.name}</h3>
                    <p className="text-primary text-xs font-semibold tracking-wide">{agent.region}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="text-primary" size={18} />
                  </div>
                </div>

                {agent.city && (
                  <p className="text-muted-foreground text-xs flex items-center gap-1.5 mb-3">
                    <MapPin size={12} /> {agent.city}{agent.country ? `, ${agent.country}` : ""}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
                  {agent.email && (
                    <a href={`mailto:${agent.email}?subject=${encodeURIComponent("Safari Booking Inquiry")}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1.5 transition-colors font-medium">
                      <Mail size={12} /> Email
                    </a>
                  )}
                  {agent.phone && (
                    <a href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full px-3 py-1.5 transition-colors font-medium">
                      <MessageCircle size={12} /> WhatsApp
                    </a>
                  )}
                  {agent.phone && (
                    <a href={`tel:${agent.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-full px-3 py-1.5 transition-colors font-medium">
                      <Phone size={12} /> Call
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactAgents;
