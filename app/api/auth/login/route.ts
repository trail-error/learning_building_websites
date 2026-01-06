import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create token
    const token = await createToken(user.id)

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role:user.role
      },
    })
  } catch (error) {
    console.error("Login error:", JSON.stringify(error))
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
