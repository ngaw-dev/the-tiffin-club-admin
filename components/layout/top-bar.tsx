// components/layout/top-bar.tsx
"use client";

// Top bar: sidebar trigger, search, notifications, user menu with real session + logout.

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SearchInput } from "@/components/amolsw/search-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";import { SidebarTrigger } from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { clearSession, loadSession, type SessionUser } from "@/lib/session";

export function TopBar() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(loadSession()?.user ?? null);
  }, []);

  async function logout() {
    try {
      // Best-effort: delete the server token; local session clears regardless.
      await api.post("/logout");
    } catch {
      // ignore — token may already be invalid
    }
    clearSession();
    router.replace("/login");
  }

  const initial = (user?.name ?? "A").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="min-h-11 min-w-11" />
      <Separator orientation="vertical" className="data-vertical:h-4 data-vertical:self-auto" />
      <SearchInput placeholder="Search" aria-label="Search" className="max-w-sm flex-1" />
      <div className="ml-auto flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Notifications"
            >
              <Bell />
              <span
                className="bg-destructive absolute top-2 right-2 size-2 rounded-full"
                aria-hidden
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="min-h-11 gap-2 px-2" aria-label="Account menu">
              <Avatar className="size-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm sm:inline">{user?.name ?? "Admin"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Signed in as {user?.name ?? "Admin"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
