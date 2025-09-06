"use client"

import { useState } from "react"
import { Heart, Hand, Flame, MessageCircle, Send } from "lucide-react"

interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
  reactions: {
    heart: number
    clap: number
    fire: number
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
  comments: Comment[]
}

export function CommentSection({ postId, comments }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // TODO: Implement comment submission
      console.log("Submitting comment:", newComment)
      setNewComment("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReaction = async (commentId: string, reactionType: string) => {
    // TODO: Implement reaction functionality
    console.log("Reacting to comment:", commentId, reactionType)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-5 h-5 mr-2 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Add Comment */}
      <div className="mb-6">
        <div className="flex space-x-3">
          <img
            className="h-8 w-8 rounded-full"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            alt="Your avatar"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img
              className="h-8 w-8 rounded-full"
              src={comment.author.avatar}
              alt={comment.author.name}
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">
                    {comment.author.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>

              {/* Reactions */}
              <div className="flex items-center space-x-4 mt-2">
                <button
                  onClick={() => handleReaction(comment.id, "heart")}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{comment.reactions.heart}</span>
                </button>

                <button
                  onClick={() => handleReaction(comment.id, "clap")}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <Hand className="w-4 h-4" />
                  <span className="text-sm">{comment.reactions.clap}</span>
                </button>

                <button
                  onClick={() => handleReaction(comment.id, "fire")}
                  className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <Flame className="w-4 h-4" />
                  <span className="text-sm">{comment.reactions.fire}</span>
                </button>

                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Reply
                </button>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 ml-8 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex space-x-3">
                      <img
                        className="h-6 w-6 rounded-full"
                        src={reply.author.avatar}
                        alt={reply.author.name}
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg px-3 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {reply.author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet. Start the discussion!</p>
        </div>
      )}
    </div>
  )
}
