import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getAffiliateRef, clearAffiliateRef } from "@/lib/affiliate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Clock, Users, Star, MapPin, Check, ArrowLeft, Phone, Mail, DollarSign, UserCheck, Shield, Plane, CreditCard, MessageCircle, Minus, Plus } from "lucide-react";

const REGION_OPTIONS = [
  { label: "Australia & New Zealand", keywords: ["australia", "new zealand", "oceania"] },
  { label: "United Kingdom & Europe", keywords: ["uk", "united kingdom", "europe"] },
  { label: "United States & Canada", keywords: ["usa", "united states", "america", "canada"] },
];

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ travel_date: "", guests: 1, notes: "", user_region: "", email: "", full_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [assignedAgent, setAssignedAgent] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (session?.user?.email) {
        setBookingForm(prev => ({ ...prev, email: session.user.email || "" }));
      }

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

  useEffect(() => {
    if (!bookingForm.user_region) { setAssignedAgent(null); return; }
    const matched = agents.find(a => a.region === bookingForm.user_region);
    setAssignedAgent(matched || null);
  }, [bookingForm.user_region, agents]);

  const totalPrice = (pkg?.price || 0) * bookingForm.guests;
  const depositAmount = Math.ceil(totalPrice * 0.5);

  const adjustGuests = (delta: number) => {
    setBookingForm(prev => ({ ...prev, guests: Math.max(1, prev.guests + delta) }));
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate("/auth"); return; }
    if (!bookingForm.user_region) { toast.error("Please select your region"); return; }
    if (!bookingForm.email) { toast.error("Please enter your email"); return; }
    setSubmitting(true);
    const { data: bookingData, error } = await supabase.from("bookings").insert({
      user_id: user.id,
      package_id: id,
      agent_id: assignedAgent?.id || null,
      travel_date: bookingForm.travel_date || null,
      guests: Number(bookingForm.guests),
      notes: `Contact: ${bookingForm.full_name || "N/A"} | Email: ${bookingForm.email}${bookingForm.notes ? ` | ${bookingForm.notes}` : ""}`,
      total_price: totalPrice,
      deposit_paid: 0,
      status: "pending",
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }

    // Track affiliate referral if cached
    const refCode = getAffiliateRef();
    if (refCode && bookingData) {
      const { data: aff } = await supabase.from("affiliates").select("id, commission_rate").eq("referral_code", refCode).eq("is_active", true).maybeSingle();
      if (aff) {
        const commission = Math.ceil(totalPrice * (Number(aff.commission_rate) / 100));
        await supabase.from("affiliate_referrals").insert({
          affiliate_id: aff.id,
          referred_user_id: user.id,
          booking_id: bookingData.id,
          commission_amount: commission,
          status: "pending",
        });
        clearAffiliateRef();
      }
    }

    toast.success(`Booking submitted! ${assignedAgent?.name || 'An agent'} will contact you to arrange your $${depositAmount.toLocaleString()} deposit.`);
    setShowBooking(false);
    navigate("/dashboard");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!pkg) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Package not found</p></div>;

  const location = pkg.countries?.name || "Africa";

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
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 text-primary-foreground">
            <div className="container mx-auto">
              <button onClick={() => navigate("/packages")} className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 text-sm">
                <ArrowLeft size={16} /> Back to Packages
              </button>
              <p className="text-primary font-medium mb-2">{location}</p>
              <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold mb-3">{pkg.title}</h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-primary-foreground/80 text-sm">
                <span className="flex items-center gap-1"><Clock size={16} /> {pkg.duration_days} days</span>
                {pkg.group_size && <span className="flex items-center gap-1"><Users size={16} /> {pkg.group_size} guests</span>}
                <span className="flex items-center gap-1"><Star size={16} className="text-primary fill-primary" /> {Number(pkg.rating).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Tour info banner */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/20 rounded-lg px-4 py-3 text-sm flex-1">
              <MapPin size={16} className="text-secondary shrink-0" />
              <span className="text-foreground">This tour starts and ends in <strong>{location}</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm flex-1">
              <Plane size={16} className="text-primary shrink-0" />
              <span className="text-foreground">Book your own international flights when using this operator</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Details */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">About This Safari</h2>
                <p className="text-muted-foreground leading-relaxed">{pkg.description || "An incredible African safari experience awaits you."}</p>
              </div>

              {/* Medical Insurance Notice */}
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Shield size={22} className="text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">Medical Insurance Included</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Comprehensive travel medical insurance is included for the duration of your stay in {location}. 
                      Coverage includes emergency medical evacuation, hospitalization, and 24/7 assistance. 
                      We recommend also carrying your own international travel insurance for added peace of mind.
                    </p>
                  </div>
                </div>
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
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><UserCheck className="text-primary" size={16} /></div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">{a.name}</h4>
                            <p className="text-primary text-xs font-medium">{a.region}</p>
                          </div>
                        </div>
                        {a.city && <p className="text-muted-foreground text-xs flex items-center gap-1 mt-2"><MapPin size={11} /> {a.city}{a.country ? `, ${a.country}` : ""}</p>}
                        
                        {/* Contact starters */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {a.email && (
                            <a href={`mailto:${a.email}?subject=Safari Booking Inquiry - ${pkg.title}`} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-full px-3 py-1.5 transition-colors">
                              <Mail size={12} /> Email
                            </a>
                          )}
                          {a.phone && (
                            <a href={`https://wa.me/${a.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-full px-3 py-1.5 transition-colors">
                              <MessageCircle size={12} /> WhatsApp
                            </a>
                          )}
                          {a.phone && (
                            <a href={`tel:${a.phone}`} className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-full px-3 py-1.5 transition-colors">
                              <Phone size={12} /> Call
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Booking Sidebar */}
            <div>
              <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 sticky top-28">
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">${Number(pkg.price).toLocaleString()}</span>
                  <span className="text-muted-foreground"> /person</span>
                </div>

                {/* Stripe temporarily unavailable */}
                <div className="bg-muted border border-border rounded-lg p-3 mb-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard size={14} /> Online card payments temporarily unavailable</p>
                  <p className="text-xs text-muted-foreground mt-1">Your assigned agent will arrange the deposit payment directly</p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6">
                  <p className="text-xs text-primary font-medium flex items-center gap-1"><DollarSign size={14} /> 50% deposit required to confirm</p>
                  <p className="text-xs text-muted-foreground mt-1">Remaining balance due before departure</p>
                </div>

                {!showBooking ? (
                  <Button onClick={() => setShowBooking(true)} className="w-full rounded-full py-5 text-base">
                    Book This Safari
                  </Button>
                ) : (
                  <form onSubmit={handleBook} className="space-y-4">
                    {/* Contact info */}
                    <div>
                      <Label>Full Name</Label>
                      <Input value={bookingForm.full_name} onChange={e => setBookingForm({...bookingForm, full_name: e.target.value})} placeholder="Your full name" className="mt-1" required />
                    </div>
                    <div>
                      <Label>Email Address</Label>
                      <Input type="email" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} placeholder="your@email.com" className="mt-1" required />
                    </div>

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
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                        <p className="text-xs font-medium text-foreground flex items-center gap-1"><UserCheck size={14} className="text-primary" /> Your assigned agent</p>
                        <p className="text-sm font-bold text-foreground mt-1">{assignedAgent.name}</p>
                        <p className="text-xs text-muted-foreground">{assignedAgent.city}{assignedAgent.country ? `, ${assignedAgent.country}` : ""}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {assignedAgent.email && (
                            <a href={`mailto:${assignedAgent.email}?subject=Booking Inquiry - ${pkg.title}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><Mail size={10} /> Email</a>
                          )}
                          {assignedAgent.phone && (
                            <a href={`https://wa.me/${assignedAgent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-secondary hover:underline"><MessageCircle size={10} /> WhatsApp</a>
                          )}
                          {assignedAgent.phone && (
                            <a href={`tel:${assignedAgent.phone}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline"><Phone size={10} /> Call</a>
                          )}
                        </div>
                      </div>
                    )}

                    <div><Label>Travel Date</Label><Input type="date" value={bookingForm.travel_date} onChange={e => setBookingForm({...bookingForm, travel_date: e.target.value})} className="mt-1" /></div>
                    
                    {/* Guest counter with +/- buttons */}
                    <div>
                      <Label>Guests</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <button type="button" onClick={() => adjustGuests(-1)} className="w-9 h-9 rounded-full border border-input bg-background flex items-center justify-center hover:bg-muted transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="text-lg font-bold text-foreground w-8 text-center">{bookingForm.guests}</span>
                        <button type="button" onClick={() => adjustGuests(1)} className="w-9 h-9 rounded-full border border-input bg-background flex items-center justify-center hover:bg-muted transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div><Label>Special Requests</Label><Textarea value={bookingForm.notes} onChange={e => setBookingForm({...bookingForm, notes: e.target.value})} placeholder="Dietary needs, accessibility, etc." rows={3} className="mt-1" /></div>
                    
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
