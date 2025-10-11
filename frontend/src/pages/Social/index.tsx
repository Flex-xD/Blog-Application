import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, UserPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input"; // Add Input component from ShadCN
import Navbar from "../Components/Navbar";
import type { IBlog, IUser } from "@/types";
import useFollowOrUnfollowMutation from "@/customHooks/Follow&Unfollow";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import useSuggestedUserData from "@/customHooks/SuggestedUserFetching";
import useUserFollowingBlogsData from "@/customHooks/FollowingBlogs";
import usePopularBlogs from "@/customHooks/PopularBlogsFetching";
import useSearchUsersQuery from "@/customHooks/useSearchUsersQuery"; // Import the search users hook
import useDebounce from "@/customHooks/useDebounce"; // Import the debounce hook
import ProfileModal from "./components/UserProfileModal";
import UserFeed from "../FEED/components/UserFeedBlogs";

type TrendingTopic = {
    id: string;
    name: string;
    postCount: number;
};

interface FeedData {
    data: {
        blogs: IBlog[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasMore: boolean;
            nextPage: number | null;
            prevPage: number | null;
        };
    };
    success: boolean;
    msg: string;
}

const trendingTopics: TrendingTopic[] = [
    { id: "1", name: "#ReactJS", postCount: 1250 },
    { id: "2", name: "#DesignSystems", postCount: 892 },
    { id: "3", name: "#WebDev", postCount: 756 },
    { id: "4", name: "#UX", postCount: 654 },
    { id: "5", name: "#JavaScript", postCount: 543 },
];

