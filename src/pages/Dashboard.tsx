import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, User, Calendar, MapPin, Package, Phone, Mail, DollarSign, UserCheck, Share2, Copy, TrendingUp, Link as LinkIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { generateReferralCode } from "@/lib/affiliate";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"bookings" | "affiliate">("bookings");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const [profileRes, rolesRes, bookingsRes, affRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", session.user.id).single(),
        supabase.from("user_roles").select("role").eq("user_id", session.user.id),
        supabase.from("bookings").select("*, packages(title, price, duration_days, image_url, countries(name)), agents(name, email, phone, region, city, country)").eq("user_id", session.user.id).order("created_at", { ascending: false }),
        supabase.from("affiliates").select("*").eq("user_id", session.user.id).maybeSingle(),
      ]);
      
      setProfile(profileRes.data);
      setBookings(bookingsRes.data || []);

      if (affRes.data) {
        setAffiliate(affRes.data);
        const { data: refs } = await supabase
          .from("affiliate_referrals")
          .select("*")
          .eq("affiliate_id", affRes.data.id)
          .order("created_at", { ascending: false });
        setReferrals(refs || []);
      }

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

  const handleJoinAffiliate = async () => {
    if (!user) return;
    const code = generateReferralCode();
    const { data, error } = await supabase
      .from("affiliates")
      .insert({ user_id: user.id, referral_code: code })
      .select()
      .single();
    if (error) { toast.error(error.message); return; }
    setAffiliate(data);
    toast.success("Welcome to the affiliate program!");
  };

  const referralLink = affiliate
    ? `${window.location.origin}?ref=${affiliate.referral_code}`
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const totalSpent = bookings.reduce((a, b) => a + (Number(b.total_price) || 0), 0);
  const upcomingTrips = bookings.filter(b => b.status === "confirmed" || b.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-bold text-foreground">Safari<span className="text-primary">Horizons</span></h1>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Traveller</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-sm">Home</Button>
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 rounded-full"><LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span></Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 sm:py-10">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Welcome, {profile?.full_name || "Traveller"} 👋</h2>
        <p className="text-muted-foreground mb-8">Manage your bookings and explore new adventures</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "bookings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Package size={16} className="inline mr-2" />My Bookings
          </button>
          <button
            onClick={() => setActiveTab("affiliate")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === "affiliate" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            <Share2 size={16} className="inline mr-2" />Partner Program
          </button>
        </div>

        {activeTab === "bookings" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
              {[
                { icon: Package, label: "My Bookings", value: bookings.length, color: "text-primary" },
                { icon: Calendar, label: "Upcoming Trips", value: upcomingTrips, color: "text-safari-green" },
                { icon: DollarSign, label: "Total Value", value: `$${totalSpent.toLocaleString()}`, color: "text-accent" },
                { icon: User, label: "Profile", value: profile?.full_name ? "Complete" : "Incomplete", color: "text-muted-foreground" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4 sm:p-6">
                  <stat.icon className={`${stat.color} mb-2 sm:mb-3`} size={20} />
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
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
                          {b.packages?.image_url && (
                            <div className="w-full md:w-48 h-32 md:h-auto shrink-0">
                              <img src={b.packages.image_url} alt={b.packages?.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 p-4 sm:p-5">
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
                              <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">${Number(b.total_price || 0).toLocaleString()}</span></p>
                                <div className="flex items-center gap-2">
                                  <DollarSign size={14} className="text-primary" />
                                  <span className="text-sm">
                                    50% Deposit: <span className={`font-bold ${depositPaid >= deposit ? "text-safari-green" : "text-primary"}`}>${deposit.toLocaleString()}</span>
                                    {depositPaid > 0 && <span className="text-safari-green ml-1">(${depositPaid.toLocaleString()} paid)</span>}
                                  </span>
                                </div>
                                {b.travel_date && <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar size={14} /> {new Date(b.travel_date).toLocaleDateString()}</p>}
                              </div>
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
          </>
        )}

        {activeTab === "affiliate" && (
          <>
            {!affiliate ? (
              <div className="bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto text-center">
                <Share2 className="text-primary mx-auto mb-4" size={48} />
                <h2 className="font-display text-2xl font-bold text-foreground mb-3">Become a Partner</h2>
                <p className="text-muted-foreground mb-6">
                  Share your unique referral link and earn <strong className="text-primary">commission</strong> on every booking made through your link.
                  Commissions are tracked for 30 days after a visitor clicks your link.
                </p>
                <Button onClick={handleJoinAffiliate} className="rounded-full px-10 py-5 text-base">
                  Join Affiliate Program
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { icon: Users, label: "Total Referrals", value: affiliate.total_referrals, color: "text-primary" },
                    { icon: DollarSign, label: "Total Earnings", value: `$${Number(affiliate.total_earnings).toLocaleString()}`, color: "text-secondary" },
                    { icon: TrendingUp, label: "Commission Rate", value: `${Number(affiliate.commission_rate)}%`, color: "text-accent" },
                    { icon: LinkIcon, label: "Status", value: affiliate.is_active ? "Active" : "Inactive", color: "text-muted-foreground" },
                  ].map(s => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4 sm:p-6">
                      <s.icon className={`${s.color} mb-2 sm:mb-3`} size={20} />
                      <p className="text-lg sm:text-2xl font-bold text-foreground">{s.value}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Referral link */}
                <div className="bg-card border border-border rounded-2xl p-4 sm:p-6">
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">Your Referral Link</h3>
                  <p className="text-xs text-muted-foreground mb-3">Share this link — anyone who signs up and books within 30 days earns you commission</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input value={referralLink} readOnly className="flex-1 font-mono text-xs sm:text-sm" />
                    <Button onClick={copyLink} className="rounded-full gap-2 shrink-0"><Copy size={16} /> Copy Link</Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">Your code: <strong className="text-primary">{affiliate.referral_code}</strong></p>
                </div>

                {/* Referral history */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-border">
                    <h3 className="font-display text-lg font-bold text-foreground">Referral History</h3>
                  </div>
                  {referrals.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Commission</th>
                            <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referrals.map(r => (
                            <tr key={r.id} className="border-t border-border">
                              <td className="p-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                              <td className="p-4 font-medium text-foreground">${Number(r.commission_amount).toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${r.status === "paid" ? "bg-secondary/10 text-secondary" : r.status === "confirmed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No referrals yet — share your link to get started!
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
