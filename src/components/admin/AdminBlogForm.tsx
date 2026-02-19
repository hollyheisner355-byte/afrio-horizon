import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";

interface Props {
  blog?: any;
  onClose: () => void;
  onSaved: () => void;
}

const AdminBlogForm = ({ blog, onClose, onSaved }: Props) => {
  const [form, setForm] = useState({
    title: blog?.title || "",
    excerpt: blog?.excerpt || "",
    content: blog?.content || "",
    author: blog?.author || "",
    image_url: blog?.image_url || "",
    is_published: blog?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      published_at: form.is_published ? new Date().toISOString() : null,
    };
    let error;
    if (blog) {
      ({ error } = await supabase.from("blogs").update(data).eq("id", blog.id));
    } else {
      ({ error } = await supabase.from("blogs").insert(data));
    }
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(blog ? "Blog updated!" : "Blog created!");
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-xl font-bold text-foreground">{blog ? "Edit Blog" : "New Blog Post"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="mt-1" /></div>
          <div><Label>Author</Label><Input value={form.author} onChange={e => setForm({...form, author: e.target.value})} className="mt-1" /></div>
          <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} rows={2} className="mt-1" /></div>
          <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8} className="mt-1" /></div>
          <div><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="mt-1" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} /> Publish immediately</label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-full">{saving ? "Saving..." : blog ? "Update" : "Create"}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBlogForm;
