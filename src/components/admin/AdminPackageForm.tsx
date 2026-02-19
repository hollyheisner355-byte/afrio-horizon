import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  pkg?: any;
  countries: any[];
  onClose: () => void;
  onSaved: () => void;
}

const AdminPackageForm = ({ pkg, countries, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    title: pkg?.title || "",
    description: pkg?.description || "",
    price: pkg?.price || "",
    duration_days: pkg?.duration_days || 1,
    group_size: pkg?.group_size || "",
    highlights: pkg?.highlights?.join(", ") || "",
    image_url: pkg?.image_url || "",
    country_id: pkg?.country_id || "",
    is_active: pkg?.is_active ?? true,
    is_featured: pkg?.is_featured ?? false,
    rating: pkg?.rating || 4.5,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      price: Number(form.price),
      duration_days: Number(form.duration_days),
      rating: Number(form.rating),
      highlights: form.highlights ? form.highlights.split(",").map((h: string) => h.trim()).filter(Boolean) : [],
      country_id: form.country_id || null,
    };

    let error;
    if (pkg) {
      ({ error } = await supabase.from("packages").update(data).eq("id", pkg.id));
    } else {
      ({ error } = await supabase.from("packages").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(pkg ? "Package updated!" : "Package created!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{pkg ? "Edit Package" : "Add Package"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="mt-1" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="mt-1" /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={e => setForm({...form, duration_days: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Group Size</Label><Input value={form.group_size} onChange={e => setForm({...form, group_size: e.target.value})} placeholder="2-8" className="mt-1" /></div>
            <div><Label>Rating</Label><Input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="mt-1" /></div>
          </div>
          <div><Label>Country</Label>
            <select value={form.country_id} onChange={e => setForm({...form, country_id: e.target.value})} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="mt-1" /></div>
          <div><Label>Highlights (comma-separated)</Label><Input value={form.highlights} onChange={e => setForm({...form, highlights: e.target.value})} placeholder="Big Five, Hot Air Balloon" className="mt-1" /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} /> Featured</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving ? "Saving..." : pkg ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPackageForm;
