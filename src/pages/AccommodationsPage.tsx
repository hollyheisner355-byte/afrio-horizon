import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, MapPin, Bed, Wifi, DollarSign } from "lucide-react";

const AccommodationsPage = () => {
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("accommodations")
        .select("*, countries(name)")
        .eq("is_active", true)
        .order("price_per_night", { ascending: true });
      setAccommodations(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const priceRanges = [
    { label: "All", value: "all" },
    { label: "Under $40", value: "40" },
    { label: "$40–$70", value: "70" },
    { label: "$70+", value: "100" },
  ];

  const filtered = accommodations.filter(a => {
    if (filter === "all") return true;
    const price = Number(a.price_per_night) || 0;
    if (filter === "40") return price < 40;
    if (filter === "70") return price >= 40 && price <= 70;
    return price > 70;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Header */}
        <section className="bg-gradient-safari py-16">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">Where You'll Stay</p>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Affordable Accommodations</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From bush camps under the stars to beachside cottages — comfortable stays across Kenya that won't break the bank
              </p>
            </motion.div>

            {/* Price filters */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {priceRanges.map(r => (
                <button
                  key={r.value}
                  onClick={() => setFilter(r.value)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${filter === r.value ? "bg-primary text-primary-foreground shadow-lg" : "bg-card border border-border text-muted-foreground hover:border-primary/30"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No accommodations found in this range</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-card-hover transition-all duration-500 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    {acc.image_url ? (
                      <img src={acc.image_url} alt={acc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center"><Bed className="text-muted-foreground" size={40} /></div>
                    )}
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <DollarSign size={14} className="text-primary" />
                      <span className="text-sm font-bold text-foreground">{Number(acc.price_per_night).toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">/night</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">{acc.name}</h3>
                      {acc.rating && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="text-primary fill-primary" size={14} />
                          <span className="text-sm font-medium text-foreground">{Number(acc.rating).toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    {acc.countries?.name && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3"><MapPin size={13} /> {acc.countries.name}</p>
                    )}
                    {acc.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{acc.description}</p>
                    )}
                    {acc.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {acc.amenities.slice(0, 4).map((a: string) => (
                          <span key={a} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{a}</span>
                        ))}
                        {acc.amenities.length > 4 && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">+{acc.amenities.length - 4}</span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default AccommodationsPage;
