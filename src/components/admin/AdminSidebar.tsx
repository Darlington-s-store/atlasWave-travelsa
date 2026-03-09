import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Users, FileText, PenTool, LogOut, CreditCard, Bot, Package,
  RotateCcw, BarChart3, Plane, Hotel, Tag, Globe, Briefcase, GraduationCap,
  Ship, Calendar, Star, Bell, Newspaper, Shield, Settings, Lock, MapPin, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpeg";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Users & Roles",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Roles & Permissions", url: "/admin/roles", icon: Shield },
    ],
  },
  {
    label: "Travel & Bookings",
    items: [
      { title: "Flight Bookings", url: "/admin/flights", icon: Plane },
      { title: "Hotel Bookings", url: "/admin/hotels", icon: Hotel },
      { title: "Deals & Packages", url: "/admin/deals", icon: Tag },
    ],
  },
  {
    label: "Immigration",
    items: [
      { title: "Visa Applications", url: "/admin/applications", icon: Globe },
      { title: "Work Permits", url: "/admin/work-permits", icon: Briefcase },
      { title: "Credential Evals", url: "/admin/credentials", icon: GraduationCap },
    ],
  },
  {
    label: "Logistics",
    items: [
      { title: "Shipments", url: "/admin/shipments", icon: Package },
      { title: "Customs", url: "/admin/customs", icon: MapPin },
    ],
  },
  {
    label: "Services",
    items: [
      { title: "Consultations", url: "/admin/consultations", icon: Calendar },
      { title: "Documentation", url: "/admin/documentation", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Payments", url: "/admin/payments", icon: CreditCard },
      { title: "Refunds", url: "/admin/refunds", icon: RotateCcw },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Reviews", url: "/admin/reviews", icon: Star },
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Chatbot / Support", url: "/admin/chatbot", icon: Bot },
    ],
  },
  {
    label: "Content & Reports",
    items: [
      { title: "Content / CMS", url: "/admin/content", icon: PenTool },
      { title: "Videos", url: "/admin/videos", icon: Video },
      { title: "Blog / News", url: "/admin/blog", icon: Newspaper },
      { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Security", url: "/admin/security", icon: Lock },
      { title: "Settings", url: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { adminLogout } = useAdmin();
  const navigate = useNavigate();

  const handleNavSelection = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    adminLogout();
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-2 overflow-y-auto">
        {/* Brand */}
        <div className="mb-1 px-4 py-5 pr-12 md:pr-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-sidebar-border flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={logo}
                  alt="AtlastWave Travel and Tour"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-sidebar-foreground tracking-tight leading-none">AtlastWave Travel and Tour</h1>
                <p className="text-[10px] text-sidebar-foreground/55 uppercase tracking-[0.18em] mt-1">
                  Admin Portal
                </p>
              </div>
            </div>
          ) : (
            <img
              src={logo}
              alt="AtlastWave Travel and Tour"
              className="w-8 h-8 rounded-lg object-cover mx-auto border border-sidebar-border bg-white"
            />
          )}
        </div>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-4 text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/40 font-bold mb-0.5">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5 px-2">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-9">
                      <NavLink
                        to={item.url}
                        end={item.url === "/admin"}
                        onClick={handleNavSelection}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all text-[13px]"
                        activeClassName="!bg-sidebar-accent !text-sidebar-foreground font-semibold"
                      >
                        <item.icon className="h-[16px] w-[16px] shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
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
