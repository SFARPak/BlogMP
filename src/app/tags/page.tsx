"use client"

import { useState } from "react"
import { Header } from "@/components/Header"
import { PostCard } from "@/components/PostCard"
import { Tag, TrendingUp, Users, MessageCircle } from "lucide-react"
import Link from "next/link"

export default function TagsPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Mock data for tags and posts
  const tags = [
    {
      name: "javascript",
      count: 1250,
      color: "bg-yellow-100 text-yellow-800",
      description: "JavaScript programming language",
      followers: 45600
    },
    {
      name: "react",
      count: 980,
      color: "bg-blue-100 text-blue-800",
      description: "React.js framework",
      followers: 38700
    },
    {
      name: "nextjs",
      count: 756,
      color: "bg-gray-100 text-gray-800",
      description: "Next.js framework",
      followers: 28900
    },
    {
      name: "typescript",
      count: 623,
      color: "bg-blue-100 text-blue-800",
      description: "TypeScript programming language",
      followers: 25600
    },
    {
      name: "nodejs",
      count: 543,
      color: "bg-green-100 text-green-800",
      description: "Node.js runtime",
      followers: 19800
    },
    {
      name: "python",
      count: 489,
      color: "bg-green-100 text-green-800",
      description: "Python programming language",
      followers: 34500
    },
    {
      name: "webdev",
      count: 432,
      color: "bg-purple-100 text-purple-800",
      description: "Web development",
      followers: 41200
    },
    {
      name: "css",
      count: 387,
      color: "bg-pink-100 text-pink-800",
      description: "Cascading Style Sheets",
      followers: 18900
    }
  ]

  const tagPosts = [
    {
      id: "1",
      title: "Building Scalable React Applications with Next.js 15",
      excerpt: "Learn the latest features in Next.js 15 and how to build production-ready applications that scale.",
      author: {
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      readingTime: 8,
      tags: ["react", "nextjs", "javascript", "webdev"],
      reactions: { heart: 67, clap: 45, fire: 23 }
    },
    {
      id: "2",
      title: "Mastering TypeScript: Advanced Patterns",
      excerpt: "Deep dive into advanced TypeScript features and best practices.",
      author: {
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      readingTime: 12,
      tags: ["typescript", "javascript", "programming"],
      reactions: { heart: 89, clap: 56, fire: 34 }
    }
  ]

  const trendingTags = tags.slice(0, 5)
  const selectedTagData = tags.find(tag => tag.name === selectedTag)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-6">
                <Tag className="w-6 h-6 mr-2 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Tags</h2>
              </div>

              {/* Trending Tags */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </h3>
                <div className="space-y-2">
                  {trendingTags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedTag === tag.name
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tag.color} mb-2`}>
                        #{tag.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tag.count} posts · {tag.followers} followers
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* All Tags */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">All Tags</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tags.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        selectedTag === tag.name
                          ? "bg-indigo-50 text-indigo-700"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">#{tag.name}</span>
                        <span className="text-xs text-gray-500">{tag.count}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {selectedTag ? (
              <div>
                {/* Tag Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${selectedTagData?.color} mb-3`}>
                        #{selectedTag}
                      </div>
                      <p className="text-gray-600 mb-4">{selectedTagData?.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {selectedTagData?.count} posts
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {selectedTagData?.followers} followers
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                      Follow
                    </button>
                  </div>
                </div>

                {/* Posts */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                  {tagPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Explore Tags</h3>
                <p className="text-gray-600 mb-6">
                  Discover posts by topic. Select a tag from the sidebar to see related content.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {trendingTags.slice(0, 3).map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${tag.color} hover:opacity-80 transition-opacity`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
