import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
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
    <section id="contact" className="py-24 bg-gradient-safari">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">Get In Touch</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Talk to Our Local Agents</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Our regional agents are ready to help you plan your perfect African adventure</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayAgents.map((agent, i) => (
            <motion.div key={agent.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-card-hover transition-all duration-500">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MapPin className="text-primary" size={28} />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-1">{agent.region}</h3>
              <p className="text-primary font-medium mb-4">{agent.name}</p>
              {agent.city && <p className="text-muted-foreground text-sm mb-1 flex items-center justify-center gap-2"><MapPin size={14} /> {agent.city}{agent.country ? `, ${agent.country}` : ""}</p>}
              {agent.phone && <p className="text-muted-foreground text-sm mb-1 flex items-center justify-center gap-2"><Phone size={14} /> {agent.phone}</p>}
              {agent.email && <p className="text-muted-foreground text-sm mb-6 flex items-center justify-center gap-2"><Mail size={14} /> {agent.email}</p>}
              <Button variant="outline" className="rounded-full w-full" onClick={() => agent.email && window.open(`mailto:${agent.email}`)}>Contact Agent</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactAgents;
