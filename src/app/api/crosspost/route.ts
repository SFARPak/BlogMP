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

    const { postId, platforms } = await request.json()

    if (!postId || !platforms || !Array.isArray(platforms)) {
      return NextResponse.json(
        { error: "Missing required fields: postId and platforms" },
        { status: 400 }
      )
    }

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true }
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const results = []

    // Process each platform
    for (const platform of platforms) {
      try {
        let result

        switch (platform) {
          case "ghost":
            result = await publishToGhost(post)
            break
          case "wordpress":
            result = await publishToWordPress(post)
            break
          case "blogger":
            result = await publishToBlogger(post)
            break
          case "medium":
            result = await publishToMedium(post)
            break
          default:
            result = { success: false, error: "Unsupported platform" }
        }

        // Create cross-post record
        await prisma.crossPost.create({
          data: {
            postId: post.id,
            userId: session.user.id,
            platform: platform.toUpperCase() as any,
            externalId: result.externalId || "",
            externalUrl: result.externalUrl || "",
            status: result.success ? "PUBLISHED" : "FAILED"
          }
        })

        results.push({
          platform,
          success: result.success,
          externalUrl: result.externalUrl || null,
          error: 'error' in result ? result.error : null
        })

      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error)
        results.push({
          platform,
          success: false,
          error: "Internal server error"
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error("Cross-posting error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Platform-specific publishing functions
async function publishToGhost(post: any) {
  try {
    // Ghost Admin API integration
    const ghostUrl = process.env.GHOST_API_URL
    const ghostKey = process.env.GHOST_ADMIN_API_KEY

    if (!ghostUrl || !ghostKey) {
      throw new Error("Ghost API credentials not configured")
    }

    const response = await fetch(`${ghostUrl}/ghost/api/admin/posts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Ghost ${ghostKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        posts: [{
          title: post.title,
          html: post.content,
          status: 'published',
          tags: post.tags?.map((t: any) => ({ name: t.tag.name })) || []
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Ghost API error: ${response.status}`)
    }

    const data = await response.json()
    const ghostPost = data.posts[0]

    return {
      success: true,
      externalId: ghostPost.id,
      externalUrl: `${ghostUrl}/${post.slug}`
    }
  } catch (error) {
    console.error("Ghost publishing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish to Ghost"
    }
  }
}

async function publishToWordPress(post: any) {
  try {
    // WordPress REST API integration
    const wpUrl = process.env.WORDPRESS_API_URL
    const wpUsername = process.env.WORDPRESS_USERNAME
    const wpPassword = process.env.WORDPRESS_APP_PASSWORD

    if (!wpUrl || !wpUsername || !wpPassword) {
      throw new Error("WordPress API credentials not configured")
    }

    // Create authentication token
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64')

    const response = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        status: 'publish',
        slug: post.slug,
        excerpt: post.excerpt,
        categories: [], // You can map tags to categories
        tags: post.tags?.map((t: any) => t.tag.name) || []
      })
    })

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.status}`)
    }

    const wpPost = await response.json()

    return {
      success: true,
      externalId: wpPost.id.toString(),
      externalUrl: wpPost.link
    }
  } catch (error) {
    console.error("WordPress publishing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to publish to WordPress"
    }
  }
}

async function publishToBlogger(post: any) {
  // TODO: Implement Blogger API integration
  console.log("Publishing to Blogger:", post.title)

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    success: true,
    externalId: `blogger-${Date.now()}`,
    externalUrl: `https://blogger-blog.blogspot.com/${post.slug}.html`
  }
}

async function publishToMedium(post: any) {
  // TODO: Implement Medium API integration
  console.log("Publishing to Medium:", post.title)

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  return {
    success: true,
    externalId: `medium-${Date.now()}`,
    externalUrl: `https://medium.com/@username/${post.slug}`
  }
}
