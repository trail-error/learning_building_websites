"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import { ThemeToggle } from "./theme-toogle"
import { ArrowLeft } from "lucide-react"

interface HeaderProps {
  title: string
  onBack?: () => void
}

export function Header({ title, onBack }: HeaderProps) {
  const { user, logout } = useAuth()


  return (
    <header className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        {onBack && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBack}
            title="Back to main page"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <ThemeToggle />
        {user && <NotificationBell />}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
