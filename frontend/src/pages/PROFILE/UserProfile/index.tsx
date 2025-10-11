import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, Bookmark, UserPlus, Users, Calendar, Mail, PenSquare, LucideLogOut, Check, BookmarkCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { BlogCard } from '@/pages/Components/BlogCard';
import type { IBlog, IUser } from '@/types';
import Navbar from '@/pages/Components/Navbar';
import apiClient from '@/utility/axiosClient';
import { AUTH_ENDPOINTS, BLOG_ENDPOINTS } from '@/constants/constants';
import { toast } from 'sonner';
import FollowModal from '../components/followersAndFollowingModal';
import { EditProfileModal } from '../components/EditProfileModal';
import useFollowOrUnfollowMutation from '@/customHooks/Follow&Unfollow';
import useUnsaveBlogMutation from '@/customHooks/unsaveBlog';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';

interface UserProfileProps {
    user: IUser;
    blogs: IBlog[];
    isLoading?: boolean;
    isCurrentUser?: boolean;
    onFollow?: () => void;
    currentUserId?: string;
}

// Fetch saved blogs
const useSavedBlogs = (userId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.BLOGS.SAVED(userId),
        queryFn: async () => {
            const { data } = await apiClient.get(BLOG_ENDPOINTS.USER_SAVED_BLOGS);
            return data.data || [];
        },
        enabled: !!userId,
    });
};

