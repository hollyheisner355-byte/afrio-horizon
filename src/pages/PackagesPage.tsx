import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Clock, Users, Star, Search, Filter, MapPin, ArrowRight } from "lucide-react";

const PackagesPage = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [pkgRes, countryRes] = await Promise.all([
        supabase.from("packages").select("*, countries(name)").eq("is_active", true).order("is_featured", { ascending: false }),
        supabase.from("countries").select("*").eq("is_active", true).order("name"),
      ]);
      setPackages(pkgRes.data || []);
      setCountries(countryRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  let filtered = packages.filter(p => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (countryFilter && p.country_id !== countryFilter) return false;
    if (durationFilter === "short" && p.duration_days > 5) return false;
    if (durationFilter === "medium" && (p.duration_days < 6 || p.duration_days > 10)) return false;
    if (durationFilter === "long" && p.duration_days < 11) return false;
    return true;
  });

  if (priceSort === "low") filtered.sort((a, b) => a.price - b.price);
  if (priceSort === "high") filtered.sort((a, b) => b.price - a.price);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero */}
      <div className="pt-20 pb-12 bg-secondary">
        <div className="container mx-auto px-4 pt-12 pb-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-secondary-foreground mb-3">
            Safari <span className="text-primary">Packages</span>
          </h1>
          <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto">
            Browse our curated collection of African safari experiences
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search packages..." className="pl-10" />
          </div>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All Countries</option>
            {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={durationFilter} onChange={e => setDurationFilter(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Any Duration</option>
            <option value="short">1-5 Days</option>
            <option value="medium">6-10 Days</option>
            <option value="long">11+ Days</option>
          </select>
          <select value={priceSort} onChange={e => setPriceSort(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">Sort by Price</option>
            <option value="low">Low to High</option>
            <option value="high">High to Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No packages match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-card-hover transition-all duration-500 group"
              >
                <div className="relative h-56 overflow-hidden">
                  {pkg.image_url ? (
                    <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center"><MapPin className="text-muted-foreground" size={40} /></div>
                  )}
                  {pkg.is_featured && (
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</div>
                  )}
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-primary fill-primary" /> {Number(pkg.rating).toFixed(1)}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-primary text-sm font-medium mb-1">{pkg.countries?.name || "Africa"}</p>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{pkg.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm mb-4">
                    <span className="flex items-center gap-1"><Clock size={14} /> {pkg.duration_days} days</span>
                    {pkg.group_size && <span className="flex items-center gap-1"><Users size={14} /> {pkg.group_size}</span>}
                  </div>
                  {pkg.highlights?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {pkg.highlights.slice(0, 3).map((h: string) => (
                        <span key={h} className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{h}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-foreground">${Number(pkg.price).toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm"> /person</span>
                    </div>
                    <Button onClick={() => navigate(`/packages/${pkg.id}`)} size="sm" className="rounded-full gap-2">
                      Book Now <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PackagesPage;
