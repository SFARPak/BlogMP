"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Heart, Hand, Flame, Eye } from "lucide-react"

interface PostCardProps {
  post: {
    id: string
    title: string
    excerpt: string
    author: {
      name: string
      avatar: string
    }
    publishedAt: string
    readingTime: number
    tags: string[]
    reactions: {
      heart: number
      clap: number
      fire: number
    }
  }
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession()
  const [reactions, setReactions] = useState(post.reactions)
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Fetch current reactions and user's reactions
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/reactions?postId=${post.id}`)
        const data = await response.json()
        if (response.ok) {
          setReactions({
            heart: data.counts.HEART || 0,
            clap: data.counts.CLAP || 0,
            fire: data.counts.FIRE || 0
          })
          setUserReactions(data.userReactions || [])
        }
      } catch (error) {
        console.error("Error fetching reactions:", error)
      }
    }

    fetchReactions()
  }, [post.id])

  const handleReaction = async (type: string) => {
    if (!session) {
      alert("Please sign in to react to posts")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          type: type.toUpperCase()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        const newReactions = { ...reactions }
        const reactionKey = type.toLowerCase() as keyof typeof reactions

        if (data.action === "added") {
          newReactions[reactionKey]++
          setUserReactions([...userReactions, type.toUpperCase()])
        } else {
          newReactions[reactionKey]--
          setUserReactions(userReactions.filter(r => r !== type.toUpperCase()))
        }

        setReactions(newReactions)
      }
    } catch (error) {
      console.error("Error reacting to post:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <Image
          className="h-8 w-8 rounded-full mr-3"
          src={post.author.avatar}
          alt={post.author.name}
          width={32}
          height={32}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
          <p className="text-sm text-gray-500">
            {formatDate(post.publishedAt)} · {post.readingTime} min read
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer">
          <Link href={`/posts/${post.id}`}>
            {post.title}
          </Link>
        </h2>
        <Link href={`/posts/${post.id}`}>
          <p className="text-gray-600 text-sm leading-relaxed hover:text-gray-800 cursor-pointer">
            {post.excerpt}
          </p>
        </Link>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Reactions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleReaction("heart")}
            disabled={loading}
            className={`flex items-center space-x-1 transition-colors ${
              userReactions.includes("HEART")
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">{reactions.heart}</span>
          </button>

          <button
            onClick={() => handleReaction("clap")}
            disabled={loading}
            className={`flex items-center space-x-1 transition-colors ${
              userReactions.includes("CLAP")
                ? "text-blue-500"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            <Hand className="w-4 h-4" />
            <span className="text-sm">{reactions.clap}</span>
          </button>

          <button
            onClick={() => handleReaction("fire")}
            disabled={loading}
            className={`flex items-center space-x-1 transition-colors ${
              userReactions.includes("FIRE")
                ? "text-orange-500"
                : "text-gray-500 hover:text-orange-500"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span className="text-sm">{reactions.fire}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-gray-400">
          <Eye className="w-4 h-4" />
          <span className="text-sm">Save</span>
        </div>
      </div>
    </article>
  )
}
