import {
  createFileRoute,
  Outlet,
  useNavigate,
  Link,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Bell, Search, Loader2 } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

function AppShell() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Checking session…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="max-w-sm rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in to access your workspace.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  const crumb = breadcrumbFor(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="hidden text-xs text-muted-foreground sm:flex sm:items-center sm:gap-1.5">
              <span>Workspace</span>
              <span className="opacity-40">/</span>
              <span className="text-foreground">{crumb}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
                <Search className="h-3.5 w-3.5" />
                <span>Search matters, clients…</span>
                <kbd className="rounded border border-border bg-background px-1 text-[10px]">⌘K</kbd>
              </div>
              <button className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground">
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </header>
          <div className="flex-1 px-4 pb-12 pt-6 sm:px-8">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function breadcrumbFor(p: string) {
  if (p.startsWith("/dashboard")) return "Dashboard";
  if (p.startsWith("/tickets")) return "Tickets";
  if (p.startsWith("/analytics")) return "Analytics";
  if (p.startsWith("/Directory")) return "Directory";
  if (p.startsWith("/profile")) return "Profile";
  if (p.startsWith("/settings")) return "Settings";
  return "Overview";
}