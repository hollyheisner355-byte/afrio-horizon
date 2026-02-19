import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  testimonial?: any;
  onClose: () => void;
  onSaved: () => void;
}

const AdminTestimonialForm = ({ testimonial, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    name: testimonial?.name || "",
    text: testimonial?.text || "",
    location: testimonial?.location || "",
    rating: testimonial?.rating || 5,
    avatar_url: testimonial?.avatar_url || "",
    is_approved: testimonial?.is_approved ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, rating: Number(form.rating) };
    let error;
    if (testimonial) {
      ({ error } = await supabase.from("testimonials").update(data).eq("id", testimonial.id));
    } else {
      ({ error } = await supabase.from("testimonials").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(testimonial ? "Testimonial updated!" : "Testimonial added!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{testimonial ? "Edit Testimonial" : "Add Testimonial"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" /></div>
          <div><Label>Location</Label><Input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Sydney, Australia" className="mt-1" /></div>
          <div><Label>Review</Label><Textarea value={form.text} onChange={e => setForm({...form, text: e.target.value})} required className="mt-1" /></div>
          <div><Label>Rating (1-5)</Label><Input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} className="mt-1" /></div>
          <div><Label>Avatar URL</Label><Input value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} className="mt-1" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_approved} onChange={e => setForm({...form, is_approved: e.target.checked})} /> Approved</label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving ? "Saving..." : testimonial ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTestimonialForm;
