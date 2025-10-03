import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Calendar,
  Clock,
  User
} from 'lucide-react';

interface CommentAuthor {
  _id: string;
  profilePicture?: string;
  username: string;
}

interface Comment {
  _id?: string;
  commentAuthor: CommentAuthor;
  body: string;
  date: string;
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: Comment[];
  blogId: string;
  onCommentSubmit: (blogId: string, commentBody: string) => Promise<void>;
  currentUser?: CommentAuthor;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  comments,
  blogId,
  onCommentSubmit,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCommentSubmit(blogId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white rounded-xl shadow-sm border-transparent">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comments ({comments.length})
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-gray-50 transition-colors"
            >
            </Button>
          </div>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] px-6 py-4">
          <AnimatePresence>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 text-gray-500"
              >
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </motion.div>
            ) : (
              <motion.div
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {[
    {
        _id: "comment1",
        commentAuthor: {
            _id: "user2",
            username: "sarah_writer",
            profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        body: "This is such an insightful post! I really enjoyed reading about your perspective on this topic.",
        date: "2024-01-15T10:30:00Z"
    },
    {
        _id: "comment2",
        commentAuthor: {
            _id: "user3",
            username: "tech_enthusiast",
            profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        body: "Great points! Have you considered the implications of recent developments in this field?",
        date: "2024-01-15T14:45:00Z"
    },
    {
        _id: "comment3",
        commentAuthor: {
            _id: "user4",
            username: "design_lover",
            profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        body: "The examples you provided really helped clarify the concepts. Looking forward to more content like this!",
        date: "2024-01-16T09:15:00Z"
    },
    {
        _id: "comment4",
        commentAuthor: {
            _id: "user5",
            username: "code_master",
            profilePicture: ""
        },
        body: "Interesting approach. I've implemented something similar in my projects and found it works well.",
        date: "2024-01-16T16:20:00Z"
    }
].map((comment, index) => (
                  <motion.div
                    key={comment._id || index}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{
                      y: -2,
                      transition: { duration: 0.2 }
                    }}
                    className="p-4 rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-gray-100 hover:ring-indigo-100 transition-colors">
                        <AvatarImage
                          src={comment.commentAuthor?.profilePicture || undefined}
                          alt={comment.commentAuthor?.username || "User"}
                        />
                        <AvatarFallback>
                          {(comment.commentAuthor?.username?.[0] || "U").toUpperCase()}
                        </AvatarFallback>

                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {comment.commentAuthor.username}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(comment.date)}</span>
                            <Clock className="h-3 w-3 ml-1" />
                            <span>{formatTime(comment.date)}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-gray-100">
              <AvatarImage
                src={currentUser?.profilePicture}
                alt={currentUser?.username}
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-medium">
                {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};