import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, DollarSign, X } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  method_type: string;
  instructions: string;
  is_active: boolean;
  display_order: number;
}

const METHOD_TYPES = [
  { value: "bank", label: "🏦 Bank Transfer" },
  { value: "mpesa", label: "📱 M-Pesa" },
  { value: "paypal", label: "💳 PayPal" },
  { value: "wise", label: "🌍 Wise" },
  { value: "crypto", label: "₿ Crypto" },
  { value: "other", label: "✉️ Other" },
];

const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PaymentMethod> | null>(null);

  const fetchMethods = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("display_order")
      .order("created_at");
    setMethods((data as PaymentMethod[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMethods(); }, []);

  const handleSave = async () => {
    if (!editing?.name || !editing?.instructions) {
      toast.error("Name and instructions are required");
      return;
    }
    const payload = {
      name: editing.name,
      method_type: editing.method_type || "bank",
      instructions: editing.instructions,
      is_active: editing.is_active ?? true,
      display_order: editing.display_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("payment_methods").update(payload).eq("id", editing.id)
      : await supabase.from("payment_methods").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success(editing.id ? "Updated" : "Added");
      setEditing(null);
      fetchMethods();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this payment method?")) return;
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetchMethods(); }
  };

  const toggleActive = async (m: PaymentMethod) => {
    await supabase.from("payment_methods").update({ is_active: !m.is_active }).eq("id", m.id);
    fetchMethods();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <DollarSign size={18} className="text-primary" /> Payment Methods
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add bank, M-Pesa, PayPal, Wise or other methods. Selectable when sending invoices.
            </p>
          </div>
          <Button size="sm" className="rounded-full gap-2" onClick={() => setEditing({ method_type: "bank", is_active: true })}>
            <Plus size={14} /> Add Method
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : methods.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No payment methods yet. Add one to use in invoice emails.</p>
        ) : (
          <div className="space-y-2">
            {methods.map(m => (
              <div key={m.id} className={`border rounded-xl p-4 ${m.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {METHOD_TYPES.find(t => t.value === m.method_type)?.label || m.method_type}
                      </span>
                      <span className="font-medium text-foreground">{m.name}</span>
                      {!m.is_active && <span className="text-xs text-muted-foreground">(inactive)</span>}
                    </div>
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded p-2 mt-2">{m.instructions}</pre>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(m)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs px-3">
                      {m.is_active ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => setEditing(m)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-display text-lg font-bold">{editing.id ? "Edit" : "Add"} Payment Method</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={editing.method_type || "bank"}
                  onChange={e => setEditing({ ...editing, method_type: e.target.value })}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {METHOD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={editing.name || ""}
                  onChange={e => setEditing({ ...editing, name: e.target.value })}
                  placeholder="e.g. KCB Bank Kenya, Safaricom M-Pesa, PayPal Business"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Instructions</label>
                <Textarea
                  value={editing.instructions || ""}
                  onChange={e => setEditing({ ...editing, instructions: e.target.value })}
                  placeholder={"Bank: KCB Bank Kenya\nAccount Name: Safari Horizons Ltd\nAccount #: 1234567890\nSwift: KCBLKENX\nReference: Booking #{bookingId}"}
                  rows={8}
                  className="mt-1 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground mt-1">Will appear in the invoice email body.</p>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (selectable in invoices)
              </label>
            </div>
            <div className="p-5 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setEditing(null)} className="flex-1 rounded-full">Cancel</Button>
              <Button onClick={handleSave} className="flex-1 rounded-full">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethods;
