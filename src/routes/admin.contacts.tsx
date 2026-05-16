import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/contacts")({ component: ContactsAdmin });

const empty = { label: "", type: "phone", value: "", person_name: "", display_order: 0, is_active: true };
const TYPES = ["phone", "email", "address", "person"];

function ContactsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => supabase.from("contact_details").select("*").order("display_order").then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    const { id, ...rest } = editing;
    const payload = { ...rest, person_name: rest.person_name || null, display_order: Number(rest.display_order) || 0 };
    const op = id ? supabase.from("contact_details").update(payload).eq("id", id) : supabase.from("contact_details").insert(payload);
    const { error } = await op;
    if (error) toast.error(error.message); else { toast.success("Saved"); setOpen(false); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("contact_details").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-display text-3xl">Contact Details</h2>
        <Button onClick={() => { setEditing({ ...empty }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>

      <div className="space-y-2">
        {items.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.type} · {c.label}</div>
              {c.person_name && <div className="text-display text-lg">{c.person_name}</div>}
              <div className="text-sm">{c.value}</div>
              {!c.is_active && <div className="text-xs text-destructive">inactive</div>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="w-3 h-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => del(c.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Contact</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Label</Label><Input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} /></div>
                <div><Label>Type</Label>
                  <select value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-input border border-border">
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><Label>Person Name (optional)</Label><Input value={editing.person_name ?? ""} onChange={e => setEditing({ ...editing, person_name: e.target.value })} /></div>
              <div><Label>Value</Label><Input value={editing.value} onChange={e => setEditing({ ...editing, value: e.target.value })} /></div>
              <div><Label>Display Order</Label><Input type="number" value={editing.display_order} onChange={e => setEditing({ ...editing, display_order: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                Active
              </label>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
