import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Users, Package, MapPin, Home, MessageSquare, Globe, Settings, BookOpen, Star, UserPlus, BarChart3, Menu, X, Pencil, Trash2, Plus, Bed, Share2, DollarSign, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import AdminPackageForm from "@/components/admin/AdminPackageForm";
import AdminCountryForm from "@/components/admin/AdminCountryForm";
import AdminAgentForm from "@/components/admin/AdminAgentForm";
import AdminBlogForm from "@/components/admin/AdminBlogForm";
import AdminTestimonialForm from "@/components/admin/AdminTestimonialForm";
import AdminAccommodationForm from "@/components/admin/AdminAccommodationForm";
import AdminEmailDialog from "@/components/admin/AdminEmailDialog";

type Tab = "overview" | "packages" | "countries" | "accommodations" | "agents" | "users" | "bookings" | "blogs" | "testimonials" | "affiliates" | "settings";

const AdminDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [packages, setPackages] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [affiliateReferrals, setAffiliateReferrals] = useState<any[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  // Form modals
  const [editingPkg, setEditingPkg] = useState<any>(undefined);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<any>(undefined);
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(undefined);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(undefined);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<any>(undefined);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<any>(undefined);
  const [showAccommodationForm, setShowAccommodationForm] = useState(false);
  const [emailBooking, setEmailBooking] = useState<any>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
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
    const [pkgRes, countryRes, agentRes, bookingRes, blogRes, testRes, profileRes, settingsRes, accRes, affRes, affRefRes] = await Promise.all([
      supabase.from("packages").select("*, countries(name)").order("created_at", { ascending: false }),
      supabase.from("countries").select("*").order("name"),
      supabase.from("agents").select("*").order("region"),
      supabase.from("bookings").select("*, packages(title), agents(name, region)").order("created_at", { ascending: false }),
      supabase.from("blogs").select("*").order("created_at", { ascending: false }),
      supabase.from("testimonials").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      supabase.from("accommodations").select("*, countries(name)").order("created_at", { ascending: false }),
      supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false }),
    ]);
    setPackages(pkgRes.data || []);
    setCountries(countryRes.data || []);
    setAgents(agentRes.data || []);
    setBookings(bookingRes.data || []);
    setBlogs(blogRes.data || []);
    setTestimonials(testRes.data || []);
    setProfiles(profileRes.data || []);
    setSiteSettings(settingsRes.data);
    setSettingsForm(settingsRes.data ? { ...settingsRes.data } : null);
    setAccommodations(accRes.data || []);
    setAffiliates(affRes.data || []);
    setAffiliateReferrals(affRefRes.data || []);
  };

  const handleDelete = async (table: string, id: string, label: string) => {
    if (!confirm(`Delete this ${label}?`)) return;
    const { error } = await supabase.from(table as any).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${label} deleted`);
    fetchAllData();
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking ${status}`);
    
    // Auto-send email on status change
    const booking = bookings.find((b: any) => b.id === id);
    if (booking) {
      const notesMatch = booking.notes?.match(/Email:\s*([^\s|]+)/);
      const guestEmail = notesMatch?.[1];
      const nameMatch = booking.notes?.match(/Contact:\s*([^|]+)/);
      const guestName = nameMatch?.[1]?.trim() || "";
      
      if (guestEmail) {
        const templateMap: Record<string, string> = {
          confirmed: "booking_confirmation",
          cancelled: "booking_cancelled",
          completed: "booking_completed",
        };
        const templateType = templateMap[status];
        if (templateType) {
          const totalPrice = Number(booking.total_price || 0);
          const deposit = Math.ceil(totalPrice * 0.5);
          try {
            await supabase.functions.invoke("send-email", {
              body: {
                templateType,
                recipientEmail: guestEmail,
                recipientName: guestName,
                data: {
                  packageTitle: booking.packages?.title || "Safari",
                  travelDate: booking.travel_date || "TBD",
                  guests: booking.guests,
                  totalPrice: totalPrice.toLocaleString(),
                  deposit: deposit.toLocaleString(),
                  balance: (totalPrice - deposit).toLocaleString(),
                  agentName: booking.agents?.name || "",
                  agentRegion: booking.agents?.region || "",
                  bookingId: booking.id,
                  siteName: siteSettings?.site_name || "SafariHorizons",
                  contactEmail: siteSettings?.contact_email || "",
                },
              },
            });
            toast.success(`Auto-email sent to ${guestEmail}`);
          } catch (e) {
            console.error("Auto-email failed:", e);
          }
        }
      }
    }
    
    fetchAllData();
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    setSavingSettings(true);
    const { id, created_at, ...data } = settingsForm;
    let error;
    if (siteSettings?.id) {
      ({ error } = await supabase.from("site_settings").update(data).eq("id", siteSettings.id));
    } else {
      ({ error } = await supabase.from("site_settings").insert(data));
    }
    setSavingSettings(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Settings saved!");
    fetchAllData();
  };

  const handleSendTestEmail = async () => {
    if (!settingsForm) return;
    // Save first to ensure edge function reads the latest config from DB
    setSendingTest(true);
    try {
      const { id, created_at, ...data } = settingsForm;
      if (siteSettings?.id) {
        await supabase.from("site_settings").update(data).eq("id", siteSettings.id);
      } else {
        await supabase.from("site_settings").insert(data);
      }
      const testRecipient = settingsForm.contact_email || user?.email;
      if (!testRecipient) {
        toast.error("Set a contact email first");
        setSendingTest(false);
        return;
      }
      const { data: result, error } = await supabase.functions.invoke("send-email", {
        body: {
          templateType: "test",
          recipientEmail: testRecipient,
          recipientName: "Admin",
          data: { siteName: settingsForm.site_name },
        },
      });
      if (error) {
        toast.error("Test failed: " + error.message);
      } else if (result?.success) {
        toast.success(`Test sent to ${testRecipient} via ${result.method}`);
      } else {
        toast.error(result?.error || "Test email failed");
      }
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSendingTest(false);
  };
    await supabase.auth.signOut();
    navigate("/");
  };

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "packages", label: "Packages", icon: Package },
    { key: "countries", label: "Countries", icon: Globe },
    { key: "accommodations", label: "Accommodations", icon: Bed },
    { key: "agents", label: "Agents", icon: UserPlus },
    { key: "users", label: "Users", icon: Users },
    { key: "bookings", label: "Bookings", icon: BookOpen },
    { key: "blogs", label: "Blogs", icon: MessageSquare },
    { key: "testimonials", label: "Testimonials", icon: Star },
    { key: "affiliates", label: "Affiliates", icon: Share2 },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const closeForms = () => {
    setShowPkgForm(false); setEditingPkg(undefined);
    setShowCountryForm(false); setEditingCountry(undefined);
    setShowAgentForm(false); setEditingAgent(undefined);
    setShowBlogForm(false); setEditingBlog(undefined);
    setShowTestimonialForm(false); setEditingTestimonial(undefined);
    setShowAccommodationForm(false); setEditingAccommodation(undefined);
  };

  const onFormSaved = () => { closeForms(); fetchAllData(); };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const ActionBtn = ({ onClick, icon: Icon, variant = "ghost" }: any) => (
    <button onClick={onClick} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Icon size={16} /></button>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Modals */}
      {showPkgForm && <AdminPackageForm pkg={editingPkg} countries={countries} onClose={closeForms} onSaved={onFormSaved} />}
      {showCountryForm && <AdminCountryForm country={editingCountry} onClose={closeForms} onSaved={onFormSaved} />}
      {showAgentForm && <AdminAgentForm agent={editingAgent} onClose={closeForms} onSaved={onFormSaved} />}
      {showBlogForm && <AdminBlogForm blog={editingBlog} onClose={closeForms} onSaved={onFormSaved} />}
      {showTestimonialForm && <AdminTestimonialForm testimonial={editingTestimonial} onClose={closeForms} onSaved={onFormSaved} />}
      {showAccommodationForm && <AdminAccommodationForm accommodation={editingAccommodation} countries={countries} onClose={closeForms} onSaved={onFormSaved} />}
      {emailBooking && <AdminEmailDialog booking={emailBooking} siteSettings={siteSettings} onClose={() => setEmailBooking(null)} onSent={fetchAllData} />}
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link to="/" className="font-display text-xl font-bold">Safari<span className="text-sidebar-primary">Horizons</span></Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => { setActiveTab(key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"><LogOut size={16} /> Sign Out</Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-foreground"><Menu size={20} /></button>
            <h2 className="font-display text-xl font-bold text-foreground capitalize">{activeTab}</h2>
          </div>
          <span className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full font-medium">Admin</span>
        </header>

        <div className="p-6">
          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Packages", value: packages.length, icon: Package, color: "text-primary" },
                { label: "Bookings", value: bookings.length, icon: BookOpen, color: "text-safari-green" },
                { label: "Countries", value: countries.length, icon: Globe, color: "text-accent" },
                { label: "Users", value: profiles.length, icon: Users, color: "text-muted-foreground" },
                { label: "Agents", value: agents.length, icon: UserPlus, color: "text-primary" },
                { label: "Accommodations", value: accommodations.length, icon: Bed, color: "text-safari-green" },
                { label: "Blogs", value: blogs.length, icon: MessageSquare, color: "text-accent" },
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

          {/* PACKAGES */}
          {activeTab === "packages" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{packages.length} packages</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingPkg(undefined); setShowPkgForm(true); }}><Plus size={16} /> Add Package</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Country</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Days</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{pkg.title}{pkg.is_featured && <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Featured</span>}</td>
                          <td className="p-4 text-muted-foreground">{pkg.countries?.name || "—"}</td>
                          <td className="p-4 text-muted-foreground">${Number(pkg.price).toLocaleString()}</td>
                          <td className="p-4 text-muted-foreground">{pkg.duration_days}</td>
                          <td className="p-4">{pkg.is_active ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingPkg(pkg); setShowPkgForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("packages", pkg.id, "Package")} />
                          </div></td>
                        </tr>
                      ))}
                      {packages.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No packages yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COUNTRIES */}
          {activeTab === "countries" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{countries.length} countries</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingCountry(undefined); setShowCountryForm(true); }}><Plus size={16} /> Add Country</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Region</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {countries.map((c) => (
                        <tr key={c.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{c.name}</td>
                          <td className="p-4 text-muted-foreground">{c.region || "—"}</td>
                          <td className="p-4">{c.is_active ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingCountry(c); setShowCountryForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("countries", c.id, "Country")} />
                          </div></td>
                        </tr>
                      ))}
                      {countries.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No countries yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACCOMMODATIONS */}
          {activeTab === "accommodations" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{accommodations.length} accommodations</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingAccommodation(undefined); setShowAccommodationForm(true); }}><Plus size={16} /> Add Accommodation</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Country</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price/Night</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {accommodations.map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{a.name}</td>
                          <td className="p-4 text-muted-foreground">{a.countries?.name || "—"}</td>
                          <td className="p-4 text-muted-foreground">{a.price_per_night ? `$${Number(a.price_per_night).toLocaleString()}` : "—"}</td>
                          <td className="p-4 text-muted-foreground">{a.rating ? Number(a.rating).toFixed(1) : "—"}</td>
                          <td className="p-4">{a.is_active ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingAccommodation(a); setShowAccommodationForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("accommodations", a.id, "Accommodation")} />
                          </div></td>
                        </tr>
                      ))}
                      {accommodations.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No accommodations yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AGENTS */}
          {activeTab === "agents" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{agents.length} agents</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingAgent(undefined); setShowAgentForm(true); }}><Plus size={16} /> Add Agent</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Region</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Country / City</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {agents.map((a) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{a.name}</td>
                          <td className="p-4 text-muted-foreground">{a.region}</td>
                          <td className="p-4 text-muted-foreground">{a.country || "—"}{a.city ? `, ${a.city}` : ""}</td>
                          <td className="p-4 text-muted-foreground text-xs">{a.email}<br/>{a.phone}</td>
                          <td className="p-4">{a.is_active ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingAgent(a); setShowAgentForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("agents", a.id, "Agent")} />
                          </div></td>
                        </tr>
                      ))}
                      {agents.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No agents yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted"><tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Country</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                </tr></thead>
                <tbody>
                  {profiles.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="p-4 font-medium text-foreground">{p.full_name || "—"}</td>
                      <td className="p-4 text-muted-foreground">{p.country || "—"}</td>
                      <td className="p-4 text-muted-foreground">{p.phone || "—"}</td>
                      <td className="p-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {profiles.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users yet</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr>
                    <th className="text-left p-4 font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Package</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Agent</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Guests</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Travel Date</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Deposit (50%)</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                  </tr></thead>
                  <tbody>
                    {bookings.map((b) => {
                      const deposit50 = Math.ceil((Number(b.total_price) || 0) * 0.5);
                      const depositPaid = Number(b.deposit_paid) || 0;
                      return (
                      <tr key={b.id} className="border-t border-border">
                        <td className="p-4 font-mono text-xs text-foreground">{b.id.slice(0, 8)}</td>
                        <td className="p-4 text-muted-foreground">{b.packages?.title || "—"}</td>
                        <td className="p-4 text-muted-foreground">{b.agents?.name || "Unassigned"}<br/><span className="text-xs">{b.agents?.region || ""}</span></td>
                        <td className="p-4 text-muted-foreground">{b.guests}</td>
                        <td className="p-4 text-muted-foreground">{b.travel_date || "—"}</td>
                        <td className="p-4 text-foreground font-medium">${Number(b.total_price || 0).toLocaleString()}</td>
                        <td className="p-4"><span className={`font-medium ${depositPaid >= deposit50 ? "text-safari-green" : "text-primary"}`}>${deposit50.toLocaleString()}</span>{depositPaid > 0 && <span className="text-xs text-safari-green block">${depositPaid.toLocaleString()} paid</span>}</td>
                        <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${b.status === "confirmed" ? "bg-safari-green/10 text-safari-green" : b.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>{b.status}</span></td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            {b.status === "pending" && <>
                              <Button size="sm" variant="outline" className="text-xs h-7 rounded-full" onClick={() => updateBookingStatus(b.id, "confirmed")}>Confirm</Button>
                              <Button size="sm" variant="outline" className="text-xs h-7 rounded-full text-destructive" onClick={() => updateBookingStatus(b.id, "cancelled")}>Cancel</Button>
                            </>}
                            {b.status === "confirmed" && <Button size="sm" variant="outline" className="text-xs h-7 rounded-full" onClick={() => updateBookingStatus(b.id, "completed")}>Complete</Button>}
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full gap-1" onClick={() => setEmailBooking(b)}>
                              <Mail size={12} /> Email
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )})}
                    {bookings.length === 0 && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground">No bookings yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOGS */}
          {activeTab === "blogs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{blogs.length} blog posts</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingBlog(undefined); setShowBlogForm(true); }}><Plus size={16} /> New Blog Post</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Author</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {blogs.map((b) => (
                        <tr key={b.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{b.title}</td>
                          <td className="p-4 text-muted-foreground">{b.author || "—"}</td>
                          <td className="p-4">{b.is_published ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Published</span> : <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded-full">Draft</span>}</td>
                          <td className="p-4 text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingBlog(b); setShowBlogForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("blogs", b.id, "Blog")} />
                          </div></td>
                        </tr>
                      ))}
                      {blogs.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No blogs yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">{testimonials.length} testimonials</p>
                <Button className="rounded-full gap-2" onClick={() => { setEditingTestimonial(undefined); setShowTestimonialForm(true); }}><Plus size={16} /> Add Testimonial</Button>
              </div>
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {testimonials.map((t) => (
                        <tr key={t.id} className="border-t border-border">
                          <td className="p-4 font-medium text-foreground">{t.name}</td>
                          <td className="p-4 text-muted-foreground">{t.location || "—"}</td>
                          <td className="p-4 text-muted-foreground">{"★".repeat(t.rating)}</td>
                          <td className="p-4">{t.is_approved ? <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Approved</span> : <span className="text-muted-foreground text-xs bg-muted px-2 py-0.5 rounded-full">Pending</span>}</td>
                          <td className="p-4 text-right"><div className="flex justify-end gap-1">
                            <ActionBtn icon={Pencil} onClick={() => { setEditingTestimonial(t); setShowTestimonialForm(true); }} />
                            <ActionBtn icon={Trash2} onClick={() => handleDelete("testimonials", t.id, "Testimonial")} />
                          </div></td>
                        </tr>
                      ))}
                      {testimonials.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No testimonials yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AFFILIATES */}
          {activeTab === "affiliates" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <Share2 className="text-primary mb-3" size={24} />
                  <p className="text-2xl font-bold text-foreground">{affiliates.length}</p>
                  <p className="text-sm text-muted-foreground">Total Affiliates</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <DollarSign className="text-safari-green mb-3" size={24} />
                  <p className="text-2xl font-bold text-foreground">${affiliates.reduce((a: number, b: any) => a + Number(b.total_earnings || 0), 0).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <Users className="text-accent mb-3" size={24} />
                  <p className="text-2xl font-bold text-foreground">{affiliateReferrals.length}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>

              {/* Default commission in settings */}
              <div className="bg-card border border-border rounded-xl p-6 max-w-sm">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">Default Commission Rate</h3>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm?.default_affiliate_commission ?? 10}
                    onChange={e => setSettingsForm((prev: any) => ({ ...prev, default_affiliate_commission: Number(e.target.value) }))}
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                  <Button size="sm" className="rounded-full" onClick={handleSaveSettings}>Save</Button>
                </div>
              </div>

              {/* Affiliates table */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Code</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Referrals</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Commission %</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Earnings</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>
                      {affiliates.map((a: any) => (
                        <tr key={a.id} className="border-t border-border">
                          <td className="p-4 font-mono font-medium text-primary">{a.referral_code}</td>
                          <td className="p-4 text-foreground">{a.total_referrals}</td>
                          <td className="p-4">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              defaultValue={a.commission_rate}
                              className="w-20 h-8 text-sm"
                              onBlur={async (e) => {
                                const val = Number(e.target.value);
                                if (val !== a.commission_rate) {
                                  const { error } = await supabase.from("affiliates").update({ commission_rate: val }).eq("id", a.id);
                                  if (error) toast.error(error.message);
                                  else { toast.success("Commission updated"); fetchAllData(); }
                                }
                              }}
                            />
                          </td>
                          <td className="p-4 text-foreground font-medium">${Number(a.total_earnings).toLocaleString()}</td>
                          <td className="p-4">
                            {a.is_active ? (
                              <span className="text-safari-green text-xs font-medium bg-safari-green/10 px-2 py-0.5 rounded-full">Active</span>
                            ) : (
                              <span className="text-muted-foreground text-xs">Inactive</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <Button size="sm" variant="outline" className="text-xs h-7 rounded-full"
                              onClick={async () => {
                                const { error } = await supabase.from("affiliates").update({ is_active: !a.is_active }).eq("id", a.id);
                                if (error) toast.error(error.message);
                                else { toast.success(a.is_active ? "Deactivated" : "Activated"); fetchAllData(); }
                              }}>
                              {a.is_active ? "Deactivate" : "Activate"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {affiliates.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No affiliates yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && settingsForm && (
            <div className="space-y-6 max-w-3xl">
              {/* Branding & Contact */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Branding & Contact</h3>
                <p className="text-xs text-muted-foreground mb-5">Public site identity & contact details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium">Site Name</label><Input value={settingsForm.site_name || ""} onChange={e => setSettingsForm({...settingsForm, site_name: e.target.value})} className="mt-1" /></div>
                  <div><label className="text-sm font-medium">Tagline</label><Input value={settingsForm.tagline || ""} onChange={e => setSettingsForm({...settingsForm, tagline: e.target.value})} className="mt-1" /></div>
                  <div className="md:col-span-2"><label className="text-sm font-medium">Logo URL</label><Input value={settingsForm.logo_url || ""} onChange={e => setSettingsForm({...settingsForm, logo_url: e.target.value})} className="mt-1" placeholder="https://..." /></div>
                  <div><label className="text-sm font-medium">Contact Email</label><Input value={settingsForm.contact_email || ""} onChange={e => setSettingsForm({...settingsForm, contact_email: e.target.value})} className="mt-1" type="email" /></div>
                  <div><label className="text-sm font-medium">Contact Phone</label><Input value={settingsForm.contact_phone || ""} onChange={e => setSettingsForm({...settingsForm, contact_phone: e.target.value})} className="mt-1" /></div>
                </div>
              </div>

              {/* Head Office */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Head Office</h3>
                <p className="text-xs text-muted-foreground mb-5">Displayed on contact page and email footers</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2"><label className="text-sm font-medium">Office Address</label><Input value={settingsForm.office_address || ""} onChange={e => setSettingsForm({...settingsForm, office_address: e.target.value})} className="mt-1" placeholder="Head Office, Street name" /></div>
                  <div><label className="text-sm font-medium">City</label><Input value={settingsForm.office_city || ""} onChange={e => setSettingsForm({...settingsForm, office_city: e.target.value})} className="mt-1" placeholder="Nairobi" /></div>
                  <div><label className="text-sm font-medium">Country</label><Input value={settingsForm.office_country || ""} onChange={e => setSettingsForm({...settingsForm, office_country: e.target.value})} className="mt-1" placeholder="Kenya" /></div>
                </div>
              </div>

              {/* SMTP Configuration */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-start justify-between mb-1 gap-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">SMTP / Email Sending</h3>
                    <p className="text-xs text-muted-foreground mt-1">Configure your own SMTP. Leave blank to use the built-in service.</p>
                  </div>
                  <Mail className="text-muted-foreground shrink-0" size={20} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <div className="md:col-span-2"><label className="text-sm font-medium">SMTP Host</label><Input value={settingsForm.smtp_host || ""} onChange={e => setSettingsForm({...settingsForm, smtp_host: e.target.value})} className="mt-1" placeholder="smtp.gmail.com or mail.yourdomain.com" /></div>
                  <div><label className="text-sm font-medium">Port</label><Input type="number" value={settingsForm.smtp_port || 587} onChange={e => setSettingsForm({...settingsForm, smtp_port: parseInt(e.target.value) || 587})} className="mt-1" /></div>
                  <div className="flex items-end"><label className="flex items-center gap-2 text-sm font-medium pb-2 cursor-pointer"><input type="checkbox" checked={settingsForm.smtp_use_tls !== false} onChange={e => setSettingsForm({...settingsForm, smtp_use_tls: e.target.checked})} /> Use TLS (auto-fallback)</label></div>
                  <div><label className="text-sm font-medium">Username</label><Input value={settingsForm.smtp_user || ""} onChange={e => setSettingsForm({...settingsForm, smtp_user: e.target.value})} className="mt-1" autoComplete="off" /></div>
                  <div><label className="text-sm font-medium">Password</label><Input type="password" value={settingsForm.smtp_password || ""} onChange={e => setSettingsForm({...settingsForm, smtp_password: e.target.value})} className="mt-1" placeholder="••••••••" autoComplete="new-password" /></div>
                  <div><label className="text-sm font-medium">From Email</label><Input value={settingsForm.smtp_from_email || ""} onChange={e => setSettingsForm({...settingsForm, smtp_from_email: e.target.value})} className="mt-1" type="email" placeholder="noreply@yourdomain.com" /></div>
                  <div><label className="text-sm font-medium">From Name</label><Input value={settingsForm.smtp_from_name || ""} onChange={e => setSettingsForm({...settingsForm, smtp_from_name: e.target.value})} className="mt-1" placeholder="SafariHorizons" /></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  <Button onClick={handleSaveSettings} disabled={savingSettings} className="rounded-full">{savingSettings ? "Saving..." : "Save All Settings"}</Button>
                  <Button variant="outline" onClick={handleSendTestEmail} disabled={sendingTest} className="rounded-full gap-2">
                    {sendingTest ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" /> Testing...</> : <><Send size={14} /> Send Test Email</>}
                  </Button>
                  <span className="text-xs text-muted-foreground">Saves first, then sends a test to your contact email</span>
                </div>
              </div>
            </div>
          )}
          {activeTab === "settings" && !settingsForm && (
            <div className="bg-card border border-border rounded-xl p-6 max-w-xl">
              <p className="text-muted-foreground">No settings found. They will be created when you save.</p>
              <Button className="mt-4 rounded-full" onClick={() => setSettingsForm({ site_name: "SafariHorizons", tagline: "", contact_email: "info@safarihorizons.com", contact_phone: "+254 702228218", logo_url: "", office_address: "Head Office", office_city: "Nairobi", office_country: "Kenya", smtp_port: 587, smtp_use_tls: true })}>Initialize Settings</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
