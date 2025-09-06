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

    const { postId, type } = await request.json()

    if (!postId || !type) {
      return NextResponse.json(
        { error: "Post ID and reaction type are required" },
        { status: 400 }
      )
    }

    // Validate reaction type
    const validTypes = ["HEART", "CLAP", "FIRE", "ROCKET", "EYES"]
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      )
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if user already reacted with this type
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId_type: {
          postId,
          userId: session.user.id,
          type: type as any
        }
      }
    })

    if (existingReaction) {
      // Remove the reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id }
      })

      return NextResponse.json({
        success: true,
        action: "removed",
        type
      })
    } else {
      // Add the reaction
      await prisma.reaction.create({
        data: {
          postId,
          userId: session.user.id,
          type: type as any
        }
      })

      return NextResponse.json({
        success: true,
        action: "added",
        type
      })
    }

  } catch (error) {
    console.error("Reaction error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Get reaction counts
    const reactionCounts = await prisma.reaction.groupBy({
      by: ["type"],
      where: { postId },
      _count: {
        type: true
      }
    })

    // Get user's reactions if authenticated
    let userReactions: { type: string }[] = []
    if (userId) {
      userReactions = await prisma.reaction.findMany({
        where: {
          postId,
          userId
        },
        select: {
          type: true
        }
      })
    }

    // Format the response
    const counts = {
      HEART: 0,
      CLAP: 0,
      FIRE: 0,
      ROCKET: 0,
      EYES: 0
    }

    reactionCounts.forEach(count => {
      counts[count.type as keyof typeof counts] = count._count.type
    })

    const userReactionTypes = userReactions.map(r => r.type)

    return NextResponse.json({
      counts,
      userReactions: userReactionTypes
    })

  } catch (error) {
    console.error("Get reactions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
