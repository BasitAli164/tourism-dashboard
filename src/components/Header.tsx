// components/Header.tsx
"use client";

import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationComponent from "@/components/Notification";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";


interface HeaderProps {
  className?: string;
}

export function Header({ className = "" }: HeaderProps) {
  const router = useRouter();

const handleLogOut = async () => {
  await signOut({ redirect: false }); // clears session cookie
  router.push("/signin");            // navigate to signin page
};


  return (
    <header
      className={`bg-white shadow-md py-2 sm:py-4 px-6 flex justify-between items-center ${className}`}
    >
      <h1 className="text-lg sm:text-2xl font-bold">Mountain Travels Pakistan</h1>
      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <NotificationComponent />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogOut}>
              Log-out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
