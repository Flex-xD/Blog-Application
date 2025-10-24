import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, Bookmark, UserPlus, Users, Mail, PenSquare, LucideLogOut, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { BlogCard } from '@/pages/NormalComponents/BlogCard';
import type { IBlog, IUser } from '@/types';
import Navbar from '@/pages/NormalComponents/Navbar';
import apiClient from '@/utility/axiosClient';
import { AUTH_ENDPOINTS, BLOG_ENDPOINTS } from '@/constants/constants';
import { toast } from 'sonner';
import FollowModal from '../ProfileComponents/followersAndFollowingModal';
import { EditProfileModal } from '../ProfileComponents/EditProfileModal';
import useFollowOrUnfollowMutation from '@/customHooks/Follow&Unfollow';
import useUnsaveBlogMutation from '@/customHooks/unsaveBlog';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/queryKeys';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
    user: IUser;
    blogs: IBlog[];
    isLoading?: boolean;
    isCurrentUser?: boolean;
    onFollow?: () => void;
    currentUserId?: string;
}

// Fetch saved blogs
const useSavedBlogs = (userId: string) =>
    useQuery({
        queryKey: QUERY_KEYS.BLOGS.SAVED(userId),
        queryFn: async () => {
            const { data } = await apiClient.get(BLOG_ENDPOINTS.USER_SAVED_BLOGS);
            return data.data || [];
        },
        enabled: !!userId,
    });

export const UserProfile: React.FC<UserProfileProps> = ({
    user: initialUser,
    blogs,
    isLoading = false,
    isCurrentUser = false,
    onFollow,
    currentUserId = '',
}) => {
    const { logout } = useAppStore();
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
    const navigate = useNavigate();

    const { mutateAsync: followAndUnfollowFn } = useFollowOrUnfollowMutation();
    const { data: savedBlogsData, refetch: refetchSavedBlogs } = useSavedBlogs(user._id);

    useEffect(() => setDisplayBlogs(blogs), [blogs]);

    const isBlogSaved = useCallback(
        (blogId: string) => {
            if (!blogId) return false;
            const blogIdStr = blogId.toString();
            const savedIdsStr = savedBlogIds.map(id => id.toString());
            if (savedIdsStr.includes(blogIdStr)) return true;
            if (user.saves && Array.isArray(user.saves)) {
                return user.saves.map(s => s.toString()).includes(blogIdStr);
            }
            return false;
        },
        [savedBlogIds, user.saves]
    );

    useEffect(() => {
        setUser(initialUser);
        setFollowersCount(initialUser.followers.length);
        setSavedBlogsCount(initialUser.saves?.length || 0);
        setSavedBlogIds(
            initialUser.saves?.map(s => s.toString()).filter(Boolean) || []
        );
    }, [initialUser]);

    useEffect(() => {
        if (savedBlogsData && isCurrentUser) {
            setSavedBlogs(savedBlogsData);
            const savedIds = savedBlogsData.map((b: { _id: any; }) => b._id).filter(Boolean);
            setSavedBlogIds(savedIds);
        }
    }, [savedBlogsData, isCurrentUser]);

    useEffect(() => {
        if (user.followers && currentUserId) {
            const following = user.followers.some(f =>
                typeof f === 'string' ? f === currentUserId : f._id === currentUserId
            );
            setIsFollowing(following);
        }
    }, [user.followers, currentUserId]);

    useEffect(() => {
        const handleBlogSaved = (event: CustomEvent) => {
            const { blogId, isSaved } = event.detail;
            setSavedBlogsCount(prev => (isSaved ? prev + 1 : prev - 1));
            setSavedBlogIds(prev =>
                isSaved ? [...prev, blogId] : prev.filter(id => id !== blogId)
            );
            setUser(prev => ({
                ...prev,
                saves: isSaved
                    ? [...(prev.saves || []), blogId]
                    : (prev.saves || []).filter(id => id !== blogId),
            }));
            if (activeTab === 'saved' && isCurrentUser) refetchSavedBlogs();
        };
        window.addEventListener('blogSaved', handleBlogSaved as EventListener);
        return () =>
            window.removeEventListener('blogSaved', handleBlogSaved as EventListener);
    }, [activeTab, isCurrentUser, refetchSavedBlogs]);

    const handleFollowAndUnfollow = async () => {
        if (!currentUserId) {
            toast.error('Please login to follow users');
            return;
        }
        const prevState = isFollowing;
        const prevCount = followersCount;
        setIsFollowing(!isFollowing);
        setFollowersCount(prevState ? followersCount - 1 : followersCount + 1);
        try {
            await followAndUnfollowFn(prevState);
            const updatedFollowers = prevState
                ? user.followers.filter(f =>
                    typeof f === 'string' ? f !== currentUserId : f._id !== currentUserId
                )
                : [...user.followers, currentUserId];
            setUser(prev => ({ ...prev, followers: updatedFollowers }));
            toast.success(prevState ? 'Unfollowed successfully!' : 'Followed successfully!');
            onFollow?.();
        } catch (error) {
            setIsFollowing(prevState);
            setFollowersCount(prevCount);
            console.error('Follow/Unfollow failed:', error);
        }
    };

    const fetchUsersBulk = async (ids: (string | IUser)[]) => {
        if (!ids.length) return [];
        if (typeof ids[0] === 'string') {
            try {
                const { data } = await apiClient.post('/users/bulk', { ids });
                return data.users;
            } catch {
                return [];
            }
        }
        return ids as IUser[];
    };

    const handleShowFollowers = async () => {
        const users = await fetchUsersBulk(user.followers);
        setModalUsers(users);
        setModalTitle('Followers');
        setIsFollowModalOpen(true);
    };

    const handleShowFollowing = async () => {
        const users = await fetchUsersBulk(user.following);
        setModalUsers(users);
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
            logout();
            toast.success('Logged out Successfully!');
            setTimeout(() => navigate("/auth", { replace: true }), 500);
        } catch {
            toast.error('Error occurred while logging out!');
        }
    };

    const handleBlogDeleted = useCallback((deletedBlogId: string) => {
        setDisplayBlogs(prev => prev.filter(blog => blog._id !== deletedBlogId));
        setSavedBlogs(prev => prev.filter(blog => blog._id !== deletedBlogId));
        setSavedBlogIds(prev => prev.filter(id => id !== deletedBlogId));
        setSavedBlogsCount(prev => Math.max(0, prev - 1));
    }, []);

    // BlogCard memoized
    const EnhancedBlogCard = useCallback(
        ({ blog, isSaved }: { blog: IBlog; isSaved: boolean }) => {
            const unsaveMutation = useUnsaveBlogMutation(blog._id, user._id);
            const handleUnsave = async () => {
                try {
                    await unsaveMutation.mutateAsync();
                    window.dispatchEvent(
                        new CustomEvent('blogSaved', { detail: { blogId: blog._id, isSaved: false } })
                    );
                } catch (error) {
                    console.error('Failed to unsave blog:', error);
                }
            };
            const handleSaveToggle = async () => {
                if (isSaved) await handleUnsave();
            };
            return (
                <BlogCard
                    {...blog}
                    image={typeof blog.image === 'string' ? { url: blog.image, publicId: '', width: 0, height: 0, format: '' } : blog.image}
                    onSave={handleSaveToggle}
                    isInitiallySaved={isSaved}
                    isSaveLoading={unsaveMutation.isPending}
                    onBlogDeleted={() => handleBlogDeleted(blog._id)}
                />
            );
        },
        [user._id, handleBlogDeleted]
    );

    if (isLoading) return <ProfileSkeleton />;

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
                {/* Profile header */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 relative">
                        <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-white shadow-lg">
                            <AvatarImage src={user.profilePicture?.url || ''} alt={user.username} className="object-cover" />
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
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{user.username}</h1>
                                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4" /> {user.email}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                {isCurrentUser ? (
                                    <>
                                        <Button variant="outline" onClick={handleLogout} className="gap-2 shadow-sm border-gray-300 hover:bg-gray-50 transition-colors duration-200">
                                            <LucideLogOut className="h-4 w-4" /> Logout
                                        </Button>
                                        <Button onClick={() => setIsEditModalOpen(true)} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg transition-all duration-200">
                                            <Pencil className="h-4 w-4" /> Edit Profile
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleFollowAndUnfollow}
                                        variant={isFollowing ? 'outline' : 'default'}
                                        className={`gap-2 transition-all duration-200 ${isFollowing
                                            ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                                            }`}
                                    >
                                        {isFollowing ? <><Check className="h-4 w-4" /> Following</> : <><UserPlus className="h-4 w-4" /> Follow</>}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {user.bio && <p className="text-gray-700 max-w-prose leading-relaxed text-lg">{user.bio}</p>}

                        <div className="flex flex-wrap gap-4 pt-2">
                            <button onClick={handleShowFollowers} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-lg">{followersCount}</p>
                                    <p className="text-xs text-muted-foreground">Followers</p>
                                </div>
                            </button>

                            <button onClick={handleShowFollowing} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
                                <div className="p-2 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors duration-200">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900 text-lg">{user.following.length}</p>
                                    <p className="text-xs text-muted-foreground">Following</p>
                                </div>
                            </button>

                            <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-200">
                                <div className="p-2 rounded-full bg-indigo-50">
                                    <Bookmark className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-lg">{savedBlogsCount}</p>
                                    <p className="text-xs text-muted-foreground">Saved</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-gray-100 p-1 h-auto rounded-xl mb-8">
                        {[
                            { value: 'blogs', label: 'Blogs' },
                            { value: 'saved', label: 'Saved' },
                            { value: 'about', label: 'About' },
                        ].map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value} className="py-3 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 font-medium transition-all duration-200">
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                        <TabsContent value="blogs" className="space-y-6">
                            {displayBlogs.length ? (
                                displayBlogs.map((blog, i) => (
                                    <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                                        <EnhancedBlogCard blog={blog} isSaved={isBlogSaved(blog._id)} />
                                    </motion.div>
                                ))
                            ) : (
                                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                                    <div className="mx-auto max-w-md">
                                        <PenSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">{isCurrentUser ? "You haven't written any blogs yet" : 'No Blogs Yet'}</h3>
                                        <p className="text-sm text-gray-500">Start creating amazing content today!</p>
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="saved" className="space-y-6">
                            {isCurrentUser && savedBlogs.length ? (
                                savedBlogs.map((blog, i) => (
                                    <motion.div key={blog._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.1 }}>
                                        <EnhancedBlogCard blog={blog} isSaved={true} />
                                    </motion.div>
                                ))
                            ) : (
                                <Card className="text-center py-16 border-2 border-dashed border-gray-200">
                                    <div className="mx-auto max-w-md">
                                        <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-700 mb-3">No Saved Blogs Yet</h3>
                                        <p className="text-sm text-gray-500">Save blogs to access them here anytime.</p>
                                    </div>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="about" className="space-y-6">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">About {user.username}</h3>
                                <p className="text-gray-700">
                                    Joined {user.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'No bio available.'}
                                </p>
                            </Card>

                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
};

// Skeleton placeholder
const ProfileSkeleton = () => (
    <div className="max-w-6xl mx-auto px-4 py-6">
        <Skeleton className="h-36 w-36 rounded-full mb-6 mx-auto" />
        <Skeleton className="h-6 w-1/3 mb-2 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
        <div className="space-y-4 mt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
);

export default UserProfile;
