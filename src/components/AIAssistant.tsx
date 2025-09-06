"use client"

import { useState } from "react"
import { Sparkles, Wand2, Hash, FileText, Lightbulb, Image, FileCheck, Zap } from "lucide-react"

interface AIAssistantProps {
  onTitleGenerate: (title: string) => void
  onExcerptGenerate: (excerpt: string) => void
  onContentGenerate: (content: string) => void
  onTagsGenerate: (tags: string[]) => void
  onSummaryGenerate?: (summary: string) => void
  onImageGenerate?: (imageUrl: string) => void
}

export function AIAssistant({
  onTitleGenerate,
  onExcerptGenerate,
  onContentGenerate,
  onTagsGenerate,
  onSummaryGenerate,
  onImageGenerate
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateContent = async (type: string) => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      let endpoint = "/api/ai/generate"
      let body: any = { prompt, type }

      // Special handling for different AI features
      if (type === "summary") {
        endpoint = "/api/ai/summary"
        body = { content: prompt } // For summary, prompt is actually content
      } else if (type === "image") {
        endpoint = "/api/ai/image"
        body = { prompt, type: "cover" }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      switch (type) {
        case "title":
          onTitleGenerate(data.content)
          break
        case "excerpt":
          onExcerptGenerate(data.content)
          break
        case "content":
          onContentGenerate(data.content)
          break
        case "tags":
          onTagsGenerate(data.content)
          break
        case "summary":
          onSummaryGenerate?.(data.summary)
          break
        case "image":
          onImageGenerate?.(data.imageUrl)
          break
      }
    } catch (error) {
      console.error("AI generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const quickSuggestions = [
    "React hooks best practices",
    "Node.js API design",
    "Database optimization",
    "Frontend performance",
    "DevOps automation"
  ]

  return (
    <div className="relative">
      {/* AI Assistant Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-indigo-600 text-white"
            : "bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
        }`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                AI Writing Assistant
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Generate content with AI assistance
            </p>
          </div>

          <div className="p-4">
            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to write about?
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., React performance optimization"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Generation Options */}
            <div className="space-y-2">
              <button
                onClick={() => generateContent("title")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Wand2 className="w-4 h-4 mr-3 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Title</div>
                    <div className="text-sm text-gray-600">Create an engaging headline</div>
                  </div>
                </div>
                {isGenerating && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>}
              </button>

              <button
                onClick={() => generateContent("excerpt")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-3 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Excerpt</div>
                    <div className="text-sm text-gray-600">Create a compelling summary</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => generateContent("content")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Lightbulb className="w-4 h-4 mr-3 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Content</div>
                    <div className="text-sm text-gray-600">Create a full article</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => generateContent("tags")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Hash className="w-4 h-4 mr-3 text-orange-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Tags</div>
                    <div className="text-sm text-gray-600">Suggest relevant tags</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => generateContent("summary")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <FileCheck className="w-4 h-4 mr-3 text-red-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Summary</div>
                    <div className="text-sm text-gray-600">Create TL;DR summary</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => generateContent("image")}
                disabled={!prompt.trim() || isGenerating}
                className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center">
                  <Image className="w-4 h-4 mr-3 text-pink-600" />
                  <div>
                    <div className="font-medium text-gray-900">Generate Image</div>
                    <div className="text-sm text-gray-600">Create blog cover image</div>
                  </div>
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                AI-generated content may need editing for accuracy and style
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
