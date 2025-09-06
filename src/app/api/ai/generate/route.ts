import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, type, context } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json(
        { error: "Prompt and type are required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock responses if no API key
      const generatedContent = await generateMockContent(prompt, type)
      return NextResponse.json({
        success: true,
        content: generatedContent,
        type: type,
        mock: true
      })
    }

    // Fetch user's past posts for context-aware generation
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: session.user.id,
        published: true
      },
      select: {
        title: true,
        content: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Last 10 posts for context
    })

    const generatedContent = await generateAIContent(prompt, type, context, userPosts, session.user.id)

    return NextResponse.json({
      success: true,
      content: generatedContent,
      type: type
    })

  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function generateAIContent(prompt: string, type: string, context?: string, userPosts?: any[], userId?: string) {
  try {
    // Build context from user's past posts
    let userContext = ""
    if (userPosts && userPosts.length > 0) {
      const pastTopics = userPosts.map(post => post.title).join(", ")
      const pastTags = [...new Set(userPosts.flatMap(post => post.tags.map((pt: any) => pt.tag.name)))].join(", ")
      const writingStyle = userPosts.slice(0, 3).map(post => post.content.substring(0, 200)).join(" ")

      userContext = `\n\nUser's writing context:
      - Past topics: ${pastTopics}
      - Common tags: ${pastTags}
      - Writing style sample: ${writingStyle}`
    }

    let systemPrompt = ""
    let userPrompt = prompt + userContext

    switch (type) {
      case "title":
        systemPrompt = `Generate an engaging, SEO-friendly blog post title that matches the user's writing style and follows their topic patterns. Make it compelling and click-worthy.`
        userPrompt = `Create a title for a blog post about: ${prompt}${userContext}`
        break

      case "excerpt":
        systemPrompt = `Generate a concise, engaging excerpt for a blog post that matches the user's writing voice and style. Keep it under 160 characters and make it compelling.`
        userPrompt = `Create an excerpt for a blog post about: ${prompt}${userContext}`
        break

      case "content":
        systemPrompt = `Generate a comprehensive blog post in Markdown format that matches the user's writing style, tone, and topic expertise. Include:
        - Engaging introduction in the user's voice
        - Well-structured sections with headers
        - Practical examples and code snippets where relevant
        - Best practices and tips consistent with user's past content
        - Conclusion with key takeaways
        - SEO-friendly structure`
        userPrompt = `Write a detailed blog post about: ${prompt}${userContext}`
        break

      case "tags":
        systemPrompt = `Generate relevant tags for a blog post based on the user's past tagging patterns and content style. Return as a JSON array of strings.`
        userPrompt = `Generate SEO-friendly tags for a blog post about: ${prompt}${userContext}`
        break

      case "seo-description":
        systemPrompt = `Generate an SEO meta description that matches the user's content style and includes relevant keywords from their past posts. Keep it under 160 characters.`
        userPrompt = `Create a meta description for: ${prompt}${userContext}`
        break

      case "keywords":
        systemPrompt = `Generate SEO keywords based on the user's content patterns and past successful topics. Return as a JSON array of relevant keywords and phrases.`
        userPrompt = `Generate SEO keywords for: ${prompt}${userContext}`
        break

      default:
        systemPrompt = "Generate helpful content based on the user's request and their past writing patterns."
        break
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: type === "content" ? 2000 : 500,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content?.trim()

    if (!content) {
      throw new Error("No content generated")
    }

    // For tags and keywords, ensure JSON format
    if (type === "tags" || type === "keywords") {
      try {
        return JSON.parse(content)
      } catch {
        // If JSON parsing fails, split by commas and clean up
        return content.split(",").map((tag: string) => tag.trim().toLowerCase())
      }
    }

    return content

  } catch (error) {
    console.error("OpenAI API error:", error)
    throw new Error("Failed to generate AI content")
  }
}

async function generateMockContent(prompt: string, type: string) {
  // Simulate AI content generation delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  switch (type) {
    case "title":
      return `The Ultimate Guide to ${prompt}: Best Practices and Implementation`

    case "excerpt":
      return `Discover everything you need to know about ${prompt}. This comprehensive guide covers the fundamentals, best practices, and real-world applications to help you master this essential skill.`

    case "content":
      return `# ${prompt}

## Introduction

Welcome to this comprehensive guide on ${prompt}. Whether you're just getting started or looking to deepen your expertise, this article will provide you with valuable insights and practical knowledge.

## Key Concepts

### Understanding the Basics
${prompt} is a fundamental concept that plays a crucial role in modern development practices. At its core, it involves...

### Best Practices
When working with ${prompt}, it's important to follow established best practices:

1. **Start with the fundamentals** - Ensure you have a solid understanding of the basic concepts
2. **Follow conventions** - Use industry-standard naming and structure
3. **Test thoroughly** - Implement comprehensive testing strategies
4. **Document your work** - Maintain clear and concise documentation

## Implementation

### Step-by-Step Guide

#### Step 1: Setup
Begin by setting up your development environment...

#### Step 2: Configuration
Configure your settings according to your project requirements...

#### Step 3: Implementation
Implement the core functionality...

#### Step 4: Testing
Test your implementation thoroughly...

## Conclusion

${prompt} is a powerful tool that can significantly improve your development workflow. By following the practices outlined in this guide, you'll be well-equipped to leverage its full potential.

Remember to stay updated with the latest developments and continuously refine your approach. Happy coding! 🚀`

    case "tags":
      return ["javascript", "web-development", "tutorial", "best-practices", prompt.toLowerCase()]

    case "seo-description":
      return `Learn everything about ${prompt} with this comprehensive guide covering best practices, implementation, and real-world examples.`

    case "keywords":
      return [prompt, "tutorial", "guide", "best practices", "implementation"]

    default:
      return `Generated content for ${prompt} of type ${type}`
  }
}
