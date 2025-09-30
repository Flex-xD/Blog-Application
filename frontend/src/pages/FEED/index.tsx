import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store";
import usePostUserBlog, { type IUserBlog } from "@/customHooks/PostUserBlog";
import useUserFeedData from "@/customHooks/UserFeedFetching";
import { fakeUsersArray, trendingTopics } from "@/constants/dummyData";
import { CreateBlogCard } from "./components/CreateBlogCard";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { FeedNavbar } from "../Components/FeedNavbar";
import RightSidebar from "./components/RightSidebar";
import CreateBlogCardModal from "./components/CreateBlogcardModal";
import CreateAIModal from "./components/AIEnhancerModal";
import UserFeed from "./components/UserFeedBlogs";
import FeedTabs from "./components/Tabs";

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

    const { data: userData, isPending: userDataPending } = useUserProfileData();
    const { data: userFeedData, isPending: userFeedDataPending, error: userFeedDataError } = useUserFeedData(userData?._id || "");
    const { mutateAsync: postBlog, isPending: postingBlogPending } = usePostUserBlog();

    const handleBlogPost = async () => {
        const blogData: IUserBlog = {
            title,
            body,
            image: selectedImage,
        };
        await postBlog(blogData);
        setTitle("");
        setBody("");
        setSelectedImage(null);
        setImagePreview(null);
        setShowCreateModal(false);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <FeedNavbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <CreateBlogCard setShowCreateModal={setShowCreateModal} setSelectedImage={setSelectedImage} />
                        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                        <UserFeed
                            userFeedData={userFeedData ?? { data: { blogs: [] } }}
                            userFeedDataError={userFeedDataError}
                            userDataPending={userDataPending}
                            userFeedDataPending={userFeedDataPending}
                        />
                    </div>
                    <RightSidebar suggestedUsers={fakeUsersArray} trendingTopics={trendingTopics} />
                </div>
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