"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Save, Eye, Calendar, Tag, X } from "lucide-react"
import { AIAssistant } from "@/components/AIAssistant"

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

export default function WritePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isPublished, setIsPublished] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [readingTime, setReadingTime] = useState(0)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Calculate reading time
  useEffect(() => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).filter(word => word.length > 0).length
    const time = Math.ceil(words / wordsPerMinute)
    setReadingTime(time)
  }, [content])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSave = async (publish: boolean = false) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          tags,
          published: publish
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save post")
      }

      setIsPublished(publish)

      if (publish) {
        // Redirect to the published post
        router.push(`/posts/${data.post.slug}`)
      } else {
        // Show success message for draft
        alert("Draft saved successfully!")
      }
    } catch (error) {
      console.error("Error saving post:", error)
      alert("Failed to save post. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
            <div className="text-sm text-gray-500">
              {readingTime} min read
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave(false)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4 inline mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              {isSaving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Excerpt */}
          <div>
            <input
              type="text"
              placeholder="Add a brief description..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full text-lg text-gray-600 border-none outline-none bg-transparent placeholder-gray-400 focus:ring-0"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tags..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
              className="flex-1 min-w-0 px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Markdown Editor */}
          <div className="min-h-[500px]">
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
              data-color-mode="light"
            />
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant
        onTitleGenerate={(generatedTitle) => setTitle(generatedTitle)}
        onExcerptGenerate={(generatedExcerpt) => setExcerpt(generatedExcerpt)}
        onContentGenerate={(generatedContent) => setContent(generatedContent)}
        onTagsGenerate={(generatedTags) => {
          if (Array.isArray(generatedTags)) {
            setTags([...new Set([...tags, ...generatedTags])])
          }
        }}
      />
    </div>
  )
}
