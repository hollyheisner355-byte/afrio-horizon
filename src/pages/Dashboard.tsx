import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, MapPin, Package, Phone, Mail, DollarSign, UserCheck } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const [profileRes, rolesRes, bookingsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
        supabase.from("bookings").select("*, packages(title, price, duration_days, image_url, countries(name)), agents(name, email, phone, region, city, country)").eq("user_id", session.user.id).order("created_at", { ascending: false }),
      ]);
      
      setProfile(profileRes.data);
      setBookings(bookingsRes.data || []);

      const hasAdmin = rolesRes.data?.some((r: any) => r.role === "admin");
      setIsAdmin(!!hasAdmin);
      if (hasAdmin) { navigate("/admin"); return; }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/auth");
      if (event === "SIGNED_IN") checkAuth();
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalSpent = bookings.reduce((a, b) => a + (Number(b.total_price) || 0), 0);
  const upcomingTrips = bookings.filter(b => b.status === "confirmed" || b.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-foreground">Safari<span className="text-primary">Horizons</span></h1>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Traveller</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-sm">Home</Button>
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 rounded-full"><LogOut size={14} /> Sign Out</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Welcome, {profile?.full_name || "Traveller"} 👋</h2>
        <p className="text-muted-foreground mb-10">Manage your bookings and explore new adventures</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Package, label: "My Bookings", value: bookings.length, color: "text-primary" },
            { icon: Calendar, label: "Upcoming Trips", value: upcomingTrips, color: "text-safari-green" },
            { icon: DollarSign, label: "Total Value", value: `$${totalSpent.toLocaleString()}`, color: "text-accent" },
            { icon: User, label: "Profile", value: profile?.full_name ? "Complete" : "Incomplete", color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
              <stat.icon className={`${stat.color} mb-3`} size={24} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            <h3 className="font-display text-2xl font-bold text-foreground">Your Bookings</h3>
            <div className="space-y-4">
              {bookings.map((b) => {
                const deposit = Math.ceil((Number(b.total_price) || 0) * 0.5);
                const depositPaid = Number(b.deposit_paid) || 0;
                return (
                  <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {/* Package image */}
                      {b.packages?.image_url && (
                        <div className="w-full md:w-48 h-32 md:h-auto shrink-0">
                          <img src={b.packages.image_url} alt={b.packages?.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-display text-lg font-bold text-foreground">{b.packages?.title || "Safari Package"}</h4>
                            <p className="text-sm text-muted-foreground">{b.packages?.countries?.name || "Africa"} • {b.packages?.duration_days} days • {b.guests} guest{b.guests > 1 ? "s" : ""}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${b.status === "confirmed" ? "bg-safari-green/10 text-safari-green" : b.status === "cancelled" ? "bg-destructive/10 text-destructive" : b.status === "completed" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                            {b.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Price & Deposit */}
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">${Number(b.total_price || 0).toLocaleString()}</span></p>
                            <div className="flex items-center gap-2">
                              <DollarSign size={14} className="text-primary" />
                              <span className="text-sm">
                                50% Deposit: <span className={`font-bold ${depositPaid >= deposit ? "text-safari-green" : "text-primary"}`}>
                                  ${deposit.toLocaleString()}
                                </span>
                                {depositPaid > 0 && <span className="text-safari-green ml-1">(${depositPaid.toLocaleString()} paid)</span>}
                              </span>
                            </div>
                            {b.travel_date && <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar size={14} /> {new Date(b.travel_date).toLocaleDateString()}</p>}
                          </div>

                          {/* Assigned Agent */}
                          {b.agents && (
                            <div className="bg-accent/10 rounded-lg p-3">
                              <p className="text-xs font-medium text-foreground flex items-center gap-1 mb-1"><UserCheck size={13} className="text-primary" /> Your Agent</p>
                              <p className="text-sm font-bold text-foreground">{b.agents.name}</p>
                              <p className="text-xs text-muted-foreground">{b.agents.region}</p>
                              {b.agents.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone size={10} /> {b.agents.phone}</p>}
                              {b.agents.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={10} /> {b.agents.email}</p>}
                            </div>
                          )}
                        </div>

                        {b.notes && <p className="text-xs text-muted-foreground mt-3 italic">Notes: {b.notes}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Ready for your next adventure?</h3>
            <p className="text-muted-foreground mb-6">Browse our curated safari packages and book your dream trip</p>
            <Button onClick={() => navigate("/packages")} className="rounded-full px-8">Explore Packages</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
