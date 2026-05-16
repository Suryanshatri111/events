import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { EventCard } from "./index";

export const Route = createFileRoute("/events")({
  head: () => ({ meta: [{ title: "Events — BoundaryLine" }, { name: "description", content: "All upcoming sports events." }] }),
  component: EventsPage,
});

function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").eq("is_active", true).order("event_date")
      .then(({ data }) => setEvents(data ?? []));
    supabase.from("event_types").select("sport_name")
      .then(({ data }) => setTypes(["All", ...(data ?? []).map((t: any) => t.sport_name)]));
  }, []);

  const filtered = filter === "All" ? events : events.filter(e => e.sport_type === filter);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-16 flex-1">
        <h1 className="text-display text-5xl md:text-6xl text-center">UPCOMING <span className="text-accent">EVENTS</span></h1>
        <p className="text-center text-muted-foreground mt-3">Pick a fixture and send your enquiry.</p>

        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter === t ? "bg-accent text-accent-foreground border-accent" : "border-border hover:border-accent"}`}>
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No events match.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filtered.map(e => <EventCard key={e.id} ev={e} />)}
          </div>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