export const UserProfile: React.FC<UserProfileProps> = ({
    user: initialUser,
    blogs,
    isLoading = false,
    isCurrentUser = false,
    onFollow,
    currentUserId = '',
}) => {
    const [activeTab, setActiveTab] = useState('blogs');
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [modalUsers, setModalUsers] = useState<IUser[]>([]);
    const [modalTitle, setModalTitle] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [user, setUser] = useState<IUser>(initialUser);
    const [followersCount, setFollowersCount] = useState(initialUser.followers.length);
    const [savedBlogsCount, setSavedBlogsCount] = useState(initialUser.saves?.length || 0);
    const [savedBlogs, setSavedBlogs] = useState<IBlog[]>([]);
    const [savedBlogIds, setSavedBlogIds] = useState<string[]>([]);
    const [displayBlogs, setDisplayBlogs] = useState<IBlog[]>(blogs);

    useEffect(() => {
        setDisplayBlogs(blogs);
    }, [blogs]);


    const { mutateAsync: followAndUnfollowFn } = useFollowOrUnfollowMutation();
    const { data: savedBlogsData, refetch: refetchSavedBlogs } = useSavedBlogs(user._id);

    // Custom hook for handling unsave with proper error handling
    const useBlogSaveUnsave = (blogId: string) => {
        const unsaveMutation = useUnsaveBlogMutation(blogId, user._id);

        const handleUnsave = async () => {
            try {
                await unsaveMutation.mutateAsync();

                // Dispatch custom event for real-time updates
                window.dispatchEvent(new CustomEvent('blogSaved', {
                    detail: { blogId, isSaved: false }
                }));

                return true;
            } catch (error) {
                console.error('Failed to unsave blog:', error);
                return false;
            }
        };

        return { handleUnsave, isUnsaveLoading: unsaveMutation.isPending };
    };

    // Update the isBlogSaved function to use both user.saves and savedBlogIds
    const isBlogSaved = (blogId: string) => {
        if (!blogId) return false;

        const blogIdStr = blogId.toString();

        // Check in savedBlogIds first (most reliable)
        const savedIdsStr = savedBlogIds
            .filter(id => id !== undefined && id !== null)
            .map(id => id.toString());
        if (savedIdsStr.includes(blogIdStr)) return true;

        // Fallback: Check in user.saves array
        if (user.saves && Array.isArray(user.saves)) {
            const savesStr = user.saves
                .filter(save => save !== undefined && save !== null)
                .map(save => save.toString());
            if (savesStr.includes(blogIdStr)) return true;
        }

        return false;
    };

    // Update local state when initialUser changes
    useEffect(() => {
        setUser(initialUser);
        setFollowersCount(initialUser.followers.length);
        setSavedBlogsCount(initialUser.saves?.length || 0);

        // Also update savedBlogIds from initialUser.saves
        if (initialUser.saves && Array.isArray(initialUser.saves)) {
            const savedIds = initialUser.saves
                .filter(save => save !== undefined && save !== null)
                .map(save => save.toString());
            setSavedBlogIds(savedIds);
        }
    }, [initialUser]);

    useEffect(() => {
        if (savedBlogsData && isCurrentUser) {
            setSavedBlogs(savedBlogsData);
            // Extract just the blog IDs from saved blogs, filtering out any undefined
            const savedIds = savedBlogsData
                .map((blog: IBlog) => blog._id)
                .filter((id: string | undefined) => id !== undefined && id !== null);
            setSavedBlogIds(savedIds);
            console.log('📚 Saved blog IDs updated:', savedIds);
        }
    }, [savedBlogsData, isCurrentUser]);

    // Check initial follow status
    useEffect(() => {
        if (user.followers && currentUserId) {
            const isUserFollowing = Array.isArray(user.followers)
                ? user.followers.some((follower: string | IUser) =>
                    typeof follower === 'string' ? follower === currentUserId : follower._id === currentUserId
                )
                : false;
            setIsFollowing(isUserFollowing);
        }
    }, [user.followers, currentUserId]);

    // Enhanced blog save/unsave event handler
    useEffect(() => {
        const handleBlogSaved = (event: CustomEvent) => {
            const { blogId, isSaved } = event.detail;

            // Update saved blogs count
            setSavedBlogsCount(prev => isSaved ? prev + 1 : prev - 1);

            // Update savedBlogIds
            setSavedBlogIds(prev => {
                if (isSaved) {
                    return [...prev, blogId];
                } else {
                    return prev.filter(id => id !== blogId);
                }
            });

            // Update user object
            setUser(prevUser => {
                if (isSaved) {
                    return {
                        ...prevUser,
                        saves: [...(prevUser.saves || []), blogId]
                    };
                } else {
                    return {
                        ...prevUser,
                        saves: (prevUser.saves || []).filter((id: string) => id !== blogId)
                    };
                }
            });

            // Refetch saved blogs if we're on the saved tab
            if (activeTab === 'saved' && isCurrentUser) {
                refetchSavedBlogs();
            }
        };

        window.addEventListener('blogSaved', handleBlogSaved as EventListener);

        return () => {
            window.removeEventListener('blogSaved', handleBlogSaved as EventListener);
        };
    }, [activeTab, isCurrentUser, refetchSavedBlogs]);

    const handleFollowAndUnfollow = async () => {
        if (!currentUserId) {
            toast.error('Please login to follow users');
            return;
        }

        const previousFollowState = isFollowing;
        const previousFollowersCount = followersCount;

        // Optimistic update
        setIsFollowing(!isFollowing);
        setFollowersCount(previousFollowState ? followersCount - 1 : followersCount + 1);

        try {
            await followAndUnfollowFn(previousFollowState);

            // Update local user data optimistically
            const updatedFollowers = previousFollowState
                ? user.followers.filter((follower: string | IUser) =>
                    typeof follower === 'string' ? follower !== currentUserId : follower._id !== currentUserId
                )
                : [...user.followers, currentUserId];

            // Update the user object with new state
            setUser(prevUser => ({
                ...prevUser,
                followers: updatedFollowers
            }));

            toast.success(previousFollowState ? 'Unfollowed successfully!' : 'Followed successfully!');

            if (onFollow) {
                onFollow();
            }
        } catch (error) {
            // Revert on error
            setIsFollowing(previousFollowState);
            setFollowersCount(previousFollowersCount);
            console.error('Follow/Unfollow failed:', error);
        }
    };

    const handleShowFollowers = async () => {
        if (user.followers.length > 0 && typeof user.followers[0] === 'string') {
            try {
                const { data } = await apiClient.post('/users/bulk', { ids: user.followers });
                setModalUsers(data.users as IUser[]);
            } catch (error) {
                setModalUsers([]);
            }
        } else {
            setModalUsers(user.followers.length > 0 ? user.followers as unknown as IUser[] : []);
        }
        setModalTitle('Followers');
        setIsFollowModalOpen(true);
    };

    const handleShowFollowing = async () => {
        if (user.following.length > 0 && typeof user.following[0] === 'string') {
            try {
                const { data } = await apiClient.post('/users/bulk', { ids: user.following });
                setModalUsers(data.users as IUser[]);
            } catch (error) {
                setModalUsers([]);
            }
        } else {
            setModalUsers(user.following.length > 0 ? user.following as unknown as IUser[] : []);
        }
        setModalTitle('Following');
        setIsFollowModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsFollowModalOpen(false);
        setTimeout(() => {
            setModalUsers([]);
            setModalTitle('');
        }, 300);
    };

    const handleLogout = async () => {
        try {
            await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
            setTimeout(() => {
                toast.success('Logged out Successfully!');
            }, 1000);
            window.location.reload();
        } catch (error) {
            console.log(error);
            toast.error('Error occurred while logging out!');
        }
    };

    // Add this function in your UserProfile component
    // Add this function in your UserProfile component
    const handleBlogDeleted = (deletedBlogId: string) => {
        // Remove from blogs
        setDisplayBlogs(prev => prev.filter(blog => blog._id !== deletedBlogId));

        // Also remove from saved blogs if it exists there
        setSavedBlogs(prev => prev.filter(blog => blog._id !== deletedBlogId));
        setSavedBlogIds(prev => prev.filter(id => id !== deletedBlogId));

        // Update counts
        setSavedBlogsCount(prev => Math.max(0, prev - 1));
    };
    // Enhanced BlogCard component with proper save/unsave handling
    const EnhancedBlogCard = ({ blog, isSaved }: { blog: IBlog; isSaved: boolean }) => {
        const { handleUnsave, isUnsaveLoading } = useBlogSaveUnsave(blog._id);

        const handleSaveToggle = async () => {
            if (isSaved) {
                // Unsave the blog
                await handleUnsave();
            }
            // Save is handled by BlogCard's internal logic
        };

        return (
            <BlogCard
                {...blog}
                image={
                    typeof blog.image === 'string'
                        ? {
                            url: blog.image,
                            publicId: '',
                            width: 0,
                            height: 0,
                            format: '',
                        }
                        : blog.image
                }
                onLike={() => { }}
                onSave={handleSaveToggle}
                isInitiallySaved={isSaved}
                isSaveLoading={isUnsaveLoading}
                // ADD THIS: Pass the deletion callback
                onBlogDeleted={() => handleBlogDeleted(blog._id)}
            />
        );
    };

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
            <FollowModal
                currentUser={user}
                isOpen={isFollowModalOpen}
                onClose={handleCloseModal}
                title={modalTitle}
                followedUsers={modalUsers}
            />
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentPicture={user.profilePicture?.url}
            />

            <Navbar />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
            >
                {/* ... (rest of the profile header remains the same) ... */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 relative">
                        <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white shadow-lg">
                            <AvatarImage
                                src={user.profilePicture ? user.profilePicture.url : ''}
                                alt={user.username}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600">
                                {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {isCurrentUser && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Pencil className="h-4 w-4 text-indigo-600" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                    {user.username}
                                </h1>
                                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {isCurrentUser ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={handleLogout}
                                            className="gap-2 shadow-sm border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                                        >
                                            <LucideLogOut className="h-4 w-4" />
                                            Logout
                                        </Button>
                                        <Button
                                            onClick={() => setIsEditModalOpen(true)}
                                            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleFollowAndUnfollow}
                                        variant={isFollowing ? "outline" : "default"}
                                        className={`gap-2 transition-all duration-200 ${isFollowing
                                            ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                                            }`}
                                    >
                                        {isFollowing ? (
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
                            </div>
                        </div>

                        {user.bio && (
                            <p className="text-gray-700 max-w-prose leading-relaxed text-lg">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button
                                onClick={handleShowFollowers}
                                className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                                <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {followersCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Followers</p>
                                </div>
                            </button>

                            <button
                                onClick={handleShowFollowing}
                                className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                            >
                                <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {user.following.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Following</p>
                                </div>
                            </button>

                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                <div className="p-2 rounded-full bg-indigo-50">
                                    <Bookmark className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">
                                        {savedBlogsCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Saved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-gray-100 p-1 h-auto rounded-xl mb-8">
                        {[
                            { value: 'blogs', label: 'Blogs' },
                            { value: 'saved', label: 'Saved' },
                            { value: 'about', label: 'About' },
                        ].map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium transition-all duration-200"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TabsContent value="blogs" className="space-y-6">
                            {displayBlogs.length > 0 ? ( // ← Change condition to displayBlogs
                                displayBlogs.map((blog, index) => ( // ← Change to displayBlogs
                                    <motion.div
                                        key={blog._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <EnhancedBlogCard
                                            blog={blog}
                                            isSaved={isBlogSaved(blog._id)}
                                        />
                                    </motion.div>
                                ))
                            ) : (
                                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                                    <div className="mx-auto max-w-md">
                                        <PenSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                            {isCurrentUser
                                                ? "You haven't written any blogs yet"
                                                : 'No blogs published yet'}
                                        </h3>
                                        <p className="text-gray-500 mb-6">
                                            {isCurrentUser
                                                ? 'Start sharing your thoughts with the world'
                                                : 'Check back later for updates'}
                                        </p>
                                        {isCurrentUser && (
                                            <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                                <Pencil className="h-4 w-4" />
                                                Write your first blog
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="saved">
                            {isCurrentUser ? (
                                savedBlogs.length > 0 ? (
                                    <div className="space-y-6">
                                        {savedBlogs.map((blog, index) => (
                                            <motion.div
                                                key={blog._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <EnhancedBlogCard
                                                    blog={blog}
                                                    isSaved={true} // Always true for saved tab
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                                        <div className="mx-auto max-w-md">
                                            <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                                No saved blogs yet
                                            </h3>
                                            <p className="text-gray-500">
                                                Save blogs to read later by clicking the bookmark icon
                                            </p>
                                        </div>
                                    </Card>
                                )
                            ) : (
                                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                                    <div className="mx-auto max-w-md">
                                        <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                            Saved blogs are private
                                        </h3>
                                        <p className="text-gray-500">
                                            Only visible to the account owner
                                        </p>
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="about">
                            <Card className="p-8 space-y-8 border-2 border-dashed border-gray-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-indigo-50 mt-1">
                                        <Mail className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Contact</h3>
                                        <p className="text-gray-700">{user.email}</p>
                                    </div>
                                </div>

                                {user.bio && (
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-full bg-indigo-50 mt-1">
                                            <Pencil className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900 mb-2">Bio</h3>
                                            <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-full bg-indigo-50 mt-1">
                                        <Calendar className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 mb-2">Joined</h3>
                                        <p className="text-gray-700">
                                            {new Date(user.createdAt as unknown as string).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

const ProfileSkeleton = () => {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <Skeleton className="h-36 w-36 rounded-full" />
                    <div className="flex-1 space-y-4 w-full">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </div>
                        <Skeleton className="h-5 w-full max-w-prose" />
                        <Skeleton className="h-5 w-3/4 max-w-prose" />
                        <div className="flex flex-wrap gap-4 pt-2">
                            {[...Array(3)].map((_, i) => (
                                <Skeleton key={i} className="h-14 w-24 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Skeleton className="h-12 w-96 rounded-xl" />
            </div>

            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-xl p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between pt-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserProfile;