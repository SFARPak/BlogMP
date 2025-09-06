import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const role = searchParams.get("role")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (role) {
      where.role = role
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              reactions: true
            }
          }
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, action } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    if (action === "ban") {
      // In a real implementation, you'd add a banned field to the User model
      // For now, we'll just update the role to indicate suspension
      await prisma.user.update({
        where: { id: userId },
        data: { role: "READER" } // Temporarily set to READER, in real app you'd have BANNED status
      })

      return NextResponse.json({ message: "User banned successfully" })
    }

    if (role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role }
      })

      return NextResponse.json({ message: "User role updated successfully" })
    }

    return NextResponse.json(
      { error: "Invalid action or role" },
      { status: 400 }
    )

  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}
