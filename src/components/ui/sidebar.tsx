"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  MessageSquare,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Navigation Items
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tours", label: "Tours", icon: Map },
  { href: "/support", label: "Support-Tickets", icon: BookOpen },
  { href: "/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href:"/feedbacks", label:"Feedbacks",icon:MessageSquarePlus},
  { href: "/settings", label: "Settings", icon: Settings },
];

// Sidebar Context
export const SidebarContext = React.createContext<{
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

// Sidebar Provider
export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  return (
    <SidebarContext.Provider value={{ isExpanded, setIsExpanded }}>
      {children}
    </SidebarContext.Provider>
  );
};

// Sidebar Component
export function Sidebar() {
  const pathname = usePathname();
  const context = React.useContext(SidebarContext);
  const [isMobile, setIsMobile] = React.useState(false);

  if (!context) {
    throw new Error("Sidebar must be used within a SidebarProvider");
  }

  const { isExpanded, setIsExpanded } = context;

  // Track screen size
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // Tailwind's `sm` breakpoint is 640px
    };

    checkScreenSize(); // Check once when component mounts
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <aside
      className={cn(
        "bg-gray-800 text-white transition-all duration-300 ease-in-out h-full",
        isExpanded ? "w-48" : "w-20"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header with Toggle Button */}
        <div className="p-4">
        {!(isMobile && !isExpanded) && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsExpanded(!isExpanded)}
    className="mb-6 w-full flex justify-end"
  >
    {isExpanded ? (isMobile ? <ChevronRight /> : <ChevronLeft />) : <ChevronRight />}
  </Button>
)}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-centern justify-center md:justify-normal space-x-2 p-2 rounded-lg hover:bg-gray-700",
                    pathname === item.href && "bg-gray-700",
                    !isExpanded && "justify-center"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className={cn(isExpanded ? "hidden sm:block" : "hidden")}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

// Additional Sidebar Components (Optional)
export const SidebarContent = () => null;
export const SidebarFooter = () => null;
export const SidebarGroup = () => null;
export const SidebarGroupAction = () => null;
export const SidebarGroupContent = () => null;
export const SidebarGroupLabel = () => null;
export const SidebarHeader = () => null;
export const SidebarInput = () => null;
export const SidebarInset = () => null;
export const SidebarMenu = () => null;
export const SidebarMenuAction = () => null;
export const SidebarMenuBadge = () => null;
export const SidebarMenuButton = () => null;
export const SidebarMenuItem = () => null;
export const SidebarMenuSkeleton = () => null;
export const SidebarMenuSub = () => null;
export const SidebarMenuSubButton = () => null;
export const SidebarMenuSubItem = () => null;
export const SidebarRail = () => null;
export const SidebarSeparator = () => null;
export const SidebarTrigger = () => null;
