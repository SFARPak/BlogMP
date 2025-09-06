import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/Header"
import { PostCard } from "@/components/PostCard"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Fetch posts from API
  let posts = []
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts?limit=6`, {
      cache: 'no-store' // Ensure fresh data
    })
    const data = await response.json()
    posts = data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    posts = []
  }

  // Transform posts data to match PostCard interface
  const transformedPosts = posts.map((post: any) => {
    // Count reactions by type
    const reactionCounts = { heart: 0, clap: 0, fire: 0 }
    post.reactions?.forEach((reaction: any) => {
      if (reaction.type === 'HEART') reactionCounts.heart++
      else if (reaction.type === 'CLAP') reactionCounts.clap++
      else if (reaction.type === 'FIRE') reactionCounts.fire++
    })

    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt || post.content.substring(0, 150) + '...',
      author: {
        name: post.author.name || 'Anonymous',
        avatar: post.author.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      publishedAt: post.publishedAt || post.createdAt,
      readingTime: post.readingTime || 5,
      tags: post.tags?.map((t: any) => t.tag.name) || [],
      reactions: reactionCounts
    }
  })

  // Fallback to mock data if no posts
  const mockPosts = [
    {
      id: "1",
      title: "Welcome to Dev.to Clone",
      excerpt: "A modern social blogging platform built with Next.js and Ghost CMS. Join thousands of developers sharing knowledge and building amazing things together.",
      author: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date().toISOString(),
      readingTime: 5,
      tags: ["welcome", "introduction", "platform"],
      reactions: { heart: 42, clap: 28, fire: 12 }
    },
    {
      id: "2",
      title: "Building Scalable React Applications with Next.js 15",
      excerpt: "Learn the latest features in Next.js 15 and how to build production-ready applications that scale. From App Router to Server Components, we've got you covered.",
      author: {
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      readingTime: 8,
      tags: ["react", "nextjs", "javascript", "webdev"],
      reactions: { heart: 67, clap: 45, fire: 23 }
    },
    {
      id: "3",
      title: "The Future of AI in Software Development",
      excerpt: "Exploring how artificial intelligence is transforming the way we write code, debug applications, and maintain software systems. What does the future hold?",
      author: {
        name: "Dr. Maria Santos",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      readingTime: 12,
      tags: ["ai", "machine-learning", "future", "technology"],
      reactions: { heart: 89, clap: 56, fire: 34 }
    },
    {
      id: "4",
      title: "Mastering TypeScript: Advanced Patterns and Best Practices",
      excerpt: "Deep dive into advanced TypeScript features including conditional types, mapped types, and utility types. Level up your TypeScript game with these powerful patterns.",
      author: {
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      readingTime: 15,
      tags: ["typescript", "javascript", "programming", "best-practices"],
      reactions: { heart: 134, clap: 78, fire: 45 }
    },
    {
      id: "5",
      title: "Docker for Developers: From Zero to Production",
      excerpt: "Complete guide to containerizing your applications with Docker. Learn about Dockerfiles, docker-compose, and deploying to production environments.",
      author: {
        name: "Lisa Park",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
      readingTime: 20,
      tags: ["docker", "devops", "containers", "deployment"],
      reactions: { heart: 156, clap: 92, fire: 67 }
    },
    {
      id: "6",
      title: "Building APIs with Node.js and Express: A Complete Tutorial",
      excerpt: "Learn how to build robust REST APIs with Node.js and Express. Includes authentication, validation, error handling, and database integration.",
      author: {
        name: "Carlos Mendoza",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
      },
      publishedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      readingTime: 18,
      tags: ["nodejs", "express", "api", "backend"],
      reactions: { heart: 98, clap: 63, fire: 29 }
    }
  ]

  // Use real posts if available, otherwise fallback to mock data
  const displayPosts = transformedPosts.length > 0 ? transformedPosts : mockPosts

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Dev.to Clone
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A modern social blogging platform where developers share knowledge,
            connect with each other, and build amazing things together.
          </p>
        </div>

        {/* Featured Posts */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Posts</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayPosts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Trending Tags */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Tags</h2>
          <div className="flex flex-wrap gap-2">
            {["javascript", "react", "nextjs", "typescript", "nodejs", "python", "webdev"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        {!session && (
          <div className="text-center bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Community
            </h3>
            <p className="text-gray-600 mb-6">
              Create your account to start writing, reading, and connecting with developers worldwide.
            </p>
            <div className="space-x-4">
              <a
                href="/auth/signin"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign In
              </a>
              <a
                href="/auth/signup"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Up
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