const SocialComponent = () => {
    const { data: userData, isLoading: isUserLoading, refetch: refetchUserData } = useUserProfileData();
    const { data: suggestedUsersData, isLoading: isSuggestedUsersLoading } = useSuggestedUserData(userData?._id ?? "");
    const { mutateAsync: followAndUnfollowFn } = useFollowOrUnfollowMutation();
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState("following");
    const [searchQuery, setSearchQuery] = useState(""); // State for search input
    const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce with 300ms delay

    const { data: userFollowingBlogs, isPending: followingBlogsPending, refetch: refetchFollowingBlogs } = useUserFollowingBlogsData(
        userData?._id || "",
        activeTab === "following" ? currentPage : 1
    );
    const { data: popularBlogs, isPending: popularBlogsPending } = usePopularBlogs(
        activeTab === "trending" ? currentPage : 1
    );

    // Fetch searched users with debounced query
    const { data: searchedUsersData, isLoading: isSearchUsersLoading } = useSearchUsersQuery({
        userId: userData?._id || "",
        query: debouncedSearchQuery,
        page: 1,
        limit: 10,
    });

    const [followedUsers, setFollowedUsers] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

    // Initialize followed users from backend
    useEffect(() => {
        if (userData?.following) {
            setFollowedUsers(userData.following.map((f) => f.toString()));
        }
    }, [userData]);

    // Handle follow/unfollow with optimistic update + refetch
    const handleFollowAndUnfollow = useCallback(
        async (userId: string, isFollowing: boolean) => {
            const previousFollowedUsers = [...followedUsers];
            const newFollowedUsers = isFollowing
                ? followedUsers.filter((id) => id !== userId)
                : [...followedUsers, userId];

            setFollowedUsers(newFollowedUsers);

            try {
                await followAndUnfollowFn({
                    targetUserId: userId,
                    currentUserId: userData?._id || "",
                    isCurrentlyFollowing: isFollowing,
                });
                await refetchUserData();
            } catch (error) {
                setFollowedUsers(previousFollowedUsers);
                console.error("Follow/Unfollow failed:", error);
            }
        },
        [followedUsers, followAndUnfollowFn, userData?._id, refetchUserData]
    );

    const handleUserClick = useCallback((user: IUser) => {
        setSelectedUser(user);
        setProfileModalOpen(true);
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRefresh = () => {
        setCurrentPage(1);
        if (activeTab === "following") {
            refetchFollowingBlogs();
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Determine which data to display based on activeTab
    const getActiveData = (): FeedData | undefined => {
        switch (activeTab) {
            case "following":
                return userFollowingBlogs as FeedData | undefined;
            case "trending":
                return popularBlogs as FeedData | undefined;
            default:
                return undefined;
        }
    };

    // Determine pending state based on activeTab
    const getActivePendingState = () => {
        switch (activeTab) {
            case "following":
                return followingBlogsPending;
            case "trending":
                return popularBlogsPending;
            default:
                return false;
        }
    };

    // Determine error state based on activeTab
    const getActiveError = (): Error | null | undefined => {
        switch (activeTab) {
            case "following":
                if (userFollowingBlogs?.error) {
                    return new Error(userFollowingBlogs.error.msg || "Failed to fetch following blogs");
                }
                return null;
            case "trending":
                if (popularBlogs?.error) {
                    return new Error(popularBlogs.error.msg || "Failed to fetch popular blogs");
                }
                return null;
            default:
                return null;
        }
    };

    const activeData = getActiveData();
    const activePending = getActivePendingState();
    const activeError = getActiveError();

    // Filter suggested users based on debounced search query
    const filteredSuggestedUsers = debouncedSearchQuery
        ? (searchedUsersData?.data?.users || []).filter(
            (user) =>
                !followedUsers.includes(user._id) &&
                (user.username.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
        )
        : Array.isArray(suggestedUsersData)
            ? suggestedUsersData.filter((user) => !followedUsers.includes(user._id))
            : [];

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Navbar />

                <Tabs defaultValue="following" className="w-full" onValueChange={setActiveTab}>
                    <div className="flex items-center justify-center p-2">
                        <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 p-1 rounded-xl sm:max-w-lg">
                            <TabsTrigger value="following" className="text-xs sm:text-sm">Following</TabsTrigger>
                            <TabsTrigger value="trending" className="text-xs sm:text-sm">Trending</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                        {/* Left Column */}
                        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                            {(isSuggestedUsersLoading || isSearchUsersLoading) ? (
                                <SuggestedUsersSkeleton />
                            ) : (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                                            <span>Suggested Creators</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Search Input */}
                                        <Input
                                            type="text"
                                            placeholder="Search users by username or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="mb-4"
                                        />
                                        {filteredSuggestedUsers.length > 0 ? (
                                            filteredSuggestedUsers.map((user) => (
                                                <motion.div
                                                    key={user._id}
                                                    whileHover={{ y: -2 }}
                                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                                    onClick={() => handleUserClick(user)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === "Enter" && handleUserClick(user)}
                                                >
                                                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                                            <AvatarImage src={user.profilePicture?.url} alt={user.username} />
                                                            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-sm sm:text-base truncate">{user.username}</p>
                                                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                                                @{user.username} · {user.followers.length} followers
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFollowAndUnfollow(user._id, false);
                                                        }}
                                                        className="gap-1 text-xs sm:text-sm flex-shrink-0 ml-3 sm:ml-4"
                                                        aria-label={`Follow ${user.username}`}
                                                    >
                                                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" /> Follow
                                                    </Button>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center">
                                                {debouncedSearchQuery ? "No users found for your search." : "No suggested users available."}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Trending Topics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                                        <span>Trending Topics</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {trendingTopics.map((topic, index) => (
                                        <motion.div
                                            key={topic.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <p className="font-medium text-primary text-sm sm:text-base">{topic.name}</p>
                                            <p className="text-xs sm:text-sm text-muted-foreground">
                                                {topic.postCount.toLocaleString()} posts this week
                                            </p>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-4 sm:space-y-6">
                            <TabsContent value="following">
                                <UserFeed
                                    userFeedData={
                                        activeData && activeData.data
                                            ? {
                                                ...activeData,
                                                data: {
                                                    ...activeData.data,
                                                    pagination: {
                                                        ...activeData.data.pagination,
                                                        totalPages: activeData.data.pagination?.totalPages ?? 0,
                                                        nextPage: activeData.data.pagination?.nextPage ?? null,
                                                        prevPage: activeData.data.pagination?.prevPage ?? null,
                                                    },
                                                },
                                            }
                                            : undefined
                                    }
                                    userFeedDataError={activeError}
                                    userDataPending={isUserLoading}
                                    userFeedDataPending={activePending}
                                    onPageChange={handlePageChange}
                                    onRefresh={handleRefresh}
                                    currentPage={currentPage}
                                    feedTitle="Following Feed"
                                />
                            </TabsContent>

                            <TabsContent value="trending">
                                <UserFeed
                                    userFeedData={
                                        activeData && activeData.data
                                            ? {
                                                ...activeData,
                                                data: {
                                                    ...activeData.data,
                                                    pagination: {
                                                        ...activeData.data.pagination,
                                                        totalPages: activeData.data.pagination?.totalPages ?? 0,
                                                        nextPage: activeData.data.pagination?.nextPage ?? null,
                                                        prevPage: activeData.data.pagination?.prevPage ?? null,
                                                    },
                                                },
                                            }
                                            : undefined
                                    }
                                    userFeedDataError={activeError}
                                    userDataPending={isUserLoading}
                                    userFeedDataPending={activePending}
                                    onPageChange={handlePageChange}
                                    onRefresh={handleRefresh}
                                    currentPage={currentPage}
                                    feedTitle="Trending Posts"
                                />
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>

            {selectedUser && (
                <ProfileModal
                    user={selectedUser}
                    isOpen={profileModalOpen}
                    onClose={() => setProfileModalOpen(false)}
                    isFollowingUser={followedUsers.includes(selectedUser._id)}
                    handleFollowAndUnfollow={() =>
                        handleFollowAndUnfollow(selectedUser._id, followedUsers.includes(selectedUser._id))
                    }
                    currentUserId={userData?._id}
                    blogs={selectedUser.userBlogs as unknown as IBlog[]}
                />
            )}
        </>
    );
};

// Suggested Users Skeleton
export function SuggestedUsersSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 sm:h-5 sm:w-5" />
                    <Skeleton className="h-4 w-32 sm:h-5 sm:w-40" />
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full mb-4" /> {/* Skeleton for search input */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-24 sm:h-4 sm:w-32" />
                                <Skeleton className="h-2 w-16 sm:h-3 sm:w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-7 w-16 sm:h-8 sm:w-20 rounded-lg" />
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default SocialComponent;
