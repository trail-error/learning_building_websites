import { compare, hash } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import { cookies } from "next/headers"
import prisma from "@/lib/db"
import type { UserRole } from "@/contexts/auth-context"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const TOKEN_EXPIRY = "7d" // 7 days

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function createToken(userId: string): Promise<string> {
  // Create JWT token
  const token = sign({ userId }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  })

  // Calculate expiry date
  const expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 7) // 7 days from now

  // Store token in database
  await prisma.token.create({
    data: {
      token,
      userId,
      expiresAt: expiryDate,
    },
  })

  return token
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    // Verify JWT
    const decoded = verify(token, JWT_SECRET) as { userId: string }

    // Check if token exists in database and is not expired
    const tokenRecord = await prisma.token.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return null
    }

    return { userId: decoded.userId }
  } catch (error) {
    return null
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  (await cookies()).set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function removeAuthCookie(): Promise<void> {
  (await cookies()).delete("auth_token")
}

export async function getAuthToken(): Promise<string | undefined> {
  return (await cookies()).get("auth_token")?.value
}

export async function getCurrentUser() {
  const token = await getAuthToken()

  if (!token) {
    return null
  }

  const verified = await verifyToken(token)

  if (!verified) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: verified.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
    })
    return { success: true, user }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { success: false, message: "Failed to update user role" }
  }
}

export async function getAllUsers(page = 1, pageSize = 10) {
  try {
    const totalCount = await prisma.user.count()

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        email: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    }
  }
}

export const authOptions = {}
