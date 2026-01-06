"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Notification {
  id: string
  message: string
  createdAt: string
  read: boolean
  podId?: string
  logIssueId?: string
  createdByEmail: string
}

export function NotificationBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showMyLogIssues, setShowMyLogIssues] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/notifications?page=${page}&showMyLogIssues=${showMyLogIssues}`)
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
          setTotalPages(data.totalPages)
        }
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()

    // Set up polling for new notifications every 30 seconds
    // const interval = setInterval(fetchNotifications, 30000)

    // return () => clearInterval(interval)
  }, [user, page, showMyLogIssues])

  // Mark notifications as read when the popover is opened
  useEffect(() => {
    if (open && unreadCount > 0) {
      markVisibleAsRead()
    }
  }, [open, unreadCount])

  const markVisibleAsRead = async () => {
    try {
      // Get IDs of visible unread notifications
      const unreadIds = notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification.id)

      if (unreadIds.length === 0) return

      await fetch("/api/notifications/mark-visible", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: unreadIds }),
      })

      // Update local state
      setNotifications((prev) =>
        prev.map((notification) =>
          unreadIds.includes(notification.id) ? { ...notification, read: true } : notification,
        ),
      )

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - unreadIds.length))
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
      })

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  if (!user) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {["ADMIN","SUPER_ADMIN"].includes(user.role)? <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="myLogIssues" 
                checked={showMyLogIssues}
                onCheckedChange={(checked) => {
                  setShowMyLogIssues(checked as boolean)
                  setPage(1) // Reset to first page when filter changes
                }}
              />
              <Label htmlFor="myLogIssues" className="text-sm">My Log Issues</Label>
            </div>
            {/* {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )} */}
          </div>:null}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          <>
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 ${notification.read ? "" : "bg-muted/50"}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <p className="text-sm">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>From: {notification.createdByEmail}</span>
                          <span>•</span>
                          <span>{formatDate(notification.createdAt)}</span>
                        </div>
                      </div>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex items-center justify-between p-2 border-t">
              <Button variant="ghost" size="sm" onClick={handlePrevPage} disabled={page === 1 || loading}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button variant="ghost" size="sm" onClick={handleNextPage} disabled={page === totalPages || loading}>
                Next
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
