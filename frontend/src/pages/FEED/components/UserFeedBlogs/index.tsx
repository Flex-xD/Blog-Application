// components/UserFeed.tsx
import { BlogCard } from "@/pages/Components/BlogCard";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Blog {
    _id: string;
    title: string;
    body: string;
    image:
    | string
    | {
        url: string;
        publicId: string;
        width: number;
        height: number;
        format: string;
    };
    authorDetails: {
        username: string;
        _id: string;
        profilePicture: string;
    };
    likes: string[];
    comments: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface UserFeedProps {
    userFeedData: { data: { blogs: Blog[] } };
    userFeedDataError?: Error | null;
    userDataPending: boolean;
    userFeedDataPending: boolean;
}

export default function UserFeed({
    userFeedData,
    userFeedDataError,
    userDataPending,
    userFeedDataPending,
}: UserFeedProps) {
    return (
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
    );
}
