import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/Header"
import { CommentSection } from "@/components/CommentSection"
import { Heart, Hand, Flame, Bookmark, Share2 } from "lucide-react"

interface PostPageProps {
  params: {
    id: string
  }
}

// Mock data - will be replaced with database queries
const getPost = (id: string) => ({
  id,
  title: "Building Scalable React Applications with Next.js 15",
  content: `# Building Scalable React Applications with Next.js 15

Next.js 15 brings exciting new features that make building scalable React applications easier than ever. Let's explore the key improvements and how to leverage them in your projects.

## 🚀 Key Features in Next.js 15

### 1. App Router Enhancements
The App Router has been significantly improved with better performance and new capabilities:

- **Parallel Routes**: Load multiple pages simultaneously
- **Intercepting Routes**: Create modal-like experiences
- **Server Components**: Improved streaming and caching

### 2. Turbopack Improvements
Turbopack continues to get faster with:
- 95% faster cold starts
- Better HMR (Hot Module Replacement)
- Improved memory usage

## 📊 Performance Optimizations

### Image Optimization
\`\`\`tsx
import Image from 'next/image'

export default function OptimizedImage() {
  return (
    <Image
      src="/hero.jpg"
      alt="Hero image"
      width={800}
      height={600}
      priority
    />
  )
}
\`\`\`

### Caching Strategies
Next.js 15 introduces advanced caching:
- Request Memoization
- Full Route Cache
- Router Cache

## 🔧 Best Practices

1. **Use Server Components** when possible
2. **Implement proper loading states**
3. **Optimize bundle size** with code splitting
4. **Leverage Edge Runtime** for global deployments

## Conclusion

Next.js 15 makes it easier to build fast, scalable React applications. Start exploring these features in your next project!

Happy coding! 🎉`,
  excerpt: "Learn the latest features in Next.js 15 and how to build production-ready applications that scale. From App Router to Server Components, we've got you covered.",
  author: {
    name: "Alex Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Full-stack developer passionate about React and modern web technologies."
  },
  publishedAt: new Date(Date.now() - 86400000).toISOString(),
  readingTime: 8,
  tags: ["react", "nextjs", "javascript", "webdev"],
  reactions: { heart: 67, clap: 45, fire: 23 },
  comments: [
    {
      id: "1",
      content: "Great article! The new App Router features are really powerful. Have you tried the parallel routes yet?",
      author: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      reactions: { heart: 5, clap: 3, fire: 1 }
    },
    {
      id: "2",
      content: "Thanks for the detailed explanation! The caching strategies section was particularly helpful.",
      author: {
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
      },
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      reactions: { heart: 8, clap: 2, fire: 0 }
    }
  ]
})

export default async function PostPage({ params }: PostPageProps) {
  const session = await getServerSession(authOptions)
  const post = getPost(params.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center mb-6">
            <img
              className="h-12 w-12 rounded-full mr-4"
              src={post.author.avatar}
              alt={post.author.name}
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {post.author.name}
              </h2>
              <p className="text-sm text-gray-600">
                {formatDate(post.publishedAt)} · {post.readingTime} min read
              </p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
            <div className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                <Heart className="w-5 h-5" />
                <span>{post.reactions.heart}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                <Hand className="w-5 h-5" />
                <span>{post.reactions.clap}</span>
              </button>

              <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-colors">
                <Flame className="w-5 h-5" />
                <span>{post.reactions.fire}</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                <Bookmark className="w-5 h-5" />
              </button>

              <button className="text-gray-600 hover:text-gray-900">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div
            className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-indigo-600 prose-pre:bg-gray-100"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, '<br>')
            }}
          />
        </article>

        {/* Author Bio */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-4">
            <img
              className="h-16 w-16 rounded-full"
              src={post.author.avatar}
              alt={post.author.name}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Written by {post.author.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {post.author.bio}
              </p>
              <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                Follow
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection postId={post.id} comments={post.comments} />
      </main>
    </div>
  )
}
