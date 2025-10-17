import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "../NormalComponents/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useDebounce from "@/customHooks/useDebounce";
import useFollowOrUnfollowMutation from "@/customHooks/Follow&Unfollow";
import useSuggestedUserData from "@/customHooks/SuggestedUserFetching";
import useFeedData from "@/customHooks/MainFeedData";
import useFeedRefresh from "@/customHooks/RefreshFeeds";

const ProfileModal = lazy(() => import("./SocialComponents/UserProfileModal"));
import UserFeed from "../FEED/FeedComponents/UserFeedBlogs";
import type { IBlog, IUser } from "@/types";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import RightSidebar from "../FEED/FeedComponents/RightSidebar";
import { trendingTopics } from "@/constants/dummyData";



const SuggestedUsers = React.memo(function SuggestedUsers({
    users,
    isLoading,
    searchQuery,
    setSearchQuery,
    onUserClick,
    onFollow,
    followedUsers,
}: {
    users: IUser[];
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    onUserClick: (user: IUser) => void;
    onFollow: (userId: string) => void;
    followedUsers: string[];
}) {
    const debouncedQuery = useDebounce(searchQuery, 300);

    const filteredUsers = useMemo(() => {
        if (!Array.isArray(users)) return [];
        const q = debouncedQuery.toLowerCase();
        return users.filter(
            (user) =>
                !followedUsers.includes(user._id) &&
                (user.username.toLowerCase().includes(q) ||
                    user.email.toLowerCase().includes(q))
        );
    }, [users, followedUsers, debouncedQuery]);

    if (isLoading) return <SuggestedUsersSkeleton />;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    <span>Suggested Creators</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mb-4"
                />

                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <motion.div
                            key={user._id}
                            whileHover={{ y: -2 }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => onUserClick(user)}
                        >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                    <AvatarImage src={user.profilePicture?.url} />
                                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">{user.username}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                        @{user.username} · {user.followers.length} followers
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFollow(user._id);
                                }}
                                className="gap-1 text-xs flex-shrink-0"
                            >
                                <UserPlus className="h-3 w-3" /> Follow
                            </Button>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center">
                        {debouncedQuery ? "No users found." : "No suggestions."}
                    </p>
                )}
            </CardContent>
        </Card>
    );
});

const SocialComponent = () => {
    const { data: userData, isLoading: isUserLoading, refetch: refetchUserData } =
        useUserProfileData();
    const { data: suggestedUsersData, isLoading: isSuggestedUsersLoading } =
        useSuggestedUserData(userData?._id ?? "");

    const { mutateAsync: followMutate } = useFollowOrUnfollowMutation();

    const [activeTab, setActiveTab] = useState("following");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [followedUsers, setFollowedUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const { activeData, isPending, error, refetchFeed, refetchFollowing, refetchPopular } =
        useFeedData(userData?._id || "", activeTab, searchQuery, currentPage);

    const refreshFeed = useFeedRefresh({
        refetchFeed,
        refetchFollowing,
        refetchPopular,
        activeTab,
        searchQuery,
    });

    useEffect(() => {
        if (userData?.following) {
            setFollowedUsers(userData.following.map(String));
        }
    }, [userData]);

    const handleFollow = useCallback(
        async (userId: string) => {
            const isFollowing = followedUsers.includes(userId);
            const prev = [...followedUsers];
            setFollowedUsers((p) =>
                isFollowing ? p.filter((id) => id !== userId) : [...p, userId]
            );

            try {
                await followMutate({
                    targetUserId: userId,
                    currentUserId: userData?._id || "",
                    isCurrentlyFollowing: isFollowing,
                });
                await refetchUserData();
            } catch {
                setFollowedUsers(prev);
            }
        },
        [followedUsers, followMutate, userData?._id, refetchUserData]
    );

    const handleUserClick = useCallback((user: IUser) => {
        setSelectedUser(user);
        setModalOpen(true);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        refreshFeed();
    }, [activeTab, refreshFeed]);

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Navbar />

                <Tabs defaultValue="following" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-center p-2">
                        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl sm:max-w-lg">
                            <TabsTrigger value="following">Following</TabsTrigger>
                            <TabsTrigger value="trending">Trending</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-4">
                            <SuggestedUsers
                                users={suggestedUsersData || []}
                                isLoading={isSuggestedUsersLoading}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                onUserClick={handleUserClick}
                                onFollow={handleFollow}
                                followedUsers={followedUsers}
                            />
                            <RightSidebar />
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-4">
                            <TabsContent value="following">
                                <UserFeed
                                    userFeedData={activeData}
                                    userFeedDataError={error}
                                    userDataPending={isUserLoading}
                                    userFeedDataPending={isPending}
                                    onPageChange={handlePageChange}
                                    onRefresh={refreshFeed}
                                    currentPage={currentPage}
                                    feedTitle="Following Feed"
                                />
                            </TabsContent>
                            <TabsContent value="trending">
                                <UserFeed
                                    userFeedData={activeData}
                                    userFeedDataError={error}
                                    userDataPending={isUserLoading}
                                    userFeedDataPending={isPending}
                                    onPageChange={handlePageChange}
                                    onRefresh={refreshFeed}
                                    currentPage={currentPage}
                                    feedTitle="Trending Posts"
                                />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>

            <Suspense fallback={null}>
                {selectedUser && (
                    <ProfileModal
                        user={selectedUser}
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        isFollowingUser={followedUsers.includes(selectedUser._id)}
                        handleFollowAndUnfollow={() =>
                            handleFollow(selectedUser._id)
                        }
                        currentUserId={userData?._id}
                        blogs={selectedUser.userBlogs as unknown as IBlog[]}
                    />
                )}
            </Suspense>
        </>
    );
};

export const SuggestedUsersSkeleton = () => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-7 w-16 rounded-lg" />
                </div>
            ))}
        </CardContent>
    </Card>
);

export default React.memo(SocialComponent);
