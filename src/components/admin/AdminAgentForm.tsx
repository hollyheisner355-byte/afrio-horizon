import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  agent?: any;
  onClose: () => void;
  onSaved: () => void;
}

const AdminAgentForm = ({ agent, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    name: agent?.name || "",
    region: agent?.region || "",
    country: agent?.country || "",
    city: agent?.city || "",
    email: agent?.email || "",
    phone: agent?.phone || "",
    bio: agent?.bio || "",
    avatar_url: agent?.avatar_url || "",
    is_active: agent?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let error;
    if (agent) {
      ({ error } = await supabase.from("agents").update(form).eq("id", agent.id));
    } else {
      ({ error } = await supabase.from("agents").insert(form));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(agent ? "Agent updated!" : "Agent added!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{agent ? "Edit Agent" : "Add Agent"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1" /></div>
          <div><Label>Region</Label><Input value={form.region} onChange={e => setForm({...form, region: e.target.value})} required placeholder="Australia & NZ" className="mt-1" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Country</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="Australia" className="mt-1" /></div>
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="Sydney" className="mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1" /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1" /></div>
          </div>
          <div><Label>Bio</Label><Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="mt-1" /></div>
          <div><Label>Avatar URL</Label><Input value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} className="mt-1" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving ? "Saving..." : agent ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAgentForm;
