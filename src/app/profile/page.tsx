"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { PostCard } from "@/components/PostCard"
import { Edit3, MapPin, Link as LinkIcon, Calendar, Users, Heart, MessageCircle } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("posts")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Mock data - will be replaced with real data from database
  const userProfile = {
    id: "1",
    name: "Sarah Chen",
    username: "sarahchen",
    bio: "Full-stack developer passionate about React, Node.js, and building amazing user experiences. Love sharing knowledge and helping others grow in tech.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop",
    location: "San Francisco, CA",
    website: "https://sarahchen.dev",
    twitter: "sarahchen_dev",
    github: "sarahchen",
    linkedin: "sarahchen",
    joinedDate: "2023-01-15",
    followers: 1234,
    following: 567,
    postsCount: 42,
    reactionsReceived: 2890
  }

  const userPosts = [
    {
      id: "1",
      title: "Welcome to Dev.to Clone",
      excerpt: "A modern social blogging platform built with Next.js and Ghost CMS. Join thousands of developers sharing knowledge and building amazing things together.",
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      publishedAt: new Date().toISOString(),
      readingTime: 5,
      tags: ["welcome", "introduction", "platform"],
      reactions: { heart: 42, clap: 28, fire: 12 }
    },
    {
      id: "2",
      title: "Building Scalable React Applications",
      excerpt: "Learn the latest features in Next.js 15 and how to build production-ready applications that scale.",
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar
      },
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      readingTime: 8,
      tags: ["react", "nextjs", "javascript"],
      reactions: { heart: 67, clap: 45, fire: 23 }
    }
  ]

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
      <Header session={session} />

      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
        <img
          src={userProfile.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img
              className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
              src={userProfile.avatar}
              alt={userProfile.name}
            />

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                  <p className="text-gray-600">@{userProfile.username}</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>

              <p className="text-gray-700 mt-2">{userProfile.bio}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                {userProfile.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {userProfile.location}
                  </div>
                )}
                {userProfile.website && (
                  <a
                    href={userProfile.website}
                    className="flex items-center hover:text-indigo-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    {userProfile.website.replace('https://', '')}
                  </a>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Joined {new Date(userProfile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userProfile.postsCount}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userProfile.followers}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userProfile.following}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{userProfile.reactionsReceived}</div>
              <div className="text-sm text-gray-600">Reactions</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "posts", label: "Posts", count: userProfile.postsCount },
                { id: "comments", label: "Comments", count: 23 },
                { id: "bookmarks", label: "Bookmarks", count: 15 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "posts" && (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-gray-700">This is a sample comment on a post. Great insights!</p>
                        <p className="text-sm text-gray-500 mt-1">
                          on "Building Scalable React Applications" · 2 days ago
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">12</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bookmarks" && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">📚</div>
                  <p className="text-gray-600">No bookmarks yet</p>
                  <p className="text-sm text-gray-500">Save posts you want to read later</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
