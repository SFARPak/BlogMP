"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { PostCard } from "@/components/PostCard"
import { Search, Filter, X, TrendingUp, Clock, User, Tag } from "lucide-react"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("posts")
  const [filters, setFilters] = useState({
    sort: "relevance",
    time: "all",
    tags: [] as string[]
  })

  // Mock search results
  const mockResults = {
    posts: [
      {
        id: "1",
        title: "Building Scalable React Applications with Next.js 15",
        excerpt: "Learn the latest features in Next.js 15 and how to build production-ready applications that scale. From App Router to Server Components, we've got you covered.",
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
        title: "Mastering TypeScript: Advanced Patterns and Best Practices",
        excerpt: "Deep dive into advanced TypeScript features including conditional types, mapped types, and utility types. Level up your TypeScript game with these powerful patterns.",
        author: {
          name: "James Wilson",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        publishedAt: new Date(Date.now() - 259200000).toISOString(),
        readingTime: 15,
        tags: ["typescript", "javascript", "programming", "best-practices"],
        reactions: { heart: 134, clap: 78, fire: 45 }
      }
    ],
    users: [
      {
        id: "1",
        name: "Sarah Chen",
        username: "sarahchen",
        bio: "Full-stack developer passionate about React, Node.js, and building amazing user experiences.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        followers: 1234,
        posts: 42
      },
      {
        id: "2",
        name: "Alex Rodriguez",
        username: "alexdev",
        bio: "Frontend developer specializing in React and modern JavaScript frameworks.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        followers: 2156,
        posts: 78
      }
    ],
    tags: [
      { name: "javascript", count: 1250, color: "bg-yellow-100 text-yellow-800" },
      { name: "react", count: 980, color: "bg-blue-100 text-blue-800" },
      { name: "nextjs", count: 756, color: "bg-gray-100 text-gray-800" },
      { name: "typescript", count: 623, color: "bg-blue-100 text-blue-800" },
      { name: "nodejs", count: 543, color: "bg-green-100 text-green-800" }
    ]
  }

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query, filters])

  const performSearch = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setResults(mockResults[activeTab as keyof typeof mockResults] || [])
    setIsLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      performSearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    router.push("/search")
  }

  const trendingSearches = [
    "React hooks",
    "Next.js 15",
    "TypeScript tips",
    "Docker tutorial",
    "AI in development"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={null} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for posts, users, or tags..."
                className="w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>

          {/* Trending Searches */}
          {!query && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setQuery(search)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {query && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {[
                  { id: "posts", label: "Posts", icon: Clock },
                  { id: "users", label: "Users", icon: User },
                  { id: "tags", label: "Tags", icon: Tag }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 ${
                      activeTab === id
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Results */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No results found</p>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              ) : (
                <div>
                  {activeTab === "posts" && (
                    <div className="space-y-6">
                      {results.map((post: any) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  )}

                  {activeTab === "users" && (
                    <div className="space-y-4">
                      {results.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <img
                              className="h-12 w-12 rounded-full"
                              src={user.avatar}
                              alt={user.name}
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{user.name}</h3>
                              <p className="text-sm text-gray-600">@{user.username}</p>
                              <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{user.followers} followers</div>
                            <div>{user.posts} posts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "tags" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.map((tag: any) => (
                        <div key={tag.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}>
                              #{tag.name}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {tag.count} posts
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tips */}
        {!query && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search Posts</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use quotes for exact phrases</li>
                  <li>• Search by author: "author:name"</li>
                  <li>• Search by tag: "tag:javascript"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Search Users</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Search by username or full name</li>
                  <li>• Find users by location or company</li>
                  <li>• Discover users by their bio</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
