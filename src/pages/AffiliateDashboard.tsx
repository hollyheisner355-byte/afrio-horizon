import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Share2, DollarSign, Users, TrendingUp, Link as LinkIcon } from "lucide-react";
import { generateReferralCode } from "@/lib/affiliate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AffiliateDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);

      const { data: aff } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (aff) {
        setAffiliate(aff);
        const { data: refs } = await supabase
          .from("affiliate_referrals")
          .select("*")
          .eq("affiliate_id", aff.id)
          .order("created_at", { ascending: false });
        setReferrals(refs || []);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleJoin = async () => {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 container mx-auto px-4 py-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Affiliate Program</h1>
        <p className="text-muted-foreground mb-10">Earn commissions by referring travellers to SafariHorizons</p>

        {!affiliate ? (
          <div className="bg-card border border-border rounded-2xl p-8 max-w-lg mx-auto text-center">
            <Share2 className="text-primary mx-auto mb-4" size={48} />
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Become a Partner</h2>
            <p className="text-muted-foreground mb-6">
              Share your unique referral link and earn <strong className="text-primary">commission</strong> on every booking made through your link. 
              Commissions are tracked for 30 days after a visitor clicks your link.
            </p>
            <Button onClick={handleJoin} className="rounded-full px-10 py-5 text-base">
              Join Affiliate Program
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Total Referrals", value: affiliate.total_referrals, color: "text-primary" },
                { icon: DollarSign, label: "Total Earnings", value: `$${Number(affiliate.total_earnings).toLocaleString()}`, color: "text-secondary" },
                { icon: TrendingUp, label: "Commission Rate", value: `${Number(affiliate.commission_rate)}%`, color: "text-accent" },
                { icon: LinkIcon, label: "Status", value: affiliate.is_active ? "Active" : "Inactive", color: "text-muted-foreground" },
              ].map(s => (
                <div key={s.label} className="bg-card border border-border rounded-xl p-6">
                  <s.icon className={`${s.color} mb-3`} size={24} />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Referral link */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-4">Your Referral Link</h3>
              <p className="text-xs text-muted-foreground mb-3">Share this link — anyone who signs up and books within 30 days earns you commission</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input value={referralLink} readOnly className="flex-1 font-mono text-sm" />
                <Button onClick={copyLink} className="rounded-full gap-2 shrink-0"><Copy size={16} /> Copy Link</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Your code: <strong className="text-primary">{affiliate.referral_code}</strong></p>
            </div>

            {/* Referral history */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-border">
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
      </div>
      <Footer />
    </div>
  );
};

export default AffiliateDashboard;
