"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "REGULAR" | "ADMIN" | "PRIORITY" | "SUPER_ADMIN"

export type User = {
  id: string
  email: string
  name?: string
  role: UserRole
}

type AuthContextType = {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name?: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
  hasPermission: (permission: "create_pod" | "edit_priority" | "delete_pod" | "manage_users" | "edit_pod" | "move_pod" | "import_excel" | "autofill_excel" | "duplicate_pod" | "toggle_visibility") => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        // console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  console.log("user is",user)

  const login = async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }
     
        setUser(data.user)

      
      router.push("/main")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, name?: string) => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      setUser(data.user)
      router.push("/main")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed")
      console.error("Signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Logout failed")
      }

      setUser(null)
      router.push("/login")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Logout failed")
      console.error("Logout error:", error)
    } finally {
      setLoading(false)
    }
  }

  console.log("user",user?.role)

  const hasPermission = (permission: "create_pod" | "edit_priority" | "delete_pod" | "manage_users" | "edit_pod" | "move_pod" | "import_excel" | "autofill_excel" | "duplicate_pod" | "toggle_visibility") => {
    if (!user) return false

    switch (permission) {
      case "create_pod":
        return ["ADMIN", "PRIORITY", "SUPER_ADMIN"].includes(user.role)
      case "edit_priority":
        return ["PRIORITY", "SUPER_ADMIN"].includes(user.role)
      case "delete_pod":
        return ["ADMIN", "SUPER_ADMIN"].includes(user.role)
      case "move_pod":
        return ["ADMIN","SUPER_ADMIN","REGULAR"].includes(user.role)
      case "edit_pod":
        return ["SUPER_ADMIN","REGULAR","ADMIN"].includes(user.role)
      case "manage_users":
        return user.role === "SUPER_ADMIN"
      case "import_excel":
        return user.role === "SUPER_ADMIN"
      case "autofill_excel":
        return user.role === "SUPER_ADMIN"
      case "duplicate_pod":
        return ["ADMIN", "SUPER_ADMIN"].includes(user.role)
      case "toggle_visibility":
        return user.role === "SUPER_ADMIN"
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, error, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
