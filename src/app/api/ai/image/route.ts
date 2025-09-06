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

    const { prompt, type, style } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock image generation
      const imageUrl = await generateMockImage(prompt, type, style)
      return NextResponse.json({
        success: true,
        imageUrl: imageUrl,
        mock: true
      })
    }

    const imageUrl = await generateImage(prompt, type, style)

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl
    })

  } catch (error) {
    console.error("AI image generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function generateImage(prompt: string, type: string = "cover", style?: string) {
  try {
    let enhancedPrompt = prompt

    // Enhance prompt based on type
    switch (type) {
      case "cover":
        enhancedPrompt = `Create a professional blog post cover image for: ${prompt}. Style: ${style || 'modern, clean, tech-focused'}. Make it suitable for a developer blog with a professional yet creative look.`
        break
      case "illustration":
        enhancedPrompt = `Create an illustration for: ${prompt}. Style: ${style || 'minimalist, tech-themed'}. Make it suitable for inline content in a developer blog post.`
        break
      case "thumbnail":
        enhancedPrompt = `Create a thumbnail image for: ${prompt}. Style: ${style || 'eye-catching, modern'}. Make it optimized for social media sharing.`
        break
      default:
        enhancedPrompt = `Create an image for: ${prompt}. Style: ${style || 'professional, tech-focused'}`
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      size: type === "thumbnail" ? "1792x1024" : "1024x1024",
      quality: "standard",
      n: 1,
    })

    const imageUrl = response.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    return imageUrl

  } catch (error) {
    console.error("OpenAI image generation error:", error)
    throw new Error("Failed to generate image")
  }
}

async function generateMockImage(prompt: string, type: string = "cover", style?: string) {
  // Simulate image generation delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Return a placeholder image URL based on type
  const baseUrl = "https://via.placeholder.com"

  switch (type) {
    case "cover":
      return `${baseUrl}/1200x400/4f46e5/ffffff?text=${encodeURIComponent(prompt.substring(0, 30))}`
    case "illustration":
      return `${baseUrl}/600x400/10b981/ffffff?text=${encodeURIComponent(prompt.substring(0, 20))}`
    case "thumbnail":
      return `${baseUrl}/400x400/f59e0b/ffffff?text=${encodeURIComponent(prompt.substring(0, 15))}`
    default:
      return `${baseUrl}/800x600/6366f1/ffffff?text=${encodeURIComponent(prompt.substring(0, 25))}`
  }
}
