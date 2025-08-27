import { motion } from "framer-motion";
import { BlogCard } from "../Components/BlogCard";
import { Button } from "@/components/ui/button";
import { PenSquare, Search, Bell, Bookmark, Users, Home, TrendingUp, Link, Image as ImageIcon, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAppStore } from "@/store";
import type { IBlog } from "@/types";
import usePostUserBlog from "@/customHooks/PostUserBlog";

const Feed = () => {
    const [activeTab, setActiveTab] = useState("for-you");
    const { isCreatingBlog } = useAppStore();
    const [showCreateModal, setShowCreateModal] = useState(isCreatingBlog === true ? true : false);
    const { mutateAsync, isPending } = usePostUserBlog();


    const [title, setTitle] = useState<string>("");
    const [body, setBody] = useState<string>("");
    const [image, setImage] = useState<string>("");


    const handleBlogPost = async () => {
        setShowCreateModal(false);
        await mutateAsync({ title, body, image })
    }

    if (isPending) return <Loader />

    // * DUMMY DATA (I still have to add backend)
    const blogs: IBlog[] = [
        {
            _id: "1",
            title: "The Evolution of Modern Web Development",
            body: "In the past decade, web development has undergone a radical transformation. From static HTML pages to dynamic single-page applications...",
            image: "https://picsum.photos/id/1015/800/400",
            author: {
                _id: "u1",
                username: "alexjohnson",
                email: "alex.johnson@example.com",
                password: "hashedpassword",
                bio: "Full-stack developer passionate about frontend performance.",
                profilePicture: "https://randomuser.me/api/portraits/men/45.jpg",
                followers: ["u2", "u3"],
                following: ["u5"],
                saves: [],
                userBlogs: ["1"],
                createdAt: new Date("2023-01-01"),
                updatedAt: new Date("2023-06-01"),
            },
            likes: ["u2", "u3", "u4"],
            comments: ["c1", "c2", "c3"],
            createdAt: new Date("2023-06-20T14:30:00Z"),
            updatedAt: new Date("2023-06-25T10:00:00Z"),
        },
        {
            _id: "2",
            title: "Understanding TypeScript: A Comprehensive Guide",
            body: "TypeScript has become an essential tool for modern web development...",
            image: "https://picsum.photos/id/1025/800/400",
            author: {
                _id: "u2",
                username: "mariachen",
                email: "maria.chen@example.com",
                password: "hashedpassword",
                bio: "Frontend engineer and TypeScript enthusiast.",
                profilePicture: "https://randomuser.me/api/portraits/women/32.jpg",
                followers: ["u1"],
                following: ["u3"],
                saves: [],
                userBlogs: ["2"],
                createdAt: new Date("2023-02-15"),
                updatedAt: new Date("2023-05-01"),
            },
            likes: ["u1", "u3", "u5"],
            comments: ["c4", "c5"],
            createdAt: new Date("2023-05-15T09:15:00Z"),
            updatedAt: new Date("2023-05-18T12:00:00Z"),
        },
        {
            _id: "3",
            title: "Exploring the Power of Serverless Architecture",
            body: "Serverless computing eliminates the need for managing servers...",
            image: "https://picsum.photos/id/1003/800/400",
            author: {
                _id: "u3",
                username: "noahkim",
                email: "noah.kim@example.com",
                password: "hashedpassword",
                bio: "Cloud engineer exploring serverless and distributed systems.",
                profilePicture: "https://randomuser.me/api/portraits/men/21.jpg",
                followers: ["u1", "u2"],
                following: ["u4"],
                saves: [],
                userBlogs: ["3"],
                createdAt: new Date("2023-04-01"),
                updatedAt: new Date("2023-07-01"),
            },
            likes: ["u1", "u2", "u4"],
            comments: ["c6"],
            createdAt: new Date("2024-01-08T12:45:00Z"),
            updatedAt: new Date("2024-01-10T10:30:00Z"),
        },
        {
            _id: "4",
            title: "Why You Should Care About Web Performance in 2025",
            body: "Performance is a ranking factor, a UX must-have, and a conversion booster...",
            image: "https://picsum.photos/id/1044/800/400",
            author: {
                _id: "u4",
                username: "emilypark",
                email: "emily.park@example.com",
                password: "hashedpassword",
                bio: "Frontend performance advocate and UX researcher.",
                profilePicture: "https://randomuser.me/api/portraits/women/68.jpg",
                followers: ["u1", "u3"],
                following: ["u5"],
                saves: [],
                userBlogs: ["4"],
                createdAt: new Date("2023-06-01"),
                updatedAt: new Date("2023-12-01"),
            },
            likes: ["u1", "u2", "u3", "u5"],
            comments: ["c7", "c8"],
            createdAt: new Date("2024-12-03T16:00:00Z"),
            updatedAt: new Date("2024-12-05T11:00:00Z"),
        },
        {
            _id: "5",
            title: "Top 10 VS Code Extensions to Boost Productivity",
            body: "Visual Studio Code is one of the most popular code editors today...",
            image: "https://picsum.photos/id/1050/800/400",
            author: {
                _id: "u5",
                username: "leofernandez",
                email: "leo.fernandez@example.com",
                password: "hashedpassword",
                bio: "Productivity hacker & VS Code power user.",
                profilePicture: "https://randomuser.me/api/portraits/men/54.jpg",
                followers: ["u2"],
                following: ["u1", "u3"],
                saves: [],
                userBlogs: ["5"],
                createdAt: new Date("2023-08-01"),
                updatedAt: new Date("2025-01-01"),
            },
            likes: ["u2", "u4", "u3"],
            comments: ["c9", "c10", "c11"],
            createdAt: new Date("2025-07-10T11:00:00Z"),
            updatedAt: new Date("2025-07-12T09:30:00Z"),
        },
        // ✅ New blogs
        {
            _id: "6",
            title: "Mastering React Hooks in 2025",
            body: "Hooks like useState, useEffect, and useMemo remain essential for React developers...",
            image: "https://picsum.photos/id/1070/800/400",
            author: {
                _id: "u6",
                username: "sofiabrown",
                email: "sofia.brown@example.com",
                password: "hashedpassword",
                bio: "React developer focusing on scalable frontend architecture.",
                profilePicture: "https://randomuser.me/api/portraits/women/12.jpg",
                followers: ["u1", "u5"],
                following: ["u2"],
                saves: [],
                userBlogs: ["6"],
                createdAt: new Date("2024-03-12"),
                updatedAt: new Date("2025-02-01"),
            },
            likes: ["u1", "u3", "u4", "u5"],
            comments: ["c12", "c13"],
            createdAt: new Date("2025-02-10T15:20:00Z"),
            updatedAt: new Date("2025-02-12T10:00:00Z"),
        },
        {
            _id: "7",
            title: "AI-Powered Development Tools: The Future of Coding",
            body: "AI tools like GitHub Copilot and ChatGPT are transforming how developers code...",
            image: "https://picsum.photos/id/1084/800/400",
            author: {
                _id: "u7",
                username: "ryantaylor",
                email: "ryan.taylor@example.com",
                password: "hashedpassword",
                bio: "Exploring the intersection of AI and software engineering.",
                profilePicture: "https://randomuser.me/api/portraits/men/36.jpg",
                followers: ["u2", "u6"],
                following: ["u1"],
                saves: [],
                userBlogs: ["7"],
                createdAt: new Date("2024-05-01"),
                updatedAt: new Date("2025-04-01"),
            },
            likes: ["u1", "u2", "u3", "u5", "u6"],
            comments: ["c14", "c15", "c16", "c17"],
            createdAt: new Date("2025-04-15T18:00:00Z"),
            updatedAt: new Date("2025-04-18T12:00:00Z"),
        },
        {
            _id: "8",
            title: "GraphQL vs REST: Which API Style Wins in 2025?",
            body: "Developers continue debating REST vs GraphQL. This article explores pros and cons of each...",
            image: "https://picsum.photos/id/1099/800/400",
            author: {
                _id: "u8",
                username: "oliviawright",
                email: "olivia.wright@example.com",
                password: "hashedpassword",
                bio: "Backend engineer specialized in GraphQL and API design.",
                profilePicture: "https://randomuser.me/api/portraits/women/29.jpg",
                followers: ["u3", "u6", "u7"],
                following: ["u4"],
                saves: [],
                userBlogs: ["8"],
                createdAt: new Date("2024-07-10"),
                updatedAt: new Date("2025-05-20"),
            },
            likes: ["u1", "u2", "u3", "u4", "u5", "u7"],
            comments: ["c18", "c19"],
            createdAt: new Date("2025-05-21T09:45:00Z"),
            updatedAt: new Date("2025-05-23T08:00:00Z"),
        },
    ];

    const trendingTopics = [
        { name: "#ReactJS", posts: "12.5K" },
        { name: "#TypeScript", posts: "8.2K" },
        { name: "#NextJS", posts: "6.7K" },
        { name: "#WebDev", posts: "5.9K" },
        { name: "#AI", posts: "15.3K" },
    ];

    const suggestedUsers = [
        { name: "Sarah Williams", avatar: "https://randomuser.me/api/portraits/women/44.jpg", role: "Frontend Lead" },
        { name: "Michael Chen", avatar: "https://randomuser.me/api/portraits/men/33.jpg", role: "UX Engineer" },
        { name: "Priya Patel", avatar: "https://randomuser.me/api/portraits/women/65.jpg", role: "React Specialist" },
    ];

    const handleLike = (id: string) => {
        console.log(`Liked blog ${id}`);
        // Add your like logic here
    };

    
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Left side - Logo */}
                        <div className="flex items-center">
                            <PenSquare className="h-6 w-6 text-indigo-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">BlogCraft</span>
                        </div>

                        {/* Center - Search */}
                        <div className="flex-1 max-w-xl mx-4 hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search blogs, topics, or people..."
                                    className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Right side - Navigation */}
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Home className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Bookmark className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Avatar className="h-8 w-8 border-2 border-indigo-100">
                                <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Create Blog Card */}
                        <motion.div
                            whileHover={{ y: -2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
                        >
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="w-full text-left bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 text-gray-600 transition-colors"
                                    >
                                        What's on your mind today?
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between mt-3 pt-3 border-t border-gray-100">
                                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                                    <PenSquare className="h-4 w-4 mr-2" />
                                    Write
                                </Button>
                                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    Photo
                                </Button>
                                <Button variant="ghost" className="text-gray-600 hover:bg-gray-100">
                                    <Link className="h-4 w-4 mr-2" />
                                    Link
                                </Button>
                            </div>
                        </motion.div>

                        {/* Feed Tabs */}
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

                        {/* Blog List */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6"
                        >
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog._id}
                                    {...blog}
                                    onLike={handleLike} />
                            ))}
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:w-80 space-y-6">
                        {/* Trending Topics */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                        >
                            <h3 className="font-semibold text-lg mb-4 flex items-center">
                                <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                                Trending Topics
                            </h3>
                            <div className="space-y-4">
                                {trendingTopics.map((topic, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <span className="font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                                            {topic.name}
                                        </span>
                                        <span className="text-sm text-gray-500">{topic.posts} posts</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Suggested Users */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
                        >
                            <h3 className="font-semibold text-lg mb-4">Suggested Creators</h3>
                            <div className="space-y-4">
                                {suggestedUsers.map((user, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={user.avatar} />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{user.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{user.role}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full">
                                            Follow
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Create Blog Floating Button (Mobile) */}
                        <div className="fixed bottom-6 right-6 lg:hidden">
                            <Button
                                size="lg"
                                className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <PenSquare className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Blog Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">Create New Blog</h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                    ✕
                                </button>
                            </div>
                        </div>
                        <div className="p-4 overflow-y-auto">
                            <div className="space-y-4">
                                <Input
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Blog Title"
                                    className="text-xl font-bold border-none focus-visible:ring-0" />
                                <div className="flex items-center space-x-3">
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
                                    <Button variant="ghost">
                                        <ImageIcon
                                            className="h-4 w-4 mr-2" />
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
                            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBlogPost}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                Publish
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Feed;