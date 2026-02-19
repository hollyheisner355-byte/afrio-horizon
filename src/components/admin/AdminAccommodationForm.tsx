import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  accommodation?: any;
  countries: any[];
  onClose: () => void;
  onSaved: () => void;
}

const AdminAccommodationForm = ({ accommodation, countries, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    name: accommodation?.name || "",
    description: accommodation?.description || "",
    price_per_night: accommodation?.price_per_night || "",
    country_id: accommodation?.country_id || "",
    image_url: accommodation?.image_url || "",
    amenities: accommodation?.amenities?.join(", ") || "",
    rating: accommodation?.rating || 4.5,
    is_active: accommodation?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      price_per_night: form.price_per_night ? Number(form.price_per_night) : null,
      rating: Number(form.rating),
      amenities: form.amenities ? form.amenities.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
      country_id: form.country_id || null,
    };
    let error;
    if (accommodation) {
      ({ error } = await supabase.from("accommodations").update(data).eq("id", accommodation.id));
    } else {
      ({ error } = await supabase.from("accommodations").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(accommodation ? "Accommodation updated!" : "Accommodation added!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{accommodation ? "Edit Accommodation" : "Add Accommodation"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price/Night ($)</Label><Input type="number" value={form.price_per_night} onChange={e => setForm({...form, price_per_night: e.target.value})} className="mt-1" /></div>
            <div><Label>Rating</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="mt-1" /></div>
          </div>
          <div><Label>Country</Label>
            <select value={form.country_id} onChange={e => setForm({...form, country_id: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="mt-1" /></div>
          <div><Label>Amenities (comma-separated)</Label><Input value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} placeholder="WiFi, Pool, Restaurant" className="mt-1" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving ? "Saving..." : accommodation ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAccommodationForm;
