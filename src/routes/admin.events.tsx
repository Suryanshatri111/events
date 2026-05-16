import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, IndianRupee } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/events")({ component: EventsAdmin });

const empty = { title: "", description: "", sport_type: "Cricket", venue: "", event_date: "", price_inr: 0, capacity: 0, image_url: "", is_active: true };

function EventsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => supabase.from("events").select("*").order("event_date").then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); supabase.from("event_types").select("sport_name").then(({ data }) => setTypes(data ?? [])); }, []);

  const openNew = () => { setEditing({ ...empty }); setOpen(true); };
  const openEdit = (e: any) => { setEditing({ ...e, event_date: e.event_date?.slice(0, 16) }); setOpen(true); };

  const save = async () => {
    const payload = {
      ...editing,
      price_inr: Number(editing.price_inr) || 0,
      capacity: Number(editing.capacity) || null,
      event_date: new Date(editing.event_date).toISOString(),
      image_url: editing.image_url || null,
    };
    const { id, ...rest } = payload;
    const op = id
      ? supabase.from("events").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id)
      : supabase.from("events").insert(rest);
    const { error } = await op;
    if (error) toast.error(error.message);
    else { toast.success("Saved"); setOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-display text-3xl">Events <span className="text-accent">({items.length})</span></h2>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-1" />Add Event</Button>
      </div>
      <div className="space-y-3">
        {items.map(e => (
          <div key={e.id} className="bg-card border border-border rounded-lg p-4 flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="text-display text-xl">{e.title}</div>
              <div className="text-sm text-muted-foreground">{e.sport_type} · {e.venue} · {new Date(e.event_date).toLocaleString("en-IN")}</div>
              <div className="text-sm flex items-center gap-1 mt-1"><IndianRupee className="w-3 h-3 text-accent" />{Number(e.price_inr).toLocaleString("en-IN")}{!e.is_active && <span className="ml-2 text-xs text-destructive">(inactive)</span>}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEdit(e)}><Pencil className="w-3 h-3" /></Button>
              <Button size="sm" variant="destructive" onClick={() => del(e.id)}><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={editing.description ?? ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Sport Type</Label>
                  <select value={editing.sport_type} onChange={e => setEditing({ ...editing, sport_type: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-input border border-border">
                    {types.map(t => <option key={t.sport_name} value={t.sport_name}>{t.sport_name}</option>)}
                  </select>
                </div>
                <div><Label>Venue</Label><Input value={editing.venue} onChange={e => setEditing({ ...editing, venue: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date & Time</Label><Input type="datetime-local" value={editing.event_date} onChange={e => setEditing({ ...editing, event_date: e.target.value })} /></div>
                <div><Label>Capacity</Label><Input type="number" value={editing.capacity ?? 0} onChange={e => setEditing({ ...editing, capacity: e.target.value })} /></div>
              </div>
              <div><Label>Price (INR ₹)</Label><Input type="number" value={editing.price_inr} onChange={e => setEditing({ ...editing, price_inr: e.target.value })} /></div>
              <div><Label>Image URL (optional)</Label><Input value={editing.image_url ?? ""} onChange={e => setEditing({ ...editing, image_url: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (visible to public)
              </label>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
