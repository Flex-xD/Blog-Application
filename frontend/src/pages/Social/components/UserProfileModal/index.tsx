import { useState } from 'react';
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
import { BlogCard } from '@/pages/Components/BlogCard';


interface ProfileModalProps {
    user: IUser;
    isOpen: boolean;
    onClose: () => void;
    handleFollowAndUnfollow:(isFollowing:boolean) => void;
    isFollowingUser:boolean;
    currentUserId?: string;
    blogs: IBlog[];
}

const ProfileModal = ({
    user,
    isOpen,
    onClose,
    handleFollowAndUnfollow,
    isFollowingUser ,
    currentUserId,
    blogs
}: ProfileModalProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const blogsPerPage = 3;

    // Pagination for blogs
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

    // Format date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
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
                        className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Profile
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
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
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 overflow-hidden border-2 border-white shadow-sm">
                                            {user.profilePicture ? (
                                                <img
                                                    src={user.profilePicture.url}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-indigo-500">
                                                    <UserCheck size={32} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="flex-grow">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                            {user.username}
                                        </h1>

                                        {user.bio && (
                                            <p className="text-gray-600 mb-4">{user.bio}</p>
                                        )}

                                        <div className="flex flex-wrap gap-4 mb-4">
                                            <div className="flex items-center text-gray-500">
                                                <Calendar size={16} className="mr-1" />
                                                <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center text-gray-500">
                                                <BookOpen size={16} className="mr-1" />
                                                <span className="text-sm">{blogs.length} blogs</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 mb-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{user.followers.length}</span>
                                                <span className="text-sm text-gray-500">Followers</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900">{user.following.length}</span>
                                                <span className="text-sm text-gray-500">Following</span>
                                            </div>
                                        </div>

                                        {currentUserId !== user._id && (
                                            <button
                                                onClick={() => handleFollowAndUnfollow(isFollowingUser)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all ${isFollowingUser
                                                    ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                                                    }`}
                                            >
                                                <div className="flex items-center">
                                                    {isFollowingUser ? (
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
                                <div className="border-t border-gray-100 p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                        <BookOpen size={20} className="mr-2 text-indigo-500" />
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
                                                updatedAt={blog.updatedAt}
                                                onLike={(id) => console.log(`Liked post with id: ${id}`)}
                                                onSave={(id) => console.log(`Saved post with id: ${id}`)}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center mt-6 gap-2">
                                            <button
                                                onClick={prevPage}
                                                disabled={currentPage === 0}
                                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Previous page"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage + 1} of {totalPages}
                                            </span>
                                            <button
                                                onClick={nextPage}
                                                disabled={currentPage === totalPages - 1}
                                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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