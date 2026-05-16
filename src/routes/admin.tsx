import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Inbox, CalendarDays, Tag, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — BoundaryLine" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Enquiries", icon: Inbox, exact: true },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/types", label: "Event Types", icon: Tag },
  { to: "/admin/contacts", label: "Contacts", icon: Users },
];

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/auth" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="scoreboard rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="text-display text-2xl text-accent">ADMIN SCOREBOARD</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="bg-card border border-border rounded-lg p-2 h-fit">
            {NAV.map(n => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                  <n.icon className="w-4 h-4" />{n.label}
                </Link>
              );
            })}
          </aside>
          <main className="min-w-0"><Outlet /></main>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
