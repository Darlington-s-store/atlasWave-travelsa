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
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Users, FileText, PenTool, CreditCard, Bot, Package,
  RotateCcw, BarChart3, Plane, Hotel, Tag, Globe, Briefcase, GraduationCap,
  MapPin, Calendar, Star, Bell, Shield, Video, Map,
} from "lucide-react";
import logo from "@/assets/logo.jpeg";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Applications", url: "/admin/applications", icon: Globe },
  { title: "Chatbot", url: "/admin/chatbot", icon: Bot },
  { title: "CMS", url: "/admin/content", icon: PenTool },
  { title: "Consultations", url: "/admin/consultations", icon: Calendar },
  { title: "Credentials", url: "/admin/credentials", icon: GraduationCap },
  { title: "Customs", url: "/admin/customs", icon: MapPin },
  { title: "Deals", url: "/admin/deals", icon: Tag },
  { title: "Destinations", url: "/admin/destinations", icon: Map },
  { title: "Documentation", url: "/admin/documentation", icon: FileText },
  { title: "Flights", url: "/admin/flights", icon: Plane },
  { title: "Hotels", url: "/admin/hotels", icon: Hotel },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Payments", url: "/admin/payments", icon: CreditCard },
  { title: "Refunds", url: "/admin/refunds", icon: RotateCcw },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
  { title: "Roles & Access", url: "/admin/roles", icon: Shield },
  { title: "Shipments", url: "/admin/shipments", icon: Package },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Videos", url: "/admin/videos", icon: Video },
  { title: "Work Permits", url: "/admin/work-permits", icon: Briefcase },
];

export function AdminSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleNavSelection = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="pt-2 overflow-y-auto">
        <div className="mb-1 px-4 py-5 pr-12 md:pr-4">
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-sidebar-border flex items-center justify-center shrink-0 overflow-hidden">
                <img src={logo} alt="AtlastWave" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="text-[15px] font-bold text-sidebar-foreground tracking-tight leading-none">AtlastWave</h1>
                <p className="text-[10px] text-sidebar-foreground/55 uppercase tracking-[0.18em] mt-1">Admin Portal</p>
              </div>
            </div>
          ) : (
            <img src={logo} alt="AtlastWave" className="w-8 h-8 rounded-lg object-cover mx-auto border border-sidebar-border bg-white" />
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {navItems.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}
