"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { UserPlus, UserMinus, Users } from "lucide-react"
import Link from "next/link"

export default function FollowingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("following")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Mock data for following/followers
  const following = [
    {
      id: "1",
      name: "Alex Rodriguez",
      username: "alexdev",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Full-stack developer specializing in React and Node.js",
      isFollowing: true,
      followers: 1234,
      posts: 45
    },
    {
      id: "2",
      name: "Maria Santos",
      username: "mariasantos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      bio: "AI researcher and machine learning enthusiast",
      isFollowing: true,
      followers: 2156,
      posts: 78
    },
    {
      id: "3",
      name: "James Wilson",
      username: "jameswilson",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "DevOps engineer and cloud architecture expert",
      isFollowing: true,
      followers: 987,
      posts: 32
    }
  ]

  const followers = [
    {
      id: "4",
      name: "Lisa Park",
      username: "lisapark",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      bio: "Frontend developer and UI/UX designer",
      isFollowing: false,
      followers: 756,
      posts: 23
    },
    {
      id: "5",
      name: "Carlos Mendoza",
      username: "carlosmendoza",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      bio: "Backend developer and API specialist",
      isFollowing: true,
      followers: 543,
      posts: 67
    }
  ]

  const handleFollowToggle = (userId: string, currentlyFollowing: boolean) => {
    // TODO: Implement follow/unfollow functionality
    console.log(`${currentlyFollowing ? 'Unfollowing' : 'Following'} user ${userId}`)
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

  const currentData = activeTab === "following" ? following : followers

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={session} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Network</h1>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                {following.length} following · {followers.length} followers
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("following")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "following"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Following ({following.length})
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "followers"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Followers ({followers.length})
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200">
            {currentData.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {activeTab === "following" ? "Not following anyone yet" : "No followers yet"}
                </p>
                <p className="text-gray-500">
                  {activeTab === "following"
                    ? "Follow developers to see their posts in your feed"
                    : "Share your knowledge to attract followers"
                  }
                </p>
              </div>
            ) : (
              currentData.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Link href={`/profile/${user.username}`}>
                        <img
                          className="h-12 w-12 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                          src={user.avatar}
                          alt={user.name}
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/profile/${user.username}`}
                            className="text-lg font-semibold text-gray-900 hover:text-indigo-600"
                          >
                            {user.name}
                          </Link>
                          <span className="text-gray-500">@{user.username}</span>
                        </div>

                        <p className="text-gray-600 text-sm mt-1">{user.bio}</p>

                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>{user.followers} followers</span>
                          <span>{user.posts} posts</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                      className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md transition-colors ${
                        user.isFollowing
                          ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                          : "border-transparent text-white bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {user.isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
