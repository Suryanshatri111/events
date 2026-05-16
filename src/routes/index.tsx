import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, MapPin, IndianRupee } from "lucide-react";
import heroImg from "@/assets/stadium-hero.jpg";

export const Route = createFileRoute("/")({ component: Home });

interface EventRow {
  id: string; title: string; sport_type: string; venue: string;
  event_date: string; price_inr: number; image_url: string | null;
}

function Home() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [types, setTypes] = useState<{ sport_name: string; description: string | null }[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").eq("is_active", true).order("event_date").limit(3)
      .then(({ data }) => setEvents(data ?? []));
    supabase.from("event_types").select("sport_name, description")
      .then(({ data }) => setTypes(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Cricket stadium under floodlights" width={1920} height={1088}
             className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
        <div className="container mx-auto relative px-4 py-32 md:py-44 text-center">
          <div className="inline-block scoreboard rounded-md px-4 py-1 mb-6 text-accent text-xs tracking-[0.3em]">
            ★ LIVE BOOKINGS OPEN ★
          </div>
          <h1 className="text-display text-6xl md:text-8xl text-foreground">
            STEP INTO THE <span className="text-accent">STADIUM</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            India's home for cricket, football, badminton & more. Browse upcoming fixtures, send an enquiry and we'll save your seat at the boundary line.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/events"><Button size="lg" className="text-display tracking-widest">View Events</Button></Link>
            <Link to="/enquiry"><Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-display tracking-widest">Send Enquiry</Button></Link>
          </div>
        </div>
        {/* Pitch stripe */}
        <div className="h-3 pitch-stripe boundary-rope border-t-2 border-b-2" />
      </section>

      {/* SPORTS TYPES */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-display text-4xl md:text-5xl text-center mb-12">
          OUR <span className="text-accent">SPORTING ARENAS</span>
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {types.map((t) => (
            <div key={t.sport_name} className="bg-card border border-border rounded-lg p-6 text-center hover:border-accent transition-colors">
              <Trophy className="w-8 h-8 mx-auto text-accent mb-3" />
              <div className="text-display text-xl">{t.sport_name}</div>
              <p className="text-xs text-muted-foreground mt-2">{t.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-display text-4xl md:text-5xl">UPCOMING <span className="text-accent">FIXTURES</span></h2>
          <Link to="/events" className="text-sm text-accent hover:underline">View all →</Link>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
            No fixtures scheduled yet. Check back soon!
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((e) => <EventCard key={e.id} ev={e} />)}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}

export function EventCard({ ev }: { ev: EventRow }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent hover:floodlight-glow transition-all">
      <div className="h-40 pitch-stripe relative">
        {ev.image_url && <img src={ev.image_url} alt={ev.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute top-2 right-2 scoreboard rounded px-2 py-1 text-xs text-accent">{ev.sport_type}</div>
      </div>
      <div className="p-5">
        <h3 className="text-display text-2xl">{ev.title}</h3>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" />{new Date(ev.event_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{ev.venue}</div>
          <div className="flex items-center gap-2 text-foreground font-semibold"><IndianRupee className="w-4 h-4 text-accent" />{Number(ev.price_inr).toLocaleString("en-IN")}</div>
        </div>
        <Link to="/enquiry" search={{ event: ev.id }}>
          <Button className="w-full mt-4 text-display tracking-wider">Enquire Now</Button>
        </Link>
      </div>
    </div>
  );
}
