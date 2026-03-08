import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Input } from "@/components/ui/input";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, admin } = useAdmin();

  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(210,20%,97%)]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center justify-between border-b border-border bg-background px-6 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-1" />
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search applications, users, or IDs..."
                  className="pl-9 w-[320px] h-9 bg-muted/50 border-transparent focus:border-border text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="w-[18px] h-[18px] text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
              </Button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                  {admin?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-foreground leading-tight">{admin?.name}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight capitalize">{admin?.role?.replace("-", " ")}</p>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-5 md:p-7 lg:p-8 overflow-auto">
            {children}
          </main>
          <footer className="py-3 px-6 border-t border-border bg-background">
            <p className="text-[11px] text-muted-foreground text-center">
              © 2024 African Waves Logistics & Immigration Admin. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
