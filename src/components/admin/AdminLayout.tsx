import { ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Bell, Search, LogOut, Settings } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, admin, loading, adminLogout } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[hsl(210,20%,97%)]">
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background px-3 py-3 sm:px-4 md:px-6 md:py-0">
            <div className="flex min-h-8 items-center justify-between gap-3 md:h-16">
              <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <SidebarTrigger className="shrink-0" />
                <div className="min-w-0 md:hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    AtlasWave
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">Admin Dashboard</p>
                </div>
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search applications, users, or IDs..."
                    className="h-9 w-[280px] border-transparent bg-muted/50 pl-9 text-sm focus:border-border lg:w-[320px]"
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 md:gap-2">
                <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-9 md:w-9">
                  <Bell className="h-4 w-4 text-muted-foreground md:h-[18px] md:w-[18px]" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive md:right-1.5 md:top-1.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9" onClick={() => navigate("/admin/settings")}>
                  <Settings className="h-4 w-4 text-muted-foreground md:h-[18px] md:w-[18px]" />
                </Button>
                <div className="flex items-center gap-2 border-l border-border pl-2 md:gap-2 md:pl-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground md:h-8 md:w-8 md:text-xs">
                    {admin?.name?.charAt(0) || "A"}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold leading-tight text-foreground">{admin?.name}</p>
                    <p className="text-[11px] capitalize leading-tight text-muted-foreground">
                      {admin?.role?.replace("-", " ")}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                </Button>
              </div>
            </div>
            <div className="relative mt-3 md:hidden">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search applications, users, or IDs..."
                className="h-9 border-transparent bg-muted/50 pl-9 text-sm focus:border-border"
              />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-3 sm:p-5 md:p-7 lg:p-8">{children}</main>
          <footer className="border-t border-border bg-background px-4 py-3 md:px-6">
            <p className="text-center text-[11px] text-muted-foreground">
              &copy; 2026 AtlastWave Travel and Tour Admin. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
