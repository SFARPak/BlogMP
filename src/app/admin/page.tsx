"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { PerformanceMonitorComponent } from "@/components/PerformanceMonitor"
import {
  Users,
  FileText,
  MessageSquare,
  Flag,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalPosts: 3456,
    totalComments: 8923,
    reportedContent: 23,
    activeUsers: 456,
    newUsersToday: 12
  })

  const [recentReports] = useState([
    {
      id: "1",
      type: "post",
      content: "Inappropriate content in post about...",
      reportedBy: "user123",
      reportedAt: new Date(Date.now() - 3600000).toISOString(),
      status: "pending"
    },
    {
      id: "2",
      type: "comment",
      content: "Spam comment on React tutorial",
      reportedBy: "moderator456",
      reportedAt: new Date(Date.now() - 7200000).toISOString(),
      status: "reviewed"
    }
  ])

  const [recentUsers] = useState([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "READER",
      joinedAt: new Date(Date.now() - 86400000).toISOString(),
      postsCount: 5,
      status: "active"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "AUTHOR",
      joinedAt: new Date(Date.now() - 172800000).toISOString(),
      postsCount: 23,
      status: "active"
    }
  ])

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: FileText },
    { id: "moderation", label: "Moderation", icon: Shield },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header session={null} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your platform and moderate content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalComments.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Flag className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reported Content</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reportedContent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">New user registration</p>
                          <p className="text-sm text-gray-600">John Doe joined the platform</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">2 hours ago</span>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-900">New post published</p>
                          <p className="text-sm text-gray-600">React Best Practices guide</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">4 hours ago</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Queue</h3>
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900">{report.type} reported</p>
                            <p className="text-sm text-gray-600">{report.content}</p>
                            <p className="text-xs text-gray-500">Reported by {report.reportedBy}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            Approve
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance Monitor */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
                  <PerformanceMonitorComponent />
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Add User
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Posts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                              user.role === 'AUTHOR' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.postsCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Ban</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "content" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Published Posts</p>
                        <p className="text-2xl font-bold text-gray-900">3,456</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Draft Posts</p>
                        <p className="text-2xl font-bold text-gray-900">127</p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Comments</p>
                        <p className="text-2xl font-bold text-gray-900">8,923</p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "moderation" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Content Moderation</h3>

                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Flag className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-900">
                              {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              report.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {report.status}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-2">{report.content}</p>
                          <p className="text-sm text-gray-600">
                            Reported by {report.reportedBy} • {new Date(report.reportedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">User Growth</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This week</span>
                        <span className="text-sm font-medium text-gray-900">+{stats.newUsersToday * 7}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This month</span>
                        <span className="text-sm font-medium text-gray-900">+{stats.newUsersToday * 30}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Content Engagement</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. reactions per post</span>
                        <span className="text-sm font-medium text-gray-900">24.5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg. comments per post</span>
                        <span className="text-sm font-medium text-gray-900">8.2</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Platform Configuration</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Registration Open</label>
                          <p className="text-sm text-gray-600">Allow new users to register</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Email Verification</label>
                          <p className="text-sm text-gray-600">Require email verification for new accounts</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-900">Auto Moderation</label>
                          <p className="text-sm text-gray-600">Automatically moderate content using AI</p>
                        </div>
                        <input type="checkbox" className="rounded" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                      Save Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
