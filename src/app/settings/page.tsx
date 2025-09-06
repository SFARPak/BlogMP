"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/Header"
import { Settings, Link, ExternalLink, Check, X, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("integrations")

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  // Mock data for connected platforms
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    ghost: { connected: false, url: "", apiKey: "" },
    wordpress: { connected: false, url: "", username: "", password: "" },
    blogger: { connected: false, blogId: "", apiKey: "" },
    medium: { connected: true, token: "connected" }
  })

  const handleConnect = (platform: keyof typeof connectedPlatforms) => {
    // TODO: Implement OAuth/connection flow
    console.log(`Connecting to ${platform}`)
    setConnectedPlatforms(prev => ({
      ...prev,
      [platform]: { ...prev[platform], connected: true }
    }))
  }

  const handleDisconnect = (platform: keyof typeof connectedPlatforms) => {
    setConnectedPlatforms(prev => ({
      ...prev,
      [platform]: { ...prev[platform], connected: false }
    }))
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
      <Header session={session} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Settings className="w-6 h-6 mr-2 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("integrations")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "integrations"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Integrations
              </button>
              <button
                onClick={() => setActiveTab("account")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "account"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Account
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "notifications"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Notifications
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Cross-Posting Integrations
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Connect your accounts to automatically publish posts to multiple platforms.
                  </p>
                </div>

                {/* Platform Cards */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Ghost */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-bold text-sm">G</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Ghost</h3>
                          <p className="text-sm text-gray-500">Headless CMS</p>
                        </div>
                      </div>
                      {connectedPlatforms.ghost.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect("ghost")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {connectedPlatforms.ghost.connected && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <button
                          onClick={() => handleDisconnect("ghost")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>

                  {/* WordPress */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-sm">W</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">WordPress</h3>
                          <p className="text-sm text-gray-500">Popular CMS</p>
                        </div>
                      </div>
                      {connectedPlatforms.wordpress.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect("wordpress")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {connectedPlatforms.wordpress.connected && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <button
                          onClick={() => handleDisconnect("wordpress")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Blogger */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center mr-3">
                          <span className="text-orange-600 font-bold text-sm">B</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Blogger</h3>
                          <p className="text-sm text-gray-500">Google's blogging platform</p>
                        </div>
                      </div>
                      {connectedPlatforms.blogger.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect("blogger")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {connectedPlatforms.blogger.connected && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <button
                          onClick={() => handleDisconnect("blogger")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Medium */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold text-sm">M</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">Medium</h3>
                          <p className="text-sm text-gray-500">Story publishing platform</p>
                        </div>
                      </div>
                      {connectedPlatforms.medium.connected ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm">Connected</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleConnect("medium")}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Connect
                        </button>
                      )}
                    </div>

                    {connectedPlatforms.medium.connected && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className="text-sm text-green-600">Active</span>
                        </div>
                        <button
                          onClick={() => handleDisconnect("medium")}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Publishing Dashboard */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Publishing Dashboard
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">12</div>
                        <div className="text-sm text-gray-600">Posts Published</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">8</div>
                        <div className="text-sm text-gray-600">Platforms Connected</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">95%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">2.3k</div>
                        <div className="text-sm text-gray-600">Total Views</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={session?.user?.email || ""}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      defaultValue={session?.user?.name || ""}
                    />
                  </div>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    "Email notifications for new comments",
                    "Email notifications for new followers",
                    "Email notifications for likes and reactions",
                    "Weekly digest of activity",
                    "Marketing emails and updates"
                  ].map((preference, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{preference}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={index < 3} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
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
