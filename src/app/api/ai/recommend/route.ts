import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") || "posts"

    // Get user's reading history and preferences
    const userHistory = await getUserReadingHistory(session.user.id)
    const userPreferences = await getUserPreferences(session.user.id)

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to basic recommendations
      const recommendations = await generateBasicRecommendations(userHistory, userPreferences, limit, type)
      return NextResponse.json({
        success: true,
        recommendations,
        mock: true
      })
    }

    const recommendations = await generateAIRecommendations(userHistory, userPreferences, limit, type)

    return NextResponse.json({
      success: true,
      recommendations
    })

  } catch (error) {
    console.error("AI recommendations error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function getUserReadingHistory(userId: string) {
  // Get user's recent interactions
  const recentReactions = await prisma.reaction.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    },
    include: {
      post: {
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          author: {
            select: {
              name: true
            }
          }
        }
      }
    },
    take: 50
  })

  const recentBookmarks = await prisma.bookmark.findMany({
    where: {
      userId: userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    },
    include: {
      post: {
        include: {
          tags: {
            include: {
              tag: true
            }
          },
          author: {
            select: {
              name: true
            }
          }
        }
      }
    },
    take: 20
  })

  return {
    reactions: recentReactions,
    bookmarks: recentBookmarks
  }
}

async function getUserPreferences(userId: string) {
  // Get user's followed authors and preferred tags
  const following = await prisma.follow.findMany({
    where: {
      followerId: userId
    },
    include: {
      following: {
        select: {
          id: true,
          name: true
        }
      }
    }
  })

  // Get most reacted tags from user's history
  const userReactions = await prisma.reaction.findMany({
    where: {
      userId: userId
    },
    include: {
      post: {
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      }
    }
  })

  const tagFrequency: { [key: string]: number } = {}
  userReactions.forEach(reaction => {
    reaction.post.tags?.forEach(postTag => {
      tagFrequency[postTag.tag.name] = (tagFrequency[postTag.tag.name] || 0) + 1
    })
  })

  const preferredTags = Object.entries(tagFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag)

  return {
    following: following.map(f => f.following),
    preferredTags
  }
}

async function generateAIRecommendations(userHistory: any, userPreferences: any, limit: number, type: string) {
  try {
    const systemPrompt = `Generate personalized content recommendations based on user's reading history and preferences.
    Analyze patterns in their interactions and suggest relevant content they might enjoy.

    Consider:
    - Topics they've engaged with recently
    - Authors they follow
    - Tags they've shown interest in
    - Types of content they prefer
    - Reading patterns and frequency

    Return recommendations as a JSON array of objects with this structure:
    [{
      "title": "Suggested post title",
      "reason": "Why this is recommended",
      "relevanceScore": number (0-1),
      "tags": ["relevant", "tags"],
      "type": "post" | "author" | "topic"
    }]`

    const userContext = `
User Preferences:
- Following: ${userPreferences.following.map((f: any) => f.name).join(', ') || 'None'}
- Preferred Tags: ${userPreferences.preferredTags.join(', ') || 'None'}

Recent Activity:
- Reacted to ${userHistory.reactions.length} posts
- Bookmarked ${userHistory.bookmarks.length} posts
- Recent topics: ${[
  ...new Set([
    ...userHistory.reactions.flatMap((r: any) => r.post.tags?.map((t: any) => t.tag.name) || []),
    ...userHistory.bookmarks.flatMap((b: any) => b.post.tags?.map((t: any) => t.tag.name) || [])
  ])
].slice(0, 5).join(', ') || 'None'}
`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Generate ${limit} personalized ${type} recommendations for this user:\n\n${userContext}` }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const recommendationsText = completion.choices[0]?.message?.content?.trim()

    if (!recommendationsText) {
      throw new Error("No recommendations generated")
    }

    try {
      return JSON.parse(recommendationsText)
    } catch (parseError) {
      // If JSON parsing fails, return basic recommendations
      return generateBasicRecommendations(userHistory, userPreferences, limit, type)
    }

  } catch (error) {
    console.error("OpenAI recommendations error:", error)
    return generateBasicRecommendations(userHistory, userPreferences, limit, type)
  }
}

async function generateBasicRecommendations(userHistory: any, userPreferences: any, limit: number, type: string) {
  // Simulate AI recommendations delay
  await new Promise(resolve => setTimeout(resolve, 800))

  const recommendations = []

  // Get popular posts excluding user's own and already interacted with
  const interactedPostIds = [
    ...userHistory.reactions.map((r: any) => r.postId),
    ...userHistory.bookmarks.map((b: any) => b.postId)
  ]

  const popularPosts = await prisma.post.findMany({
    where: {
      published: true,
      authorId: {
        not: userPreferences.following.length > 0 ? { in: userPreferences.following.map((f: any) => f.id) } : undefined
      },
      id: {
        notIn: interactedPostIds
      }
    },
    include: {
      author: {
        select: {
          name: true
        }
      },
      tags: {
        include: {
          tag: true
        }
      },
      _count: {
        select: {
          reactions: true
        }
      }
    },
    orderBy: {
      reactions: {
        _count: "desc"
      }
    },
    take: limit
  })

  // Generate recommendations based on user's preferences
  for (const post of popularPosts) {
    const postTags = post.tags?.map(t => t.tag.name) || []
    const matchingTags = userPreferences.preferredTags.filter((tag: string) =>
      postTags.some((postTag: string) => postTag.toLowerCase().includes(tag.toLowerCase()))
    )

    const relevanceScore = Math.min(1, (matchingTags.length * 0.2) + (post._count.reactions * 0.001) + 0.3)

    recommendations.push({
      title: post.title,
      reason: matchingTags.length > 0
        ? `Based on your interest in: ${matchingTags.slice(0, 2).join(', ')}`
        : `Popular post with ${post._count.reactions} reactions`,
      relevanceScore: Math.round(relevanceScore * 100) / 100,
      tags: postTags.slice(0, 3),
      type: "post",
      postId: post.id
    })
  }

  return recommendations
}
