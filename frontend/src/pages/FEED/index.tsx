import  { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import { trendingTopics } from "@/constants/dummyData";
import  CreateBlogCard  from "./components/CreateBlogCard";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { FeedNavbar } from "./components/FeedNavbar";
import RightSidebar from "./components/RightSidebar";
import CreateBlogCardModal from "./components/CreateBlogcardModal";
import CreateAIModal from "./components/AIEnhancerModal";
import UserFeed from "./components/UserFeedBlogs";
import FeedTabs from "./components/Tabs";
import useFeedRefresh from "@/customHooks/RefreshFeeds";
import useFeedData from "@/customHooks/MainFeedData";
import BlogFormProvider from "@/context";

const Feed = () => {
    const [activeTab, setActiveTab] = useState("for-you");
    const { isCreatingBlog } = useAppStore();
    const [showCreateModal, setShowCreateModal] = useState(isCreatingBlog);
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedTone, setSelectedTone] = useState<string>("");
    const [customInstructions, setCustomInstructions] = useState<string>("");
    const [contentToEnhance, setContentToEnhance] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const { data: userData, isPending: userDataPending } = useUserProfileData();


    // * USER FEED FETCHING
    const { activeData, isPending: activePending, error: activeError, refetchFeed, refetchFollowing, refetchPopular } = useFeedData(
        userData?._id || "", activeTab, searchQuery, currentPage
    );

    const refreshFeed = useFeedRefresh({ refetchFeed, refetchFollowing, refetchPopular, activeTab, searchQuery })


    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        if (activeData?.data?.pagination && !activeData.data.pagination.hasMore && currentPage > 1) {
            setCurrentPage(1);
        }
    }, [activeData, currentPage]);
    useEffect(() => {
        setShowCreateModal(isCreatingBlog);
    }, [isCreatingBlog]);

    useEffect(() => {
        setCurrentPage(1);
        refreshFeed();
    }, [activeTab, refreshFeed]);

    return (
        <BlogFormProvider>
            <div className="min-h-screen bg-gray-50">
                <FeedNavbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <CreateBlogCard
                                setShowCreateModal={setShowCreateModal}
                            />
                            <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
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
                                userDataPending={userDataPending}
                                userFeedDataPending={activePending}
                                onPageChange={handlePageChange}
                                onRefresh={refreshFeed}
                                currentPage={currentPage}
                                feedTitle={
                                    searchQuery
                                        ? `Search Results for "${searchQuery}"`
                                        : activeTab === "following"
                                            ? "Following Feed"
                                            : activeTab === "trending"
                                                ? "Trending Posts"
                                                : "Your Feed"
                                }
                            />
                        </div>
            
                            <RightSidebar
                                trendingTopics={trendingTopics}
                            />
                        
                    </div>
                </div>
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