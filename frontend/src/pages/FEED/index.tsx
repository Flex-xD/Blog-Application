import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import usePostUserBlog from "@/customHooks/PostUserBlog";
import useUserFeedData from "@/customHooks/UserFeedFetching";
import { fakeUsersArray, trendingTopics } from "@/constants/dummyData";
import { CreateBlogCard } from "./components/CreateBlogCard";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { FeedNavbar } from "./components/FeedNavbar";
import RightSidebar from "./components/RightSidebar";
import CreateBlogCardModal from "./components/CreateBlogcardModal";
import CreateAIModal from "./components/AIEnhancerModal";
import UserFeed from "./components/UserFeedBlogs";
import FeedTabs from "./components/Tabs";
import { usePagination } from "@/customHooks/usePagination";
import { Button } from "@/components/ui/button";

const Feed = () => {
    const [activeTab, setActiveTab] = useState("for-you");
    const { isCreatingBlog } = useAppStore();
    const [showCreateModal, setShowCreateModal] = useState(isCreatingBlog === true);
    const [showAIModal, setShowAIModal] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedTone, setSelectedTone] = useState<string>("");
    const [customInstructions, setCustomInstructions] = useState<string>("");
    const [contentToEnhance, setContentToEnhance] = useState<string>("");

    const [useInfiniteScroll, setUseInfiniteScroll] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    
    // Use pagination hook
    const pagination = usePagination(currentPage, 10);

    const { data: userData, isPending: userDataPending } = useUserProfileData();
    
    // Use the hook with current page
    const { 
        data: userFeedData, 
        isPending: userFeedDataPending, 
        error: userFeedDataError,
        refetch: refetchFeed 
    } = useUserFeedData(userData?._id || "", currentPage);

    const { mutateAsync: postBlog, isPending: postingBlogPending } = usePostUserBlog();

    // Update pagination when data changes
    useEffect(() => {
        if (userFeedData?.data?.pagination) {
            pagination.setHasMore(userFeedData.data.pagination.hasMore);
        }
    }, [userFeedData?.data?.pagination]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // The useUserFeedData hook will automatically refetch when currentPage changes
    };

    const handleRefresh = () => {
        setCurrentPage(1);
        pagination.goToPage(1);
        refetchFeed();
    };

    const handleLoadMore = () => {
        if (pagination.hasMore && !userFeedDataPending) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            pagination.nextPage();
        }
    };

    const handleBlogPost = async () => {
        await postBlog({
            title,
            body,
            image: selectedImage,
        });
        setTitle("");
        setBody("");
        setSelectedImage(null);
        setImagePreview(null);
        setShowCreateModal(false);
        
        // Refresh feed after posting new blog
        handleRefresh();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePaginationMode = () => {
        setUseInfiniteScroll(!useInfiniteScroll);
        setCurrentPage(1);
        pagination.goToPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <FeedNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <CreateBlogCard 
                            setShowCreateModal={setShowCreateModal} 
                            setSelectedImage={setSelectedImage} 
                        />
                        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        
                        <UserFeed
                            userFeedData={userFeedData}
                            userFeedDataError={userFeedDataError}
                            userDataPending={userDataPending}
                            userFeedDataPending={userFeedDataPending}
                            onPageChange={handlePageChange}
                            onRefresh={handleRefresh}
                            onLoadMore={handleLoadMore}
                            useInfiniteScroll={useInfiniteScroll}
                            currentPage={currentPage}
                            hasMore={pagination.hasMore}
                        />
                    </div>
                    <RightSidebar suggestedUsers={fakeUsersArray} trendingTopics={trendingTopics} />
                </div>
            </div>

            {/* Pagination Mode Toggle */}
            <div className="fixed bottom-6 right-6 z-40">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePaginationMode}
                    className="bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
                >
                    {useInfiniteScroll ? 'Switch to Pages' : 'Switch to Infinite Scroll'}
                </Button>
            </div>

            <AnimatePresence>
                <CreateBlogCardModal
                    show={showCreateModal}
                    setShow={setShowCreateModal}
                    title={title}
                    setTitle={setTitle}
                    body={body}
                    setBody={setBody}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    setSelectedImage={setSelectedImage}
                    setShowAIModal={setShowAIModal}
                    postingBlogPending={postingBlogPending}
                    handleImageUpload={handleImageUpload}
                    handleBlogPost={handleBlogPost}
                />
                <CreateAIModal
                    show={showAIModal}
                    title={title}
                    body={body}
                    selectedTone={selectedTone}
                    customInstructions={customInstructions}
                    contentToEnhance={contentToEnhance}
                    setShow={setShowAIModal}
                    setSelectedTone={setSelectedTone}
                    setCustomInstructions={setCustomInstructions}
                    setContentToEnhance={setContentToEnhance}
                    setTitle={setTitle}
                    setBody={setBody}
                />
            </AnimatePresence>
        </div>
    );
};

export default Feed;