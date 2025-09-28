import { motion } from "framer-motion";
import { BlogCard } from "../Components/BlogCard";
import { Button } from "@/components/ui/button";
import {  Users, Home, TrendingUp, Link, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppStore } from "@/store";
import usePostUserBlog, { type IUserBlog } from "@/customHooks/PostUserBlog";
import useUserFeedData from "@/customHooks/UserFeedFetching";
import { fakeUsersArray,  trendingTopics } from "@/constants/dummyData";
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
            image: selectedImage , 
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

                    <RightSidebar suggestedUsers={fakeUsersArray} trendingTopics={trendingTopics}/>

                </div>
            </div>

            {/* Create Blog Modal */}
            {(
                showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
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
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {/* Image preview at top left */}
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
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
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

                                    <div className="flex items-center space-x-3 clear-both"> {/* clear-both to clear the float */}
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
                                        <Button variant="ghost">
                                            <Link className="h-4 w-4 mr-2" />
                                            Add Link
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
                    </div>
                )
            )}
        </div>
    );
};

export default Feed;