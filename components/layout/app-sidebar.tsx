"use client";

import { CalendarClock, LayoutDashboard, Settings, Soup, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TopBar } from "@/components/layout/top-bar";

const sections = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Menu", href: "/menu", icon: Soup },
  { title: "Orders", href: "/orders", icon: CalendarClock },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-14 items-center gap-2 px-2">
            <span className="bg-primary flex size-8 items-center justify-center rounded-lg font-heading text-sm font-semibold text-primary-foreground">
              TC
            </span>
            <div className="grid leading-tight">
              <span className="font-heading text-sm font-semibold">The Tiffin Club</span>
              <span className="text-muted-foreground text-xs">Admin console</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs tracking-wider uppercase">
              Sections
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sections.map((section) => (
                  <SidebarMenuItem key={section.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={section.title}
                      isActive={isActive(pathname, section.href)}
                      className="data-active:bg-primary/10 data-active:text-primary min-h-11 text-sm"
                    >
                      <Link href={section.href}>
                        <section.icon />
                        <span>{section.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <TopBar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
