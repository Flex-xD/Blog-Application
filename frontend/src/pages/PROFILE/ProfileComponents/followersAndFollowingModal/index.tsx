import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Users,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Check,
    UserCheck,
    BookOpen,
} from "lucide-react";
import type { IUser } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useFollowOrUnfollowMutation from "@/customHooks/Follow&Unfollow";

interface FollowModalProps {
    currentUser: IUser;
    isOpen: boolean;
    onClose: () => void;
    title: string;
    followedUsers: IUser[];
}

const FollowModal = ({
    currentUser,
    isOpen,
    onClose,
    title,
    followedUsers,
}: FollowModalProps) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFollowingStates, setIsFollowingStates] = useState<Record<string, boolean>>({});
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1024
    );

    const getResponsiveConfig = useCallback(() => {
        if (windowWidth < 380) {
            return {
                usersPerPage: 3,
                avatarSize: "h-10 w-10",
                buttonMinWidth: "min-w-[80px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-[98vw]",
                modalPadding: "p-3",
                contentPadding: "p-3",
                textSize: {
                    username: "text-sm",
                    bio: "text-xs",
                    meta: "text-[10px]",
                    stats: "text-[10px]",
                },
                iconSize: 10,
                buttonPadding: "px-2 py-1",
                gap: "gap-2",
            };
        } else if (windowWidth < 480) {
            return {
                usersPerPage: 4,
                avatarSize: "h-11 w-11",
                buttonMinWidth: "min-w-[85px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-[95vw]",
                modalPadding: "p-3",
                contentPadding: "p-3",
                textSize: {
                    username: "text-sm",
                    bio: "text-xs",
                    meta: "text-xs",
                    stats: "text-xs",
                },
                iconSize: 11,
                buttonPadding: "px-3 py-1.5",
                gap: "gap-2",
            };
        } else if (windowWidth < 640) {
            return {
                usersPerPage: 4,
                avatarSize: "h-12 w-12",
                buttonMinWidth: "min-w-[90px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-[95vw]",
                modalPadding: "p-4",
                contentPadding: "p-4",
                textSize: {
                    username: "text-base",
                    bio: "text-xs",
                    meta: "text-xs",
                    stats: "text-xs",
                },
                iconSize: 12,
                buttonPadding: "px-3 py-2",
                gap: "gap-3",
            };
        } else if (windowWidth < 768) {
            return {
                usersPerPage: 4,
                avatarSize: "h-12 w-12",
                buttonMinWidth: "min-w-[100px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-md",
                modalPadding: "p-4",
                contentPadding: "p-4",
                textSize: {
                    username: "text-base",
                    bio: "text-sm",
                    meta: "text-xs",
                    stats: "text-xs",
                },
                iconSize: 12,
                buttonPadding: "px-4 py-2",
                gap: "gap-3",
            };
        } else if (windowWidth < 1024) {
            return {
                usersPerPage: 5,
                avatarSize: "h-14 w-14",
                buttonMinWidth: "min-w-[100px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-lg",
                modalPadding: "p-6",
                contentPadding: "p-6",
                textSize: {
                    username: "text-lg",
                    bio: "text-sm",
                    meta: "text-sm",
                    stats: "text-xs",
                },
                iconSize: 14,
                buttonPadding: "px-4 py-2",
                gap: "gap-4",
            };
        } else {
            return {
                usersPerPage: 6,
                avatarSize: "h-14 w-14",
                buttonMinWidth: "min-w-[100px]",
                gridCols: "grid-cols-1",
                modalMaxWidth: "max-w-2xl",
                modalPadding: "p-6",
                contentPadding: "p-6",
                textSize: {
                    username: "text-xl",
                    bio: "text-sm",
                    meta: "text-sm",
                    stats: "text-xs",
                },
                iconSize: 16,
                buttonPadding: "px-4 py-2",
                gap: "gap-4",
            };
        }
    }, [windowWidth]);

    const responsiveConfig = getResponsiveConfig();
    const usersPerPage = responsiveConfig.usersPerPage;

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowWidth(window.innerWidth);
            }, 100);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        const states: Record<string, boolean> = {};

        followedUsers.forEach((user) => {
            states[user._id] = user.followers.includes(currentUser._id);
        });

        setIsFollowingStates(states);
    }, [followedUsers, currentUser._id]);

    const totalPages = Math.ceil(followedUsers.length / usersPerPage);

    const currentUsers = followedUsers.slice(
        currentPage * usersPerPage,
        (currentPage + 1) * usersPerPage
    );

    useEffect(() => {
        setCurrentPage(0);
    }, [followedUsers]);

    const nextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };

    const { mutateAsync: followUnfollowFn } = useFollowOrUnfollowMutation();

    const handleFollowUnfollow = async (
        e: React.MouseEvent,
        user: IUser
    ) => {
        e.stopPropagation();

        if (currentUser._id === user._id) return;

        const isCurrentlyFollowing = isFollowingStates[user._id];

        setIsFollowingStates((prev) => ({
            ...prev,
            [user._id]: !isCurrentlyFollowing,
        }));

        try {
            await followUnfollowFn({
                targetUserId: user._id,
                currentUserId: currentUser._id,
                isCurrentlyFollowing,
            });
        } catch (error) {
            setIsFollowingStates((prev) => ({
                ...prev,
                [user._id]: isCurrentlyFollowing,
            }));
        }
    };

    const formatDate = (date: Date) => {
        if (windowWidth < 480) {
            return new Date(date).toLocaleDateString("en-US", {
                year: "2-digit",
                month: "short",
                day: "numeric",
            });
        }

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            const scrollbarWidth =
                window.innerWidth - document.documentElement.clientWidth;

            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = "unset";
            document.body.style.paddingRight = "0px";
        }

        return () => {
            document.body.style.overflow = "unset";
            document.body.style.paddingRight = "0px";
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (touchStart === null || touchEnd === null) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && currentPage < totalPages - 1) {
            nextPage();
        } else if (isRightSwipe && currentPage > 0) {
            prevPage();
        }
    };

    const UserCardCompact = ({ user }: { user: IUser }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2"
        >
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <Avatar
                    className={`${responsiveConfig.avatarSize} flex-shrink-0 border border-white shadow-xs`}
                >
                    <AvatarImage
                        src={user.profilePicture?.url}
                        alt={user.username}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-100 to-purple-100 text-xs font-medium text-indigo-600">
                        {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p
                        className={`truncate font-semibold text-gray-900 ${responsiveConfig.textSize.username}`}
                    >
                        {user.username}
                    </p>

                    <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                            className={`flex items-center gap-0.5 text-gray-500 ${responsiveConfig.textSize.stats}`}
                        >
                            <UserCheck size={responsiveConfig.iconSize} />
                            {user.followers.length}
                        </span>

                        <span
                            className={`flex items-center gap-0.5 text-gray-500 ${responsiveConfig.textSize.stats}`}
                        >
                            <BookOpen size={responsiveConfig.iconSize} />
                            {user.following.length}
                        </span>
                    </div>
                </div>
            </div>

            {currentUser._id !== user._id && (
                <Button
                    variant={
                        isFollowingStates[user._id] ? "outline" : "default"
                    }
                    size="sm"
                    onClick={(e) => handleFollowUnfollow(e, user)}
                    className={`ml-2 flex-shrink-0 gap-1 ${responsiveConfig.buttonMinWidth} ${responsiveConfig.buttonPadding} text-xs transition-all duration-200`}
                >
                    {isFollowingStates[user._id] ? (
                        <>
                            <Check size={responsiveConfig.iconSize} />
                            <span className="hidden xs:inline">Done</span>
                            <span className="xs:hidden">✓</span>
                        </>
                    ) : (
                        <>
                            <UserPlus size={responsiveConfig.iconSize} />
                            <span>Follow</span>
                        </>
                    )}
                </Button>
            )}
        </motion.div>
    );

    const UserCardStandard = ({ user }: { user: IUser }) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{
                scale: windowWidth >= 768 ? 1.02 : 1,
                transition: { duration: 0.2 },
            }}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 transition-all duration-200 hover:border-indigo-100 hover:shadow-md sm:p-4"
        >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <Avatar
                    className={`${responsiveConfig.avatarSize} flex-shrink-0 border-2 border-white shadow-sm`}
                >
                    <AvatarImage
                        src={user.profilePicture?.url}
                        alt={user.username}
                        className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-indigo-100 to-purple-100 font-semibold text-indigo-600">
                        {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                    <p
                        className={`truncate font-semibold text-gray-900 ${responsiveConfig.textSize.username}`}
                    >
                        {user.username}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-gray-500 sm:gap-3">
                        <span
                            className={`flex items-center gap-1 ${responsiveConfig.textSize.stats}`}
                        >
                            <UserCheck size={responsiveConfig.iconSize} />
                            {user.followers.length} followers
                        </span>

                        <span
                            className={`flex items-center gap-1 ${responsiveConfig.textSize.stats}`}
                        >
                            <BookOpen size={responsiveConfig.iconSize} />
                            {user.following.length} following
                        </span>
                    </div>

                    {user.bio && windowWidth >= 480 && (
                        <p
                            className={`mt-1 truncate text-gray-600 ${responsiveConfig.textSize.bio}`}
                        >
                            {user.bio}
                        </p>
                    )}

                    <p
                        className={`mt-1 text-gray-400 ${responsiveConfig.textSize.meta}`}
                    >
                        Joined {formatDate(user.createdAt)}
                    </p>
                </div>
            </div>

            {currentUser._id !== user._id && (
                <Button
                    variant={
                        isFollowingStates[user._id] ? "outline" : "default"
                    }
                    size={windowWidth < 480 ? "sm" : "default"}
                    onClick={(e) => handleFollowUnfollow(e, user)}
                    className={`ml-2 flex-shrink-0 gap-1 transition-all duration-200 sm:ml-4 sm:gap-2 ${responsiveConfig.buttonMinWidth} ${responsiveConfig.buttonPadding}`}
                >
                    {isFollowingStates[user._id] ? (
                        <>
                            <Check size={responsiveConfig.iconSize} />
                            <span className="hidden xs:inline">Following</span>
                            <span className="xs:hidden">Followed</span>
                        </>
                    ) : (
                        <>
                            <UserPlus size={responsiveConfig.iconSize} />
                            Follow
                        </>
                    )}
                </Button>
            )}
        </motion.div>
    );

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-1 sm:p-2 md:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300,
                            duration: 0.3,
                        }}
                        className={`flex max-h-[98vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-2xl sm:max-h-[95vh] sm:rounded-xl md:max-h-[90vh] ${responsiveConfig.modalMaxWidth}`}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6">
                            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                                <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 p-1.5 sm:p-2">
                                    <Users
                                        size={windowWidth < 480 ? 16 : 20}
                                        className="text-indigo-600"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2
                                        className={`truncate font-bold text-gray-900 ${responsiveConfig.textSize.username}`}
                                    >
                                        {title}
                                    </h2>

                                    <p className="truncate text-xs text-gray-600 sm:text-sm">
                                        {followedUsers.length} {title.toLowerCase()}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="ml-2 flex-shrink-0 rounded-full p-1.5 transition-colors duration-200 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                                aria-label="Close modal"
                            >
                                <X
                                    size={windowWidth < 480 ? 16 : 20}
                                    className="text-gray-600"
                                />
                            </button>
                        </div>

                        <div className="custom-scrollbar flex-1 overflow-y-auto">
                            {followedUsers.length === 0 ? (
                                <div className="py-8 text-center text-gray-500 sm:py-12">
                                    <Users className="mx-auto mb-3 h-10 w-10 text-gray-300 sm:mb-4 sm:h-12 sm:w-12 md:h-16 md:w-16" />

                                    <p className="mb-1 text-sm font-medium text-gray-600 sm:text-base md:text-lg">
                                        No {title.toLowerCase()} to display
                                    </p>

                                    <p className="text-xs text-gray-400 sm:text-sm">
                                        This list is currently empty
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className={responsiveConfig.contentPadding}>
                                        <div
                                            className={`${responsiveConfig.gridCols} ${responsiveConfig.gap}`}
                                        >
                                            {currentUsers.map((user) =>
                                                windowWidth < 380 ? (
                                                    <UserCardCompact
                                                        key={user._id}
                                                        user={user}
                                                    />
                                                ) : (
                                                    <UserCardStandard
                                                        key={user._id}
                                                        user={user}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
                                            <div className="flex items-center justify-between">
                                                <Button
                                                    variant="outline"
                                                    size={windowWidth < 480 ? "sm" : "default"}
                                                    onClick={prevPage}
                                                    disabled={currentPage === 0}
                                                    className="gap-1 text-xs transition-all duration-200 sm:gap-2 sm:text-sm"
                                                >
                                                    <ChevronLeft
                                                        size={windowWidth < 480 ? 14 : 16}
                                                    />
                                                    <span className="hidden xs:inline">
                                                        Previous
                                                    </span>
                                                    <span className="xs:hidden">
                                                        Prev
                                                    </span>
                                                </Button>

                                                <span className="min-w-[80px] px-2 text-center text-xs font-medium text-gray-600 sm:text-sm">
                                                    {currentPage + 1} / {totalPages}
                                                </span>

                                                <Button
                                                    variant="outline"
                                                    size={windowWidth < 480 ? "sm" : "default"}
                                                    onClick={nextPage}
                                                    disabled={currentPage === totalPages - 1}
                                                    className="gap-1 text-xs transition-all duration-200 sm:gap-2 sm:text-sm"
                                                >
                                                    Next
                                                    <ChevronRight
                                                        size={windowWidth < 480 ? 14 : 16}
                                                    />
                                                </Button>
                                            </div>

                                            {windowWidth < 640 && totalPages > 1 && (
                                                <div className="mt-2 flex justify-center">
                                                    <div className="flex gap-1">
                                                        {Array.from(
                                                            { length: totalPages },
                                                            (_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                        i === currentPage
                                                                            ? "w-3 bg-indigo-600"
                                                                            : "w-1.5 bg-gray-300"
                                                                    }`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
