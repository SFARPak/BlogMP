import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    // Check if post exists and is premium
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        isPremium: true,
        price: true,
        authorId: true,
        purchases: true
      }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (!post.isPremium || !post.price) {
      return NextResponse.json({ error: "Post is not premium" }, { status: 400 })
    }

    // Check if user already purchased this post
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    // Check if user is the author
    if (post.authorId === session.user.id) {
      return NextResponse.json({ error: "Cannot purchase your own post" }, { status: 400 })
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        userId: session.user.id,
        postId: postId,
        amount: post.price,
        status: "COMPLETED" // In a real app, this would be handled by payment processor
      }
    })

    // Update post purchase count and revenue
    await prisma.post.update({
      where: { id: postId },
      data: {
        purchases: { increment: 1 },
        revenue: { increment: post.price }
      }
    })

    return NextResponse.json({
      success: true,
      purchase: purchase
    })

  } catch (error) {
    console.error("Purchase error:", error)
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
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      )
    }

    // Check if user has purchased this post
    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    return NextResponse.json({
      hasAccess: !!purchase
    })

  } catch (error) {
    console.error("Purchase check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
