import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, title } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock summary
      const summary = await generateMockSummary(content, title)
      return NextResponse.json({
        success: true,
        summary: summary,
        mock: true
      })
    }

    const summary = await generateSummary(content, title)

    return NextResponse.json({
      success: true,
      summary: summary
    })

  } catch (error) {
    console.error("AI summary error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function generateSummary(content: string, title?: string) {
  try {
    const systemPrompt = `Generate a concise TL;DR summary for a blog post. The summary should:
    - Be 2-3 sentences maximum
    - Capture the main points and key takeaways
    - Be engaging and compelling
    - Use the post's title as context if provided
    - Start with "TL;DR:"`

    const userPrompt = `Generate a TL;DR summary for this blog post:

${title ? `Title: ${title}` : ''}

Content:
${content.substring(0, 2000)}...`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    })

    const summary = completion.choices[0]?.message?.content?.trim()

    if (!summary) {
      throw new Error("No summary generated")
    }

    return summary

  } catch (error) {
    console.error("OpenAI summary error:", error)
    throw new Error("Failed to generate summary")
  }
}

async function generateMockSummary(content: string, title?: string) {
  // Simulate summary generation delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const wordCount = content.split(' ').length
  const titleWords = title ? title.split(' ') : []

  return `TL;DR: This comprehensive ${wordCount > 500 ? 'guide' : 'article'} covers ${titleWords.slice(0, 3).join(' ').toLowerCase() || 'key concepts'} with practical insights and actionable takeaways for developers looking to improve their skills.`
}
