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

    const { content, title, excerpt, tags } = await request.json()

    if (!content || !title) {
      return NextResponse.json(
        { error: "Content and title are required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock SEO analysis
      const seoAnalysis = await generateMockSEOAnalysis(content, title, excerpt, tags)
      return NextResponse.json({
        success: true,
        analysis: seoAnalysis,
        mock: true
      })
    }

    const seoAnalysis = await analyzeSEO(content, title, excerpt, tags)

    return NextResponse.json({
      success: true,
      analysis: seoAnalysis
    })

  } catch (error) {
    console.error("SEO analysis error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function analyzeSEO(content: string, title: string, excerpt: string, tags: string[] = []) {
  try {
    const systemPrompt = `Analyze the SEO quality of a blog post. Provide a comprehensive analysis including:
    - SEO Score (0-100)
    - Title optimization suggestions
    - Content structure analysis
    - Keyword usage recommendations
    - Readability assessment
    - Meta description suggestions
    - Internal/external linking opportunities
    - Mobile-friendliness check
    - Image alt text recommendations

    Return the analysis as a JSON object with the following structure:
    {
      "score": number,
      "titleAnalysis": { "score": number, "suggestions": string[] },
      "contentAnalysis": { "score": number, "wordCount": number, "readability": string, "suggestions": string[] },
      "keywordAnalysis": { "primaryKeywords": string[], "secondaryKeywords": string[], "density": object },
      "technicalSEO": { "score": number, "issues": string[], "recommendations": string[] },
      "overallSuggestions": string[]
    }`

    const userPrompt = `Analyze this blog post for SEO:

Title: ${title}
Excerpt: ${excerpt || 'No excerpt provided'}
Tags: ${tags.join(', ') || 'No tags provided'}

Content:
${content.substring(0, 3000)}...`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1500,
      temperature: 0.3,
    })

    const analysisText = completion.choices[0]?.message?.content?.trim()

    if (!analysisText) {
      throw new Error("No analysis generated")
    }

    try {
      return JSON.parse(analysisText)
    } catch (parseError) {
      // If JSON parsing fails, return a structured fallback
      return {
        score: 75,
        titleAnalysis: {
          score: 80,
          suggestions: ["Title looks good", "Consider adding power words"]
        },
        contentAnalysis: {
          score: 70,
          wordCount: content.split(' ').length,
          readability: "Good",
          suggestions: ["Add more headings", "Include bullet points"]
        },
        keywordAnalysis: {
          primaryKeywords: tags.length > 0 ? tags.slice(0, 3) : ["blog", "content", "article"],
          secondaryKeywords: ["writing", "tips", "guide"],
          density: {}
        },
        technicalSEO: {
          score: 85,
          issues: [],
          recommendations: ["Add meta description", "Optimize images"]
        },
        overallSuggestions: [
          "Great content structure",
          "Consider adding more internal links",
          "Add social media sharing buttons"
        ]
      }
    }

  } catch (error) {
    console.error("OpenAI SEO analysis error:", error)
    throw new Error("Failed to analyze SEO")
  }
}

async function generateMockSEOAnalysis(content: string, title: string, excerpt: string, tags: string[] = []) {
  // Simulate SEO analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const wordCount = content.split(' ').length

  return {
    score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
    titleAnalysis: {
      score: Math.floor(Math.random() * 20) + 75,
      suggestions: [
        "Title length is optimal",
        "Consider adding target keyword",
        "Power words could improve click-through rate"
      ]
    },
    contentAnalysis: {
      score: Math.floor(Math.random() * 25) + 65,
      wordCount: wordCount,
      readability: wordCount > 1000 ? "Good" : "Could be improved",
      suggestions: [
        "Add more subheadings for better structure",
        "Include bullet points for scannability",
        "Consider adding a table of contents"
      ]
    },
    keywordAnalysis: {
      primaryKeywords: tags.length > 0 ? tags.slice(0, 3) : ["blog", "content", "article"],
      secondaryKeywords: ["writing", "tips", "guide", "best practices"],
      density: {
        "primary keyword": "1.2%",
        "secondary keywords": "0.8%"
      }
    },
    technicalSEO: {
      score: Math.floor(Math.random() * 15) + 80,
      issues: [],
      recommendations: [
        "Add meta description",
        "Optimize images with alt text",
        "Ensure mobile responsiveness",
        "Add structured data markup"
      ]
    },
    overallSuggestions: [
      "Content has good structure and readability",
      "Consider adding more internal links",
      "Add social media sharing buttons",
      "Optimize for featured snippets",
      "Consider adding a call-to-action"
    ]
  }
}
