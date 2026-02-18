import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Users, Package, MapPin, Home, MessageSquare, Globe, Settings, BookOpen, Star, UserPlus, BarChart3, Menu, X } from "lucide-react";
import { toast } from "sonner";

type Tab = "overview" | "packages" | "countries" | "agents" | "users" | "bookings" | "blogs" | "testimonials" | "settings";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [packages, setPackages] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdmin = roles?.some((r: any) => r.role === "admin");
      if (!hasAdmin) { navigate("/dashboard"); return; }
      setIsAdmin(true);
      setLoading(false);
      fetchAllData();
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/auth");
    });

    checkAdmin();
    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAllData = async () => {
    const [pkgRes, countryRes, agentRes, bookingRes, blogRes, testRes, profileRes, settingsRes] = await Promise.all([
      supabase.from("packages").select("*").order("created_at", { ascending: false }),
      supabase.from("countries").select("*").order("name"),
      supabase.from("agents").select("*").order("region"),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("blogs").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).single(),
    ]);
    setPackages(pkgRes.data || []);
    setCountries(countryRes.data || []);
    setAgents(agentRes.data || []);
    setBookings(bookingRes.data || []);
    setBlogs(blogRes.data || []);
    setTestimonials(testRes.data || []);
    setProfiles(profileRes.data || []);
    setSiteSettings(settingsRes.data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "packages", label: "Packages", icon: Package },
    { key: "countries", label: "Countries", icon: Globe },
    { key: "agents", label: "Agents", icon: UserPlus },
    { key: "users", label: "Users", icon: Users },
    { key: "bookings", label: "Bookings", icon: BookOpen },
    { key: "blogs", label: "Blogs", icon: MessageSquare },
    { key: "testimonials", label: "Testimonials", icon: Star },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold">
            Safari<span className="text-sidebar-primary">Horizons</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground">
              <Menu size={20} />
            </button>
            <h2 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h2>
          </div>
          <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-medium">Admin</span>
        </header>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Packages", value: packages.length, icon: Package, color: "text-primary" },
                { label: "Total Bookings", value: bookings.length, icon: BookOpen, color: "text-safari-green" },
                { label: "Countries", value: countries.length, icon: Globe, color: "text-accent" },
                { label: "Users", value: profiles.length, icon: Users, color: "text-muted-foreground" },
                { label: "Agents", value: agents.length, icon: UserPlus, color: "text-primary" },
                { label: "Blogs", value: blogs.length, icon: MessageSquare, color: "text-safari-green" },
                { label: "Testimonials", value: testimonials.length, icon: Star, color: "text-accent" },
                { label: "Revenue", value: `$${bookings.reduce((a: number, b: any) => a + (Number(b.total_price) || 0), 0).toLocaleString()}`, icon: BarChart3, color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-6">
                  <s.icon className={`${s.color} mb-3`} size={24} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "packages" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{packages.length} packages</p>
                <Button className="rounded-full gap-2" onClick={() => toast.info("Package creation form coming soon!")}>
                  <Package size={16} /> Add Package
                </Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Duration</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Featured</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{pkg.title}</td>
                          <td className="p-4 text-muted-foreground">${Number(pkg.price).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">{pkg.duration_days} days</td>
                          <td className="p-4">{pkg.is_featured ? <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">Featured</span> : "—"}</td>
                          <td className="p-4">{pkg.is_active ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}</td>
                        </tr>
                      ))}
                      {packages.length === 0 && (
                        <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No packages yet. Add your first package!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "countries" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground">{countries.length} countries configured</p>
              {countries.length === 0 && <p className="text-muted-foreground mt-4">No countries added yet.</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {countries.map((c) => (
                  <div key={c.id} className="border border-border rounded-lg p-4">
                    <h4 className="font-bold text-foreground">{c.name}</h4>
                    <p className="text-sm text-muted-foreground">{c.region || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "agents" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">{agents.length} agents</p>
              {agents.length === 0 && <p className="text-muted-foreground">No agents added yet.</p>}
              {agents.map((a) => (
                <div key={a.id} className="border border-border rounded-lg p-4 mb-3">
                  <h4 className="font-bold text-foreground">{a.name}</h4>
                  <p className="text-sm text-muted-foreground">{a.region} — {a.email}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Country</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{p.full_name || "—"}</td>
                      <td className="p-4 text-muted-foreground">{p.country || "—"}</td>
                      <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {profiles.length === 0 && (
                    <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Travel Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-border">
                      <td className="p-4 font-mono text-xs text-foreground">{b.id.slice(0, 8)}</td>
                      <td className="p-4"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium capitalize">{b.status}</span></td>
                      <td className="p-4 text-muted-foreground">{b.travel_date || "—"}</td>
                      <td className="p-4 text-foreground font-medium">${Number(b.total_price || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No bookings yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">{blogs.length} blog posts</p>
              {blogs.length === 0 && <p className="text-muted-foreground">No blogs yet. Start writing!</p>}
            </div>
          )}

          {activeTab === "testimonials" && (
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">{testimonials.length} testimonials</p>
              {testimonials.length === 0 && <p className="text-muted-foreground">No testimonials yet.</p>}
            </div>
          )}

          {activeTab === "settings" && siteSettings && (
            <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Site Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Site Name</label>
                  <Input value={siteSettings.site_name} className="mt-1" readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Tagline</label>
                  <Input value={siteSettings.tagline || ""} className="mt-1" readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Contact Email</label>
                  <Input value={siteSettings.contact_email || ""} className="mt-1" readOnly />
                </div>
                <p className="text-xs text-muted-foreground">Full CRUD editing coming in next iteration</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
