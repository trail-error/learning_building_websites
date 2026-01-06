"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, ClipboardList, History, Home, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"

  const links = [
    { href: "/main", label: "Active PODs", icon: Home },
    { href: "/history", label: "History", icon: History },
    { href: "/log-issues", label: "Log & Issues", icon: ClipboardList },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
  ]

  if (isAdmin) {
    links.push({ href: "/users", label: "User Management", icon: Users })
    links.push({ href: "/settings", label: "Settings", icon: Settings })
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">POD Inventory</h2>
      </div>
      <nav className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
