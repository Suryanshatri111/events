import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/types")({ component: TypesAdmin });

function TypesAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ sport_name: "", description: "" });

  const load = () => supabase.from("event_types").select("*").order("sport_name").then(({ data }) => setItems(data ?? []));
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.sport_name.trim()) return;
    const { error } = await supabase.from("event_types").insert(form);
    if (error) toast.error(error.message); else { toast.success("Added"); setForm({ sport_name: "", description: "" }); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this sport type?")) return;
    const { error } = await supabase.from("event_types").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <h2 className="text-display text-3xl mb-4">Event Types</h2>

      <div className="bg-card border border-border rounded-lg p-4 mb-6 grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-end">
        <div><Label>Sport Name</Label><Input value={form.sport_name} onChange={e => setForm({ ...form, sport_name: e.target.value })} /></div>
        <div><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <Button onClick={add}><Plus className="w-4 h-4 mr-1" />Add</Button>
      </div>

      <div className="space-y-2">
        {items.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="text-display text-lg">{t.sport_name}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </div>
            <Button size="sm" variant="destructive" onClick={() => del(t.id)}><Trash2 className="w-3 h-3" /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
