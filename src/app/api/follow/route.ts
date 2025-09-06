import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      )
    }

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (action === "follow") {
      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      })

      if (existingFollow) {
        return NextResponse.json(
          { error: "Already following this user" },
          { status: 400 }
        )
      }

      // Create follow relationship
      await prisma.follow.create({
        data: {
          followerId: session.user.id,
          followingId: userId
        }
      })

      // Update follower counts
      await prisma.profile.updateMany({
        where: { userId: session.user.id },
        data: {
          following: {
            increment: 1
          }
        }
      })

      await prisma.profile.updateMany({
        where: { userId: userId },
        data: {
          followers: {
            increment: 1
          }
        }
      })

      // Create notification
      await prisma.notification.create({
        data: {
          userId: userId,
          type: "FOLLOW",
          title: "New Follower",
          message: `${session.user.name || session.user.email} started following you`,
          data: {
            followerId: session.user.id,
            followerName: session.user.name
          }
        }
      })

      return NextResponse.json({
        success: true,
        action: "followed",
        message: "Successfully followed user"
      })

    } else if (action === "unfollow") {
      // Check if following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId
          }
        }
      })

      if (!existingFollow) {
        return NextResponse.json(
          { error: "Not following this user" },
          { status: 400 }
        )
      }

      // Remove follow relationship
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      })

      // Update follower counts
      await prisma.profile.updateMany({
        where: { userId: session.user.id },
        data: {
          following: {
            decrement: 1
          }
        }
      })

      await prisma.profile.updateMany({
        where: { userId: userId },
        data: {
          followers: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({
        success: true,
        action: "unfollowed",
        message: "Successfully unfollowed user"
      })

    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'follow' or 'unfollow'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Follow error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Check if current user is following the target user
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId
        }
      }
    })

    // Get follower/following counts
    const profile = await prisma.profile.findUnique({
      where: { userId: userId },
      select: {
        followers: true,
        following: true
      }
    })

    return NextResponse.json({
      isFollowing: !!follow,
      followers: profile?.followers || 0,
      following: profile?.following || 0
    })

  } catch (error) {
    console.error("Get follow status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
