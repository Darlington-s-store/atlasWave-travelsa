import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, Users, FileText, PenTool, LogOut, CreditCard, Bot, Package, RotateCcw, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Applications", url: "/admin/applications", icon: FileText },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Shipments", url: "/admin/shipments", icon: Package },
  { title: "Refunds", url: "/admin/refunds", icon: RotateCcw },
  { title: "Chatbot", url: "/admin/chatbot", icon: Bot },
  { title: "Content", url: "/admin/content", icon: PenTool },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { adminLogout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-2">
        {/* Brand */}
        <div className="px-4 py-5 mb-2">
          {!collapsed ? (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">African Waves</h1>
              <p className="text-[11px] text-sidebar-foreground/60 uppercase tracking-[0.15em] mt-0.5">Admin Portal</p>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-sidebar-accent flex items-center justify-center mx-auto">
              <span className="text-sidebar-foreground font-bold text-sm">AW</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
                      activeClassName="!bg-sidebar-accent !text-sidebar-foreground font-semibold"
                    >
                      <item.icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="text-[13px]">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-[13px]">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
