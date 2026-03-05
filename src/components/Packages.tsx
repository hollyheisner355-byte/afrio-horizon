import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import safariLodge from "@/assets/safari-lodge.jpg";
import gameDrive from "@/assets/game-drive.jpg";
import zanzibar from "@/assets/zanzibar.jpg";

const fallbackPackages = [
  { id: "1", title: "Classic Serengeti Safari", countries: { name: "Tanzania" }, duration_days: 7, group_size: "2-8", price: 3200, rating: 4.9, image_url: "", highlights: ["Big Five Game Drives", "Luxury Tented Camp", "Hot Air Balloon"], is_featured: true },
  { id: "2", title: "Kenya Explorer", countries: { name: "Kenya" }, duration_days: 10, group_size: "2-6", price: 4500, rating: 4.8, image_url: "", highlights: ["Masai Mara", "Lake Nakuru", "Amboseli"], is_featured: false },
  { id: "3", title: "Beach & Bush Combo", countries: { name: "Tanzania & Zanzibar" }, duration_days: 12, group_size: "2-10", price: 5800, rating: 5.0, image_url: "", highlights: ["Serengeti Safari", "Zanzibar Beach", "Stone Town Tour"], is_featured: false },
];

const fallbackImages = [gameDrive, safariLodge, zanzibar];

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase.from("packages").select("*, countries(name)").eq("is_active", true).eq("is_featured", true).limit(3);
      setPackages(data && data.length > 0 ? data : fallbackPackages);
    };
    fetchPackages();
  }, []);

  return (
    <section id="packages" className="py-20 md:py-28 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs mb-3">Curated Experiences</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">Featured Packages</h2>
          </motion.div>
          <Link to="/packages">
            <Button variant="outline" className="rounded-full gap-2 shrink-0">
              View All <ArrowRight size={16} />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card-hover transition-all duration-500 group flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img src={pkg.image_url || fallbackImages[i % 3]} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {pkg.is_featured && (
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Popular
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Star size={12} className="text-primary fill-primary" />{Number(pkg.rating).toFixed(1)}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-primary text-xs font-semibold mb-1 tracking-wide">{pkg.countries?.name || "Africa"}</p>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{pkg.title}</h3>
                <div className="flex items-center gap-3 text-muted-foreground text-xs mb-3">
                  <span className="flex items-center gap-1"><Clock size={13} /> {pkg.duration_days} Days</span>
                  <span className="flex items-center gap-1"><Users size={13} /> {pkg.group_size}</span>
                </div>
                {pkg.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pkg.highlights.slice(0, 3).map((h: string) => (
                      <span key={h} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{h}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div>
                    <span className="text-xl font-bold text-foreground">${Number(pkg.price).toLocaleString()}</span>
                    <span className="text-muted-foreground text-xs"> /person</span>
                  </div>
                  <Link to={`/packages/${pkg.id}`}>
                    <Button variant="default" size="sm" className="rounded-full gap-1.5 text-xs">
                      View <ArrowRight size={13} />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Packages;
