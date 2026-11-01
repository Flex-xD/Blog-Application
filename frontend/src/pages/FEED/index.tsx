import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import CreateBlogCard from "./FeedComponents/CreateBlogCard";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { FeedNavbar } from "./FeedComponents/FeedNavbar";
import RightSidebar from "./FeedComponents/RightSidebar";
import CreateBlogCardModal from "./FeedComponents/CreateBlogcardModal";
import CreateAIModal from "./FeedComponents/AIEnhancerModal";
import UserFeed from "./FeedComponents/UserFeedBlogs";
import FeedTabs from "./FeedComponents/Tabs";
import useFeedRefresh from "@/customHooks/RefreshFeeds";
import useFeedData from "@/customHooks/MainFeedData";
import BlogFormProvider from "@/context";
import type { IBlog } from "@/types";
import type { UserFeedData } from "@/customHooks/UserFeedFetching";

const NEW_POSTS_POLL_MS = 60_000;

type FeedPagination = UserFeedData["data"]["pagination"];

const Feed = () => {
    const [activeTab, setActiveTab] = useState("for-you");
    const isCreatingBlog = useAppStore.getState().isCreatingBlog;
    const [showCreateModal, setShowCreateModal] =
        useState(isCreatingBlog);
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedTone, setSelectedTone] = useState("");
    const [customInstructions, setCustomInstructions] = useState("");
    const [contentToEnhance, setContentToEnhance] = useState("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    const [page, setPage] = useState(1);
    const [feedItems, setFeedItems] = useState<IBlog[]>([]);
    const [pendingNew, setPendingNew] = useState<IBlog[]>([]);
    const [pagination, setPagination] =
        useState<FeedPagination | null>(null);

    const { data: userData, isPending: userDataPending } =
        useUserProfileData();

    /* ? Remove "" later on */
    const userId = userData?._id ?? "";

    const {
        activeData,
        isPending: activePending,
        error: activeError,
        refetchFeed,
        refetchFollowing,
        refetchPopular,
    } = useFeedData(userId, activeTab, searchQuery, page);

    const {
        activeData: newestData,
        refetchFeed: refetchNewestFeed,
        refetchFollowing: refetchNewestFollowing,
        refetchPopular: refetchNewestPopular,
    } = useFeedData(userId, activeTab, searchQuery, 1);

    const refreshFeed = useFeedRefresh({
        refetchFeed,
        refetchFollowing,
        refetchPopular,
        activeTab,
        searchQuery,
    });

    const checkForNewPosts = useFeedRefresh({
        refetchFeed: refetchNewestFeed,
        refetchFollowing: refetchNewestFollowing,
        refetchPopular: refetchNewestPopular,
        activeTab,
        searchQuery,
    });

    useEffect(() => {
        if (activeData?.data?.pagination) {
            setPagination(activeData.data.pagination);
        }
    }, [activeData]);

    useEffect(() => {
        if (!activeData?.data) return;

        const blogs = activeData.data.blogs ?? [];

        if (page === 1) {
            setFeedItems((prev) =>
                prev.length === 0 ? blogs : prev
            );
        } else {
            setFeedItems((prev) => {
                const known = new Set(
                    prev.map((blog) => blog._id)
                );

                return [
                    ...prev,
                    ...blogs.filter(
                        (blog) => !known.has(blog._id)
                    ),
                ];
            });
        }
    }, [activeData, page]);

    useEffect(() => {
        const newest = newestData?.data?.blogs ?? [];

        if (newest.length === 0 || feedItems.length === 0) return;

        const known = new Set(
            feedItems.map((blog) => blog._id)
        );

        setPendingNew(
            newest.filter((blog) => !known.has(blog._id))
        );
    }, [newestData, feedItems]);

    useEffect(() => {
        if (searchQuery.trim()) return;

        const timerId = window.setInterval(() => {
            if (document.hidden) return;

            checkForNewPosts();
        }, NEW_POSTS_POLL_MS);

        return () => window.clearInterval(timerId);
    }, [checkForNewPosts, searchQuery]);

    useEffect(() => {
        setPage(1);
        setFeedItems([]);
        setPendingNew([]);
        setPagination(null);

        refreshFeed();
    }, [activeTab, refreshFeed]);

    useEffect(() => {
        setShowCreateModal(isCreatingBlog);
    }, [isCreatingBlog]);

    const loadMore = useCallback(() => {
        if (activePending || activeError) return;

        setPage((prev) => prev + 1);
    }, [activePending, activeError]);

    const showNewPosts = useCallback(() => {
        setFeedItems((prev) => {
            const known = new Set(
                prev.map((blog) => blog._id)
            );

            return [
                ...pendingNew.filter(
                    (blog) => !known.has(blog._id)
                ),
                ...prev,
            ];
        });

        setPendingNew([]);
        setPage(1);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [pendingNew]);

    const feedView: UserFeedData | undefined = pagination
        ? {
              data: {
                  blogs: feedItems,
                  pagination: {
                      page: 1,
                      limit: pagination.limit,
                      total: pagination.total,
                      hasMore: pagination.hasMore,
                      totalPages: pagination.totalPages,
                      nextPage: null,
                      prevPage: null,
                  },
              },
          }
        : undefined;

    const handleWrite = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    return (
        <BlogFormProvider>
            <div className="min-h-screen bg-background">
                <FeedNavbar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onWrite={handleWrite}
                />

                <main className="mx-auto w-full max-w-[42rem] px-4 pb-24 pt-4 sm:px-6">
                    <FeedTabs
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    <CreateBlogCard
                        setShowCreateModal={setShowCreateModal}
                    />

                    <UserFeed
                        userFeedData={feedView}
                        userFeedDataError={activeError}
                        userDataPending={userDataPending}
                        userFeedDataPending={activePending}
                        onRefresh={refreshFeed}
                        onLoadMore={loadMore}
                        newPostCount={pendingNew.length}
                        onShowNewPosts={showNewPosts}
                        showRefresh={false}
                        feedTitle={
                            searchQuery.trim()
                                ? `Results for "${searchQuery}"`
                                : undefined
                        }
                    />

                    <RightSidebar className="mt-12" />
                </main>

                <AnimatePresence>
                    {showCreateModal && (
                        <CreateBlogCardModal
                            show={showCreateModal}
                            setShow={setShowCreateModal}
                            setShowAIModal={setShowAIModal}
                            onPostSuccess={refreshFeed}
                        />
                    )}

                    {showAIModal && (
                        <CreateAIModal
                            key="create-ai-modal"
                            show={showAIModal}
                            selectedTone={selectedTone}
                            customInstructions={customInstructions}
                            contentToEnhance={contentToEnhance}
                            setShow={setShowAIModal}
                            setSelectedTone={setSelectedTone}
                            setCustomInstructions={setCustomInstructions}
                            setContentToEnhance={setContentToEnhance}
                        />
                    )}
                </AnimatePresence>
            </div>
        </BlogFormProvider>
    );
};

export default Feed;