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

    const { postId, action } = await request.json()

    if (!postId || !action) {
      return NextResponse.json(
        { error: "Post ID and action are required" },
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

    if (action === "bookmark") {
      // Check if already bookmarked
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: session.user.id
          }
        }
      })

      if (existingBookmark) {
        return NextResponse.json(
          { error: "Post already bookmarked" },
          { status: 400 }
        )
      }

      // Create bookmark
      await prisma.bookmark.create({
        data: {
          postId: postId,
          userId: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        action: "bookmarked",
        message: "Post bookmarked successfully"
      })

    } else if (action === "unbookmark") {
      // Check if bookmarked
      const existingBookmark = await prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: session.user.id
          }
        }
      })

      if (!existingBookmark) {
        return NextResponse.json(
          { error: "Post not bookmarked" },
          { status: 400 }
        )
      }

      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      })

      return NextResponse.json({
        success: true,
        action: "unbookmarked",
        message: "Post unbookmarked successfully"
      })

    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'bookmark' or 'unbookmark'" },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error("Bookmark error:", error)
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

    if (postId) {
      // Check if specific post is bookmarked
      const bookmark = await prisma.bookmark.findUnique({
        where: {
          postId_userId: {
            postId: postId,
            userId: session.user.id
          }
        }
      })

      return NextResponse.json({
        isBookmarked: !!bookmark
      })
    } else {
      // Get all user's bookmarks
      const bookmarks = await prisma.bookmark.findMany({
        where: {
          userId: session.user.id
        },
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              tags: {
                include: {
                  tag: {
                    select: {
                      name: true
                    }
                  }
                }
              },
              reactions: {
                select: {
                  type: true
                }
              },
              _count: {
                select: {
                  comments: true,
                  reactions: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      })

      // Transform data to match PostCard interface
      const bookmarkedPosts = bookmarks.map(bookmark => {
        const post = bookmark.post
        // Count reactions by type
        const reactionCounts = { heart: 0, clap: 0, fire: 0 }
        post.reactions?.forEach((reaction: any) => {
          if (reaction.type === 'HEART') reactionCounts.heart++
          else if (reaction.type === 'CLAP') reactionCounts.clap++
          else if (reaction.type === 'FIRE') reactionCounts.fire++
        })

        return {
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || post.content.substring(0, 150) + '...',
          author: {
            name: post.author.name || 'Anonymous',
            avatar: post.author.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          },
          publishedAt: post.publishedAt || post.createdAt,
          readingTime: post.readingTime || 5,
          tags: post.tags?.map((t: any) => t.tag.name) || [],
          reactions: reactionCounts
        }
      })

      return NextResponse.json({
        bookmarks: bookmarkedPosts
      })
    }

  } catch (error) {
    console.error("Get bookmarks error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
