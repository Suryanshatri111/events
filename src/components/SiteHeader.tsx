import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-accent/30">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary grid place-items-center floodlight-glow">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="text-display text-xl text-accent leading-none">BoundaryLine</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Sports Events</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Home</Link>
          <Link to="/events" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Events</Link>
          <Link to="/enquiry" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Enquiry</Link>
          <Link to="/contact" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Contact</Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-accent" activeProps={{ className: "text-accent" }}>Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
          ) : (
            <Link to="/auth"><Button variant="outline" size="sm">Admin Login</Button></Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-accent/30 bg-background/60">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <div className="text-display text-2xl text-accent mb-2">BoundaryLine</div>
        <p>© {new Date().getFullYear()} BoundaryLine Sports Events. All sixes reserved.</p>
      </div>
    </footer>
  );
}
