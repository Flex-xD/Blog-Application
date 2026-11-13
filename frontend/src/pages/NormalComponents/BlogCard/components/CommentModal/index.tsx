import React, { useState, useCallback, memo, type SetStateAction } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import useCommentMutation from '@/customHooks/CommentOnBlog';
import type { IUser, TUserComment } from '@/types';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  comments: TUserComment[];
  blogId: string;
  userInfo: IUser;
  setBlogComments: React.Dispatch<SetStateAction<TUserComment[]>>;
}

const formatCommentDate = (value: Date | string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

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
          const newCommentObj: TUserComment = {
            commentAuthor: {
              _id: response.data.commentAuthor._id,
              username: response.data.commentAuthor.username,
              profilePicture: response.data.commentAuthor.profilePicture || ''
            },
            body: response.data.body || '',
            date: new Date(response.data.date)
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

  const isSubmitDisabled = !newComment.trim() || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-sm border-border p-0 shadow-none sm:max-w-[34rem]">
        <div className="border-b border-border px-6 py-4">
          <DialogTitle className="font-serif text-2xl leading-tight tracking-tight">
            Comments <span className="text-muted-foreground">({comments.length})</span>
          </DialogTitle>
        </div>

        <div className="max-h-[50vh] overflow-y-auto px-6">
          {comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No comments yet. Say the first thing.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {comments.map((comment, index) => {
                const posted = formatCommentDate(comment.date);
                return (
                  <li key={index} className="flex items-start gap-3 py-4">
                    <Avatar className="size-8 shrink-0">
                      <AvatarImage src={comment.commentAuthor?.profilePicture || undefined} alt="" />
                      <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                        {(comment.commentAuthor?.username?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium">{comment.commentAuthor.username}</span>
                        {posted && (
                          <span className="text-xs text-muted-foreground">{posted}</span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmitComment} className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment…"
            aria-label="Add a comment"
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitDisabled}
            aria-label="Post comment"
            className="shrink-0"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const CommentModal = memo(CommentModalComponent);
