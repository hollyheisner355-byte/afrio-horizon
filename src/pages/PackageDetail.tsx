import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Clock, Users, Star, MapPin, Check, ArrowLeft, Phone, Mail, DollarSign, UserCheck } from "lucide-react";

const REGION_OPTIONS = [
  { label: "Australia & New Zealand", keywords: ["australia", "new zealand", "oceania"] },
  { label: "United Kingdom & Europe", keywords: ["uk", "united kingdom", "europe", "england", "france", "germany", "ireland", "spain", "italy", "netherlands", "scotland", "wales"] },
  { label: "United States & Canada", keywords: ["usa", "united states", "america", "canada", "north america"] },
];

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ travel_date: "", guests: 1, notes: "", user_region: "" });
  const [submitting, setSubmitting] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      const [pkgRes, agentsRes] = await Promise.all([
        supabase.from("packages").select("*, countries(name)").eq("id", id!).maybeSingle(),
        supabase.from("agents").select("*").eq("is_active", true),
      ]);
      setPkg(pkgRes.data);
      setAgents(agentsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  // Auto-assign agent when region changes
  useEffect(() => {
    if (!bookingForm.user_region) { setAssignedAgent(null); return; }
    const matched = agents.find(a => a.region === bookingForm.user_region);
    setAssignedAgent(matched || null);
  }, [bookingForm.user_region, agents]);

  const totalPrice = (pkg?.price || 0) * bookingForm.guests;
  const depositAmount = Math.ceil(totalPrice * 0.5);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!bookingForm.user_region) { toast.error("Please select your region"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      package_id: id,
      agent_id: assignedAgent?.id || null,
      travel_date: bookingForm.travel_date || null,
      guests: Number(bookingForm.guests),
      notes: bookingForm.notes || null,
      total_price: totalPrice,
      deposit_paid: 0,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking submitted! ${assignedAgent?.name || 'An agent'} will contact you to arrange your ${depositAmount.toLocaleString()} USD deposit.`);
    setShowBooking(false);
    navigate("/dashboard");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!pkg) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Package not found</p></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
          {pkg.image_url ? (
            <img src={pkg.image_url} alt={pkg.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
          <div className="absolute inset-0 bg-overlay-dark" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-primary-foreground">
            <div className="container mx-auto">
              <button onClick={() => navigate("/packages")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 text-sm">
                <ArrowLeft size={16} /> Back to Packages
              </button>
              <p className="text-primary font-medium mb-2">{pkg.countries?.name || "Africa"}</p>
              <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">{pkg.title}</h1>
              <div className="flex items-center gap-6 text-primary-foreground/80">
                <span className="flex items-center gap-1"><Clock size={16} /> {pkg.duration_days} days</span>
                {pkg.group_size && <span className="flex items-center gap-1"><Users size={16} /> {pkg.group_size} guests</span>}
                <span className="flex items-center gap-1"><Star size={16} className="text-primary fill-primary" /> {Number(pkg.rating).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">About This Safari</h2>
                <p className="text-muted-foreground leading-relaxed">{pkg.description || "An incredible African safari experience awaits you."}</p>
              </div>
              {pkg.highlights?.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Highlights</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pkg.highlights.map((h: string) => (
                      <div key={h} className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
                        <Check className="text-primary shrink-0" size={18} />
                        <span className="text-foreground text-sm">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agents by region */}
              {agents.length > 0 && (
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-4">Your Regional Agents</h3>
                  <p className="text-muted-foreground mb-6">Contact the agent in your region. They'll help you book, arrange travel, and handle your 50% deposit payment.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map(a => (
                      <div key={a.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><UserCheck className="text-primary" size={16} /></div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{a.name}</h4>
                            <p className="text-primary text-xs font-medium">{a.region}</p>
                          </div>
                        </div>
                        {a.city && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-2"><MapPin size={11} /> {a.city}{a.country ? `, ${a.country}` : ""}</p>}
                        {a.phone && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1"><Phone size={11} /> {a.phone}</p>}
                        {a.email && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1"><Mail size={11} /> {a.email}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div>
              <div className="bg-card border border-border rounded-2xl p-6 sticky top-28">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">${Number(pkg.price).toLocaleString()}</span>
                  <span className="text-muted-foreground"> /person</span>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6">
                  <p className="text-xs text-primary font-medium flex items-center gap-1"><DollarSign size={14} /> 50% deposit required to confirm</p>
                  <p className="text-xs text-muted-foreground mt-1">Your assigned agent will arrange the deposit payment</p>
                </div>
                {!showBooking ? (
                  <Button onClick={() => setShowBooking(true)} className="w-full rounded-full py-5 text-base">
                    Book This Safari
                  </Button>
                ) : (
                  <form onSubmit={handleBook} className="space-y-4">
                    {/* Region selector */}
                    <div>
                      <Label>Where are you from?</Label>
                      <select
                        value={bookingForm.user_region}
                        onChange={e => setBookingForm({...bookingForm, user_region: e.target.value})}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select your region</option>
                        {REGION_OPTIONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                      </select>
                    </div>

                    {/* Show assigned agent */}
                    {assignedAgent && (
                      <div className="bg-accent/30 border border-accent/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-foreground flex items-center gap-1"><UserCheck size={14} className="text-primary" /> Your assigned agent</p>
                        <p className="text-sm font-bold text-foreground mt-1">{assignedAgent.name}</p>
                        <p className="text-xs text-muted-foreground">{assignedAgent.city}{assignedAgent.country ? `, ${assignedAgent.country}` : ""}</p>
                        {assignedAgent.phone && <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Phone size={10} /> {assignedAgent.phone}</p>}
                        {assignedAgent.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail size={10} /> {assignedAgent.email}</p>}
                      </div>
                    )}

                    <div><Label>Travel Date</Label><Input type="date" value={bookingForm.travel_date} onChange={e => setBookingForm({...bookingForm, travel_date: e.target.value})} className="mt-1" /></div>
                    <div><Label>Guests</Label><Input type="number" min="1" value={bookingForm.guests} onChange={e => setBookingForm({...bookingForm, guests: Number(e.target.value)})} className="mt-1" /></div>
                    <div><Label>Notes</Label><Textarea value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} placeholder="Any special requests..." rows={3} className="mt-1" /></div>
                    
                    {/* Price breakdown */}
                    <div className="bg-muted rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-muted-foreground">Price × {bookingForm.guests}</span><span className="font-medium text-foreground">${totalPrice.toLocaleString()}</span></div>
                      <div className="border-t border-border pt-2 flex justify-between text-sm">
                        <span className="text-primary font-medium">50% Deposit Due</span>
                        <span className="font-bold text-primary">${depositAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Remaining balance due before departure</p>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full rounded-full py-5">
                      {submitting ? "Submitting..." : "Submit Booking Request"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      {assignedAgent ? `${assignedAgent.name} will contact you to arrange your $${depositAmount.toLocaleString()} deposit` : "An agent will contact you to arrange deposit payment"}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PackageDetail;
