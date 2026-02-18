import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User, Calendar, MapPin, Package } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      setProfile(profileData);

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      
      const hasAdmin = roles?.some((r: any) => r.role === "admin");
      setIsAdmin(!!hasAdmin);
      
      if (hasAdmin) {
        navigate("/admin");
        return;
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") navigate("/auth");
      if (event === "SIGNED_IN" && session) checkAuth();
    });

    checkAuth();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-foreground">
            Safari<span className="text-primary">Horizons</span>
          </h1>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Traveller</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 rounded-full">
            <LogOut size={14} /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Welcome, {profile?.full_name || "Traveller"} 👋
        </h2>
        <p className="text-muted-foreground mb-10">Manage your bookings and explore new adventures</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: Package, label: "My Bookings", value: "0", color: "text-primary" },
            { icon: Calendar, label: "Upcoming Trips", value: "0", color: "text-safari-green" },
            { icon: MapPin, label: "Countries Visited", value: "0", color: "text-accent" },
            { icon: User, label: "Profile Complete", value: "60%", color: "text-muted-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-6">
              <stat.icon className={`${stat.color} mb-3`} size={24} />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Ready for your next adventure?</h3>
          <p className="text-muted-foreground mb-6">Browse our curated safari packages and book your dream trip</p>
          <Button onClick={() => navigate("/")} className="rounded-full px-8">
            Explore Packages
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
