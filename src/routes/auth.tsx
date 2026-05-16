import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login — BoundaryLine" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) navigate({ to: "/admin" });
    else if (user) navigate({ to: "/" });
  }, [user, isAdmin, navigate]);

  const handle = async (mode: "in" | "up") => {
    setLoading(true);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email, password);
    setLoading(false);
    if (error) toast.error(error);
    else toast.success(mode === "in" ? "Welcome back!" : "Account created. Check your email.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 grid place-items-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-accent/40 rounded-lg p-8 scoreboard">
          <h1 className="text-display text-3xl text-center text-accent">ADMIN ACCESS</h1>
          <p className="text-center text-xs text-muted-foreground mt-1 tracking-widest">PAVILION GATE</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4 mt-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button onClick={() => handle("in")} disabled={loading} className="w-full">Sign In</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 mt-4">
              <div><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <Button onClick={() => handle("up")} disabled={loading} className="w-full">Create Account</Button>
              <p className="text-xs text-muted-foreground text-center">After signup, ask an existing admin to grant you access.</p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
