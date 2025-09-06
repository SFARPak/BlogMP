import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { withCache, searchCache, cacheKeys } from "@/lib/cache"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all" // posts, users, tags, all
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      )
    }

    const cacheKey = cacheKeys.search(query, type)

    const searchResults = await withCache(
      searchCache,
      cacheKey,
      () => performSearch(query.trim(), type, limit, offset),
      1000 * 60 * 2 // 2 minutes cache
    )

    return NextResponse.json({
      success: true,
      query: query.trim(),
      type,
      results: searchResults,
      pagination: {
        limit,
        offset,
        hasMore: searchResults.length === limit
      }
    })

  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function performSearch(query: string, type: string, limit: number, offset: number) {
  const searchTerm = `%${query}%`

  switch (type) {
    case "posts":
      return await searchPosts(searchTerm, limit, offset)

    case "users":
      return await searchUsers(searchTerm, limit, offset)

    case "tags":
      return await searchTags(searchTerm, limit, offset)

    case "all":
    default:
      return await searchAll(searchTerm, limit, offset)
  }
}

async function searchPosts(searchTerm: string, limit: number, offset: number) {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: searchTerm.replace(/%/g, '') } },
        { content: { contains: searchTerm.replace(/%/g, '') } },
        { excerpt: { contains: searchTerm.replace(/%/g, '') } },
        {
          tags: {
            some: {
              tag: {
                name: { contains: searchTerm.replace(/%/g, '') }
              }
            }
          }
        }
      ]
    },
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
          tag: true
        }
      },
      _count: {
        select: {
          reactions: true,
          comments: true
        }
      }
    },
    orderBy: {
      reactions: {
        _count: "desc"
      }
    },
    take: limit,
    skip: offset
  })

  return posts.map(post => ({
    id: post.id,
    type: "post",
    title: post.title,
    excerpt: post.excerpt || post.content.substring(0, 150) + "...",
    author: post.author,
    tags: post.tags.map(pt => pt.tag.name),
    stats: {
      reactions: post._count.reactions,
      comments: post._count.comments
    },
    publishedAt: post.publishedAt
  }))
}

async function searchUsers(searchTerm: string, limit: number, offset: number) {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm.replace(/%/g, '') } },
        { email: { contains: searchTerm.replace(/%/g, '') } }
      ]
    },
    include: {
      profile: true,
      _count: {
        select: {
          posts: true,
          followers: true
        }
      }
    },
    take: limit,
    skip: offset
  })

  return users.map(user => ({
    id: user.id,
    type: "user",
    name: user.name,
    email: user.email,
    image: user.image,
    bio: user.profile?.bio,
    stats: {
      posts: user._count.posts,
      followers: user._count.followers
    }
  }))
}

async function searchTags(searchTerm: string, limit: number, offset: number) {
  const tags = await prisma.tag.findMany({
    where: {
      name: { contains: searchTerm.replace(/%/g, '') }
    },
    include: {
      _count: {
        select: {
          posts: true
        }
      }
    },
    orderBy: {
      posts: {
        _count: "desc"
      }
    },
    take: limit,
    skip: offset
  })

  return tags.map(tag => ({
    id: tag.id,
    type: "tag",
    name: tag.name,
    color: tag.color,
    postCount: tag._count.posts
  }))
}

async function searchAll(searchTerm: string, limit: number, offset: number) {
  const results = []

  // Search posts
  const posts = await searchPosts(searchTerm, Math.ceil(limit / 3), 0)
  results.push(...posts.slice(0, Math.ceil(limit / 3)))

  // Search users
  const users = await searchUsers(searchTerm, Math.ceil(limit / 3), 0)
  results.push(...users.slice(0, Math.ceil(limit / 3)))

  // Search tags
  const tags = await searchTags(searchTerm, Math.ceil(limit / 3), 0)
  results.push(...tags.slice(0, Math.ceil(limit / 3)))

  return results.slice(0, limit)
}
