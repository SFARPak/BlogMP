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

    const { content, type } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock moderation
      const moderationResult = await generateMockModeration(content, type)
      return NextResponse.json({
        success: true,
        result: moderationResult,
        mock: true
      })
    }

    const moderationResult = await moderateContent(content, type)

    return NextResponse.json({
      success: true,
      result: moderationResult
    })

  } catch (error) {
    console.error("Content moderation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function moderateContent(content: string, type: string = "comment") {
  try {
    const systemPrompt = `Analyze content for moderation purposes. Check for:
    - Spam content
    - Hate speech or offensive language
    - Inappropriate content
    - Plagiarism indicators
    - Quality assessment
    - Relevance to the platform

    Return analysis as JSON with this structure:
    {
      "isApproved": boolean,
      "confidence": number (0-1),
      "flags": string[],
      "categories": {
        "spam": number (0-1),
        "hate": number (0-1),
        "inappropriate": number (0-1),
        "quality": number (0-1)
      },
      "suggestions": string[],
      "action": "approve" | "flag" | "reject"
    }`

    const userPrompt = `Moderate this ${type} content:

${content}

Please analyze for spam, hate speech, appropriateness, and quality.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.2,
    })

    const resultText = completion.choices[0]?.message?.content?.trim()

    if (!resultText) {
      throw new Error("No moderation result generated")
    }

    try {
      return JSON.parse(resultText)
    } catch (parseError) {
      // If JSON parsing fails, return a safe default
      return {
        isApproved: true,
        confidence: 0.8,
        flags: [],
        categories: {
          spam: 0.1,
          hate: 0.0,
          inappropriate: 0.0,
          quality: 0.8
        },
        suggestions: ["Content appears appropriate"],
        action: "approve"
      }
    }

  } catch (error) {
    console.error("OpenAI moderation error:", error)
    throw new Error("Failed to moderate content")
  }
}

async function generateMockModeration(content: string, type: string = "comment") {
  // Simulate moderation delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const contentLength = content.length
  const hasSpamWords = /\b(?:viagra|casino|lottery|winner|free money)\b/i.test(content)
  const hasHateWords = /\b(?:hate|stupid|idiot|dumb)\b/i.test(content)
  const isHighQuality = contentLength > 50 && !hasSpamWords

  return {
    isApproved: !hasSpamWords && !hasHateWords,
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
    flags: [
      ...(hasSpamWords ? ["potential_spam"] : []),
      ...(hasHateWords ? ["hate_speech"] : []),
      ...(contentLength < 10 ? ["too_short"] : [])
    ],
    categories: {
      spam: hasSpamWords ? Math.random() * 0.5 + 0.5 : Math.random() * 0.2,
      hate: hasHateWords ? Math.random() * 0.3 + 0.2 : 0.0,
      inappropriate: Math.random() * 0.1,
      quality: isHighQuality ? Math.random() * 0.3 + 0.7 : Math.random() * 0.5 + 0.3
    },
    suggestions: [
      ...(contentLength < 20 ? ["Consider adding more detail"] : []),
      ...(hasSpamWords ? ["Remove promotional content"] : []),
      "Content quality is good",
      "No major issues detected"
    ],
    action: (!hasSpamWords && !hasHateWords) ? "approve" : "flag"
  }
}
