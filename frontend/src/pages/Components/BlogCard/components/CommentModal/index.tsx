import React, { useState, useCallback, useMemo, memo, type SetStateAction } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';
import useCommentMutation from '@/customHooks/CommentOnBlog';
import type { IUser } from '@/types';

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
  userInfo: IUser;
  setBlogComments: React.Dispatch<SetStateAction<Comment[]>>;
}

const CommentModalComponent: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  comments,
  blogId,
  userInfo,
  setBlogComments
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: commentMutation } = useCommentMutation(blogId, {
    username: userInfo?.username || "",
    profilePicture: userInfo?.profilePicture?.url,
    _id: userInfo?._id || ""
  });

  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedComment = newComment.trim();
      if (!trimmedComment || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const response = await commentMutation({ commentBody: trimmedComment });
        setNewComment('');

        if (response?.data) {
          const newCommentObj: Comment = {
            commentAuthor: {
              _id: response.data.commentAuthor._id,
              username: response.data.commentAuthor.username,
              profilePicture: response.data.commentAuthor.profilePicture || ''
            },
            body: response.data.body || '',
            date: typeof response.data.date === 'string'
              ? response.data.date
              : response.data.date.toISOString()
          };

          setBlogComments(prev => [...prev, newCommentObj]);
        }
      } catch (error) {
        console.error('Failed to submit comment:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [newComment, isSubmitting, commentMutation, setBlogComments]
  );

  const renderedComments = useMemo(() => comments.map((comment, index) => (
    <motion.div
      key={comment._id || index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
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
            <span className="font-semibold text-gray-900 text-sm">{comment.commentAuthor.username}</span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">{comment.body}</p>
        </div>
      </div>
    </motion.div>
  )), [comments]);

  const isSubmitDisabled = useMemo(() => !newComment.trim() || isSubmitting, [newComment, isSubmitting]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white rounded-xl shadow-sm border-transparent">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comments ({comments.length})
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-gray-50 transition-colors"></Button>
          </div>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] px-6 py-4">
          <AnimatePresence>
            {comments.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12 text-gray-500"
              >
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No comments yet</p>
                <p className="text-sm">Be the first to share your thoughts!</p>
              </motion.div>
            )}
            {renderedComments}
          </AnimatePresence>
        </div>

        {/* Comment Input */}
        <div className="border-t border-gray-100 p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-gray-100 overflow-hidden flex-shrink-0">
              <AvatarImage
                src={userInfo?.profilePicture?.url || ""}
                alt={userInfo?.username || "User"}
                className="object-cover w-full h-full"
              />
              <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 font-medium">
                {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 flex gap-2">
              <Input
                value={newComment}
                onChange={handleInputChange}
                placeholder="Add a comment..."
                className="flex-1 rounded-lg border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                disabled={isSubmitDisabled}
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

export const CommentModal = memo(CommentModalComponent);
