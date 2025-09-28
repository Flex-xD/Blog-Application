import { AnimatePresence, motion } from "framer-motion";
import { BlogCard } from "../Components/BlogCard";
import { Button } from "@/components/ui/button";
import { Users, Home, TrendingUp, Link, Image as ImageIcon, Loader2, Sparkle, LucideWandSparkles, Sparkles, X, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppStore } from "@/store";
import usePostUserBlog, { type IUserBlog } from "@/customHooks/PostUserBlog";
import useUserFeedData from "@/customHooks/UserFeedFetching";
import { fakeUsersArray, trendingTopics } from "@/constants/dummyData";
import { CreateBlogCard } from "./components/CreateBlogCard";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { FeedNavbar } from "../Components/FeedNavbar";
import RightSidebar from "./components/RightSidebar";

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

    const modalVariants = {
        open: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "tween" as const,
                duration: 0.2,
                ease: "easeInOut" // Use a valid string for ease
            }
        },
        closed: {
            opacity: 0,
            scale: 0.9,
            transition: {
                type: "tween" as const,
                duration: 0.15,
                ease: "easeInOut" // Use a valid string for ease
            }
        }
    };

    const backdropVariants = {
        open: {
            opacity: 1,
            transition: { duration: 0.2 }
        },
        closed: {
            opacity: 0,
            transition: { duration: 0.15 }
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
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 h-auto rounded-xl">
                                <TabsTrigger value="for-you" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Home className="h-4 w-4 mr-2" />
                                    For You
                                </TabsTrigger>
                                <TabsTrigger value="following" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <Users className="h-4 w-4 mr-2" />
                                    Following
                                </TabsTrigger>
                                <TabsTrigger value="trending" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Trending
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* USER FEED BLOGS : */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            {userFeedDataError ? (
                                <p>Error loading feed: {userFeedDataError.message}</p>
                            ) : userDataPending || userFeedDataPending ? (
                                <div className="h-screen w-screen flex items-center justify-center">
                                    <Loader2 />
                                </div>
                            ) : userFeedData.data.blogs?.length > 0 ? (
                                userFeedData.data.blogs.map((blog) => (
                                    <BlogCard
                                        key={blog._id}
                                        {...blog}
                                        image={
                                            typeof blog.image === "string"
                                                ? { url: blog.image, publicId: "", width: 0, height: 0, format: "" }
                                                : blog.image
                                        }
                                        authorDetails={{ ...blog.authorDetails }}
                                    />
                                ))
                            ) : (
                                <p>No blogs available</p>
                            )}
                        </motion.div>
                    </div>

                    <RightSidebar suggestedUsers={fakeUsersArray} trendingTopics={trendingTopics} />

                </div>
            </div>

            {/* Create Blog Modal */}

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        key="create-modal"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={backdropVariants}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Create New Blog</h3>
                                    <button
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setSelectedImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {imagePreview && (
                                        <div className="relative float-left mr-4 mb-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors duration-150"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}

                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Blog Title"
                                        className="text-xl font-bold border-none focus-visible:ring-0"
                                    />

                                    <div className="flex items-center space-x-3 clear-both">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">You</p>
                                            <select className="text-sm text-gray-500 bg-transparent border-none focus:ring-0">
                                                <option>Public</option>
                                                <option>Followers Only</option>
                                                <option>Private</option>
                                            </select>
                                        </div>
                                    </div>

                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        placeholder="Write your blog content here..."
                                        className="w-full min-h-[200px] p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />

                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" className="relative">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Add Image
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowAIModal(true)}
                                        >
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            AI
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleBlogPost}
                                    disabled={postingBlogPending}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                >
                                    {postingBlogPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : null}
                                    Publish
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Modal - Optimized for Performance */}
            <AnimatePresence>
                {showAIModal && (
                    <motion.div
                        key="ai-modal"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={backdropVariants}
                        className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            variants={modalVariants}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                                            <Sparkles className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">AI Content Enhancement</h3>
                                            <p className="text-sm text-gray-600">Choose a tone or customize your enhancement</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAIModal(false)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-white rounded-lg"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content - Using simpler animations */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    {/* Tone Selection */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Tone</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {[
                                                { id: 'professional', name: 'Professional', emoji: '💼', description: 'Formal and business-like' },
                                                { id: 'casual', name: 'Casual', emoji: '😊', description: 'Friendly and informal' },
                                                { id: 'persuasive', name: 'Persuasive', emoji: '🎯', description: 'Convincing and compelling' },
                                                { id: 'educational', name: 'Educational', emoji: '📚', description: 'Informative and clear' },
                                                { id: 'storytelling', name: 'Storytelling', emoji: '📖', description: 'Narrative and engaging' },
                                                { id: 'inspirational', name: 'Inspirational', emoji: '✨', description: 'Motivational and uplifting' }
                                            ].map((tone) => (
                                                <button
                                                    key={tone.id}
                                                    onClick={() => setSelectedTone(tone.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all duration-150 text-left ${selectedTone === tone.id
                                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className="text-2xl">{tone.emoji}</span>
                                                        <span className="font-semibold text-gray-900">{tone.name}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{tone.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Instructions */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-semibold text-gray-900">Custom Instructions</h4>
                                            <span className="text-sm text-gray-500">Optional</span>
                                        </div>
                                        <textarea
                                            value={customInstructions}
                                            onChange={(e) => setCustomInstructions(e.target.value)}
                                            placeholder="Specify exactly how you want the AI to enhance your content..."
                                            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400"
                                        />
                                    </div>

                                    {/* Content Preview */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-lg font-semibold text-gray-900">Content to Enhance</h4>
                                            <button
                                                onClick={() => setContentToEnhance(body)}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-150"
                                            >
                                                Use current content
                                            </button>
                                        </div>
                                        <textarea
                                            value={contentToEnhance}
                                            onChange={(e) => setContentToEnhance(e.target.value)}
                                            placeholder="Paste your content here for AI enhancement..."
                                            className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-150 resize-none placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Shield className="h-4 w-4" />
                                        <span>Your content is secure and private</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowAIModal(false)}
                                            className="transition-colors duration-150"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleAIEnhancement}
                                            disabled={enhancingContent || !contentToEnhance.trim()}
                                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-150"
                                        >
                                            {enhancingContent ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                    Enhancing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Enhance Content
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default Feed;