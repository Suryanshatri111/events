import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/enquiry")({
  validateSearch: (s: Record<string, unknown>) => ({ event: (s.event as string) || "" }),
  head: () => ({ meta: [{ title: "Send Enquiry — BoundaryLine" }] }),
  component: EnquiryPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name too short").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional(),
  event_id: z.string().optional(),
  message: z.string().trim().min(10, "Tell us a bit more").max(1000),
});

function EnquiryPage() {
  const { event } = Route.useSearch();
  const [events, setEvents] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_id: event, message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from("events").select("id, title, sport_type").eq("is_active", true).order("event_date")
      .then(({ data }) => setEvents(data ?? []));
  }, []);

  useEffect(() => { setForm(f => ({ ...f, event_id: event })); }, [event]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setLoading(true);
    const payload: any = { ...parsed.data };
    if (!payload.event_id) delete payload.event_id;
    const { error } = await supabase.from("enquiries").insert(payload);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Enquiry sent! We'll be in touch soon.");
    setForm({ name: "", email: "", phone: "", event_id: "", message: "" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-16 flex-1 max-w-2xl">
        <h1 className="text-display text-5xl text-center">SEND AN <span className="text-accent">ENQUIRY</span></h1>
        <p className="text-center text-muted-foreground mt-3">Tell us what you're after — we'll get back within 24 hours.</p>

        <form onSubmit={submit} className="mt-10 bg-card border border-border rounded-lg p-6 md:p-8 space-y-4 scoreboard">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="event">Event (optional)</Label>
            <select id="event" value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })}
              className="w-full h-10 px-3 rounded-md bg-input border border-border text-foreground">
              <option value="">— General enquiry —</option>
              {events.map(e => <option key={e.id} value={e.id}>{e.title} ({e.sport_type})</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
          </div>
          <Button type="submit" disabled={loading} className="w-full text-display tracking-widest" size="lg">
            {loading ? "Sending..." : "Send Enquiry"}
          </Button>
        </form>
      </section>
      <SiteFooter />
    </div>
  );
}
