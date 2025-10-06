import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, ChevronLeft, ChevronRight, Check, UserCheck, BookOpen } from 'lucide-react';
import type { IUser } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import useFollowOrUnfollowMutation from '@/customHooks/Follow&Unfollow';

interface FollowModalProps {
    currentUser :IUser , 
    isOpen: boolean;
    onClose: () => void;
    title: string;
    followedUsers: IUser[];
}

const FollowModal = ({
    currentUser , 
    isOpen,
    onClose,
    title,
    followedUsers
}: FollowModalProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const usersPerPage = 6;
    const [isFollowingStates, setIsFollowingStates] = useState<Record<string, boolean>>({});
    const [targetUserId  , setTargetUserId] = useState<string>("");

    // console.log("These are the users : " , followedUsers);
    // console.log("These are the followed users : " , followedUsers);

    // ? Initialize following states
    useEffect(() => {
        const states: Record<string, boolean> = {};
        followedUsers.forEach(user => {
            states[user._id] = followedUsers.some(followedUser => followedUser._id === user._id);
        });
        setIsFollowingStates(states);
    }, [followedUsers, followedUsers]);

    // Pagination
    const totalPages = Math.ceil(followedUsers.length / usersPerPage);
    const currentUsers = followedUsers.slice(
        currentPage * usersPerPage,
        (currentPage + 1) * usersPerPage
    );

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const {mutateAsync:followUnfollowFn} = useFollowOrUnfollowMutation(targetUserId , currentUser._id);

    const handleFollowUnfollow = (e: React.MouseEvent, user: IUser) => {
        e.stopPropagation();
        setTargetUserId(user._id);
        if (currentUser._id !== user._id) {
            const isCurrentlyFollowing = isFollowingStates[user._id];
            setIsFollowingStates(prev => ({
                ...prev,
                [user._id]: !isCurrentlyFollowing
            }));
            followUnfollowFn(isCurrentlyFollowing);
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence mode="wait">
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
                        transition={{
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                            duration: 0.3
                        }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {title}
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {followedUsers.length} {title.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white transition-colors duration-200"
                                aria-label="Close modal"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto flex-1">
                            {followedUsers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                                    <p className="text-lg font-medium text-gray-600">No {title.toLowerCase()} to display</p>
                                    <p className="text-sm text-gray-400 mt-1">This list is currently empty</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 gap-3">
                                            {currentUsers.map((user) => (
                                                <motion.div
                                                    key={user._id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    whileHover={{
                                                        scale: 1.02,
                                                        transition: { duration: 0.2 }
                                                    }}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200 bg-white"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                                                            <AvatarImage
                                                                src={user.profilePicture?.url}
                                                                alt={user.username}
                                                                className="object-cover"
                                                            />
                                                            <AvatarFallback className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-600 font-semibold">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-900 truncate">
                                                                {user.username}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <UserCheck size={12} />
                                                                    {user.followers.length} followers
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <BookOpen size={12} />
                                                                    {user.following.length} following
                                                                </span>
                                                            </div>
                                                            {user.bio && (
                                                                <p className="text-sm text-gray-600 truncate mt-1">
                                                                    {user.bio}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Joined {formatDate(user.createdAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {currentUser._id !== user._id && (
                                                        <Button
                                                            variant={isFollowingStates[user._id] ? "outline" : "default"}
                                                            size="sm"
                                                            onClick={(e) => handleFollowUnfollow(e, user)}
                                                            className="ml-4 gap-2 min-w-[100px] transition-all duration-200"
                                                        >
                                                            {isFollowingStates[user._id] ? (
                                                                <>
                                                                    <Check className="h-4 w-4" />
                                                                    Following
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserPlus className="h-4 w-4" />
                                                                    Follow
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                                            <div className="flex justify-between items-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={prevPage}
                                                    disabled={currentPage === 0}
                                                    className="gap-2 transition-all duration-200"
                                                >
                                                    <ChevronLeft size={16} />
                                                    Previous
                                                </Button>

                                                <span className="text-sm font-medium text-gray-600">
                                                    Page {currentPage + 1} of {totalPages}
                                                </span>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={nextPage}
                                                    disabled={currentPage === totalPages - 1}
                                                    className="gap-2 transition-all duration-200"
                                                >
                                                    Next
                                                    <ChevronRight size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FollowModal;