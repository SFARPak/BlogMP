import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { postCache, cacheKeys } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const tag = searchParams.get("tag")
    const author = searchParams.get("author")

    // Create cache key based on query parameters
    const cacheKey = cacheKeys.posts(page, limit) +
      (tag ? `:tag:${tag}` : '') +
      (author ? `:author:${author}` : '')

    // Use cached response if available
    const cachedResult = postCache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      published: true
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag
          }
        }
      }
    }

    if (author) {
      where.authorId = author
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
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
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          },
          reactions: {
            select: {
              type: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }),
      prisma.post.count({ where })
    ])

    const result = {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    // Cache the result for 5 minutes
    postCache.set(cacheKey, result, 1000 * 60 * 5)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Posts fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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

    const { title, content, excerpt, tags, published } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Calculate reading time (roughly 200 words per minute)
    const wordCount = content.split(/\s+/).filter((word: string) => word.length > 0).length
    const readingTime = Math.ceil(wordCount / 200)

    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        published: published || false,
        publishedAt: published ? new Date() : null,
        readingTime,
        wordCount,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') }
        })

        // Create post-tag relationship
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id
          }
        })
      }
    }

    // Clear cache for posts
    postCache.clear()

    return NextResponse.json({
      success: true,
      post
    })

  } catch (error) {
    console.error("Post creation error:", error)
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    )
  }
}
