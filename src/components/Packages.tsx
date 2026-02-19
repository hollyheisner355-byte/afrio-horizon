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
    <section id="packages" className="py-24 bg-gradient-safari">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">Curated Experiences</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Featured Packages</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Handcrafted itineraries designed for unforgettable African adventures</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, i) => (
            <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card-hover transition-all duration-500 group">
              <div className="relative h-64 overflow-hidden">
                <img src={pkg.image_url || fallbackImages[i % 3]} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {pkg.is_featured && <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star size={14} className="text-primary fill-primary" />{Number(pkg.rating).toFixed(1)}
                </div>
              </div>
              <div className="p-6">
                <p className="text-primary text-sm font-medium mb-1">{pkg.countries?.name || "Africa"}</p>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">{pkg.title}</h3>
                <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                  <span className="flex items-center gap-1"><Clock size={14} /> {pkg.duration_days} Days</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {pkg.group_size}</span>
                </div>
                {pkg.highlights?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {pkg.highlights.slice(0, 3).map((h: string) => <span key={h} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{h}</span>)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <span className="text-2xl font-bold text-foreground">${Number(pkg.price).toLocaleString()}</span>
                    <span className="text-muted-foreground text-sm"> /person</span>
                  </div>
                  <Link to={`/packages/${pkg.id}`}>
                    <Button variant="default" size="sm" className="rounded-full gap-2">View Details <ArrowRight size={14} /></Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/packages">
            <Button variant="outline" size="lg" className="rounded-full px-10 gap-2">View All Packages <ArrowRight size={16} /></Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Packages;
