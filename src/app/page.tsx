"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export function HomePage({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = pathname === "/signin" || pathname === "/signup";

  if (isAuthRoute) {
    return <>{children}</>; // Skip layout for auth routes
  }

  return (
    <SidebarProvider >
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-grow overflow-hidden">
          <Header />
          <main className="flex-grow overflow-auto bg-gray-100 p-6">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  )
}

