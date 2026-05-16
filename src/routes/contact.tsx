import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Mail, Phone, MapPin, User } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — BoundaryLine" }] }),
  component: ContactPage,
});

const ICONS: Record<string, any> = { email: Mail, phone: Phone, address: MapPin, person: User };

function ContactPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("contact_details").select("*").eq("is_active", true).order("display_order")
      .then(({ data }) => setContacts(data ?? []));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="container mx-auto px-4 py-16 flex-1 max-w-3xl">
        <h1 className="text-display text-5xl text-center">GET IN <span className="text-accent">TOUCH</span></h1>
        <p className="text-center text-muted-foreground mt-3">Reach our team at the pavilion.</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {contacts.map(c => {
            const Icon = ICONS[c.type] || Mail;
            return (
              <div key={c.id} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{c.label}</div>
                    {c.person_name && <div className="text-display text-xl mt-1">{c.person_name}</div>}
                    <div className="mt-1 text-foreground">{c.value}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
