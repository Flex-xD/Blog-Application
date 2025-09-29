import { useState } from "react";
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
    const [showCreateModal, setShowCreateModal] = useState(isCreatingBlog === true ? true : false);

    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    // ? LOGIC FOR THE AI MODAL (I will seperate it later . . . )
    const [showAIModal, setShowAIModal] = useState(false);
    const [selectedTone, setSelectedTone] = useState<string>('');
    const [customInstructions, setCustomInstructions] = useState('');
    const [contentToEnhance, setContentToEnhance] = useState('');
    const [enhancingContent, setEnhancingContent] = useState(false);


    console.log(selectedTone);
    // Add this function to handle AI enhancement
    const handleAIEnhancement = async () => {
        setEnhancingContent(true);

        try {
            // Simulate API call - replace with your actual AI service integration
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Enhanced content would come from your AI service
            const enhancedContent = `Enhanced content based on ${selectedTone} tone and custom instructions...`;

            // Update the main blog content
            setBody(enhancedContent);
            setShowAIModal(false);

            // Reset states
            setSelectedTone('');
            setCustomInstructions('');
            setContentToEnhance('');

        } catch (error) {
            console.error('AI enhancement failed:', error);
        } finally {
            setEnhancingContent(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Navbar */}
            <FeedNavbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">


                    {/* Main Content */}

                    <div className="flex-1">
                        {/* Create Blog Card */}
                        <CreateBlogCard setShowCreateModal={setShowCreateModal} setSelectedImage={setSelectedImage} />
                        {/* TABS */}
                        <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

                        {/* USER FEED BLOGS : */}
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

            {/* CREATEBLOG MODAL*/}
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
            {/* AI MODAL */}
            <CreateAIModal
                show={showAIModal}
                setShow={setShowAIModal}
                body={body}
                selectedTone={selectedTone}
                setSelectedTone={setSelectedTone}
                customInstructions={customInstructions}
                setCustomInstructions={setCustomInstructions}
                contentToEnhance={contentToEnhance}
                setContentToEnhance={setContentToEnhance}
                enhancingContent={enhancingContent}
                handleAIEnhancement={handleAIEnhancement}
            />
        </div>
    );
};

export default Feed;