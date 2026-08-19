"use client";

import {
  LayoutDashboard,
  CalendarDays,
  Image,
  FileText,
  Users,
  Settings,
  LogOut,
  BarChart3,
  Bell,
  IndianRupee,
  ChevronRight,
  PenSquare, // <-- NEW
  MessageSquare,
  GalleryHorizontal,

  FolderOpen,
  Trash2,
  HandHeart,
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Donations", url: "/admin/donations", icon: IndianRupee },
];

const contentItems = [
  { title: "Hero Banners", url: "/admin/banners", icon: GalleryHorizontal },
  { title: "Events", url: "/admin/events", icon: CalendarDays },
  { title: "Important Dates", url: "/admin/important-dates", icon: CalendarDays },
  { title: "Gallery", url: "/admin/gallery", icon: Image },
  { title: "Media Library", url: "/admin/media", icon: FolderOpen },
  { title: "Festivals", url: "/admin/festivals", icon: Image },
  { title: "Blogs", url: "/admin/blogs", icon: PenSquare }, // <-- NEW
  { title: "Pending Deletions", url: "/admin/blogs/deletion-requests", icon: Trash2 },
  { title: "Content", url: "/admin/content", icon: FileText },
];

const systemItems = [
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Devotees", url: "/admin/devotees", icon: Users },
  { title: "Volunteers", url: "/admin/volunteers", icon: HandHeart },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (url: string) =>
    url === "/admin" ? pathname === "/admin" : pathname.startsWith(url);

  const renderGroup = (label: string, items: typeof mainItems) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 font-semibold mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 hover:bg-primary/8 ${
                      active
                        ? "bg-primary/12 text-primary font-semibold shadow-sm"
                        : "text-foreground/80"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                    {!collapsed && active && <ChevronRight className="h-3 w-3 opacity-70" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r bg-card">
      <SidebarContent className="px-2 pt-4 pb-2">
        {!collapsed && (
          <div className="px-3 mb-4 flex items-center gap-2">
            <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center">
              <NextImage
                src="/assets/logo.png"
                alt="HKM"
                width={28}
                height={28}
                className="rounded"
                onError={(e: any) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold">ISKCON Kakinada</div>
              <div className="text-[10px] text-muted-foreground">Admin Panel</div>
            </div>
          </div>
        )}
        {user?.role === "blogs_admin" ? (
          renderGroup("Blogs", [{ title: "Blogs", url: "/admin/blogs", icon: PenSquare }])
        ) : (
          <>
            {renderGroup("Overview", mainItems)}
            <Separator className="my-2" />
            {renderGroup("Content", contentItems)}
            <Separator className="my-2" />
            {renderGroup("System", systemItems)}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        {!collapsed && user && (
          <div className="px-2 py-2 mb-1">
            <div className="text-xs font-semibold truncate">{user.email}</div>
            <div className="text-[10px] text-muted-foreground">Admin</div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5 mr-2" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
