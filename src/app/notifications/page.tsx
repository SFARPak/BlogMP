"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Heart, MessageCircle, UserPlus, AtSign, Eye, X } from "lucide-react"
import Link from "next/link"

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Mock notifications data
  const notifications = [
    {
      id: "1",
      type: "like" as const,
      user: {
        name: "Alex Rodriguez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        username: "alexdev"
      },
      content: "liked your post",
      postTitle: "Building Scalable React Applications with Next.js 15",
      postId: "2",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: "2",
      type: "comment" as const,
      user: {
        name: "Maria Santos",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        username: "mariasantos"
      },
      content: "commented on your post",
      postTitle: "The Future of AI in Software Development",
      postId: "3",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      read: false
    },
    {
      id: "3",
      type: "follow" as const,
      user: {
        name: "James Wilson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        username: "jameswilson"
      },
      content: "started following you",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    {
      id: "4",
      type: "mention" as const,
      user: {
        name: "Lisa Park",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        username: "lisapark"
      },
      content: "mentioned you in a comment",
      postTitle: "Docker for Developers: From Zero to Production",
      postId: "5",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      read: true
    },
    {
      id: "5",
      type: "view" as const,
      content: "Your post reached 1000 views",
      postTitle: "Mastering TypeScript: Advanced Patterns",
      postId: "4",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      read: true
    }
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "mention":
        return <AtSign className="w-5 h-5 text-purple-500" />
      case "view":
        return <Eye className="w-5 h-5 text-indigo-500" />
      default:
        return <MessageCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const filteredNotifications = activeTab === "all"
    ? notifications
    : notifications.filter(n => !n.read)

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "all"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "unread"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Unread ({notifications.filter(n => !n.read).length})
              </button>
            </nav>
          </div>

          {/* Notifications List */}
          <div className="divide-y divide-gray-200">
            {filteredNotifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-400 text-4xl mb-4">🔔</div>
                <p className="text-gray-600 text-lg">No notifications yet</p>
                <p className="text-gray-500">When someone interacts with your posts, you'll see them here.</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {notification.type !== "view" && notification.user ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={notification.user.avatar}
                        alt={notification.user.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {notification.type !== "view" && notification.user && (
                            <Link
                              href={`/profile/${notification.user.username}`}
                              className="font-medium text-gray-900 hover:text-indigo-600"
                            >
                              {notification.user.name}
                            </Link>
                          )}
                          <span className="text-gray-600">{notification.content}</span>
                          {notification.postTitle && (
                            <Link
                              href={`/posts/${notification.postId}`}
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              "{notification.postTitle}"
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mark All as Read */}
          {filteredNotifications.some(n => !n.read) && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
