import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Calendar,
    UserCheck,
    UserPlus,
    BookOpen,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import type { IBlog, IUser } from '@/types';
import { BlogCard } from '@/pages/NormalComponents/BlogCard';

interface ProfileModalProps {
    user: IUser;
    isOpen: boolean;
    onClose: () => void;
    handleFollowAndUnfollow: (isFollowing: boolean) => Promise<void>;
    isFollowingUser: boolean;
    currentUserId?: string;
    blogs: IBlog[];
}

const ProfileModal = ({
    user,
    isOpen,
    onClose,
    handleFollowAndUnfollow,
    isFollowingUser,
    currentUserId,
    blogs
}: ProfileModalProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [optimisticFollowing, setOptimisticFollowing] = useState(isFollowingUser);
    const blogsPerPage = 3;

    // Sync with parent component's follow state
    useEffect(() => {
        setOptimisticFollowing(isFollowingUser);
    }, [isFollowingUser]);

    const totalPages = Math.ceil(blogs.length / blogsPerPage);
    const currentBlogs = blogs.slice(
        currentPage * blogsPerPage,
        (currentPage + 1) * blogsPerPage
    );

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleOptimisticFollow = async () => {
        const previousFollowingState = optimisticFollowing;
        const newFollowingState = !optimisticFollowing;

        // Optimistic update
        setOptimisticFollowing(newFollowingState);

        try {
            await handleFollowAndUnfollow(previousFollowingState);
        } catch (error) {
            // Revert UI on failure
            setOptimisticFollowing(previousFollowingState);
            console.error('Follow/Unfollow failed:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="font-serif text-2xl">
                                Profile
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-accent transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
                            {/* User Info Section */}
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row items-start gap-6">
                                    {/* Profile Image */}
                                    <div className="flex-shrink-0">
                                        <div className="h-24 w-24 overflow-hidden rounded-full border border-border bg-muted">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture.url}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                                    <UserCheck size={32} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-grow">
                                        <h1 className="text-2xl font-bold text-foreground mb-2">
                                            {user.username}
                                        </h1>

                                        {user.bio && (
                                            <p className="text-muted-foreground mb-4">{user.bio}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <div className="flex items-center text-muted-foreground">
                                                <Calendar size={16} className="mr-1" />
                                                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <BookOpen size={16} className="mr-1" />
                                                <span className="text-sm">{blogs.length} blogs</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 mb-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{user.followers?.length || 0}</span>
                                                <span className="text-sm text-muted-foreground">Followers</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{user.following?.length || 0}</span>
                                                <span className="text-sm text-muted-foreground">Following</span>
                                            </div>
                                        </div>

                                        {currentUserId && currentUserId !== user._id && (
                                            <button
                                                onClick={handleOptimisticFollow}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${optimisticFollowing
                                                    ? 'border border-border bg-card text-foreground hover:bg-accent'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    {optimisticFollowing ? (
                                                        <>
                                                            <UserCheck size={16} className="mr-1" />
                                                            Following
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UserPlus size={16} className="mr-1" />
                                                            Follow
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* User's Blogs Section */}
                            {blogs.length > 0 && (
                                <div className="border-t border-border p-6">
                                    <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                                        <BookOpen size={20} className="mr-2 text-muted-foreground" />
                                        Recent Blogs
                                    </h3>

                                    <div className="space-y-4">
                                        {currentBlogs.map((blog) => (
                                            <BlogCard
                                                key={blog._id}
                                                _id={blog._id}
                                                title={blog.title}
                                                body={blog.body}
                                                image={blog.image}
                                                authorDetails={blog.authorDetails}
                                                likes={blog.likes}
                                                comments={blog.comments}
                                                createdAt={blog.createdAt}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center mt-6 gap-2">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPage === 0}
                                                className="p-2 rounded-full hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Previous page"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="text-sm text-muted-foreground">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <button
                                                onClick={nextPage}
                                                disabled={currentPage === totalPages - 1}
                                                className="p-2 rounded-full hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Next page"
                                            >
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProfileModal;