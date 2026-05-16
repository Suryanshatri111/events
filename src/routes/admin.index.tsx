import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({ component: EnquiriesAdmin });

const STATUSES = ["new", "contacted", "closed"];

function EnquiriesAdmin() {
  const [items, setItems] = useState<any[]>([]);

  const load = () => supabase.from("enquiries").select("*, events(title)").order("created_at", { ascending: false })
    .then(({ data }) => setItems(data ?? []));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Updated"); load(); }
  };
  const del = async (id: string) => {
    if (!confirm("Delete this enquiry?")) return;
    const { error } = await supabase.from("enquiries").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); load(); }
  };

  return (
    <div>
      <h2 className="text-display text-3xl mb-4">Enquiries <span className="text-accent">({items.length})</span></h2>
      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed rounded-lg">No enquiries yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map(e => (
            <div key={e.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <div className="text-display text-xl">{e.name}</div>
                    <div className="text-sm text-accent">{e.email}</div>
                    {e.phone && <div className="text-sm text-muted-foreground">{e.phone}</div>}
                  </div>
                  {e.events?.title && <div className="text-xs text-muted-foreground mt-1">Re: {e.events.title}</div>}
                  <p className="mt-2 text-sm">{e.message}</p>
                  <div className="text-xs text-muted-foreground mt-2">{new Date(e.created_at).toLocaleString("en-IN")}</div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value)}
                    className="h-8 px-2 text-xs rounded bg-input border border-border">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button size="sm" variant="destructive" onClick={() => del(e.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
