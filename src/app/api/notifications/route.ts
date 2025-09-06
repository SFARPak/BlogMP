import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false })
      },
      orderBy: {
        createdAt: "desc"
      },
      take: limit,
      skip: offset
    })

    // Get total count
    const totalCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        ...(unreadOnly && { read: false })
      }
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false
      }
    })

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        unread: unreadCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, notificationId } = await request.json()

    if (action === "markAsRead" && notificationId) {
      // Mark specific notification as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: "Notification marked as read"
      })

    } else if (action === "markAllAsRead") {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: { read: true }
      })

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read"
      })

    } else {
      return NextResponse.json(
        { error: "Invalid action or missing notificationId" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Update notifications error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
