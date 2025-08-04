import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Bookmark, UserPlus, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "../FEED/components/BLOG";

interface UserProfileProps {
    user: {
        id: string;
        username: string;
        email: string;
        profilePic?: string;
        bio?: string;
        followers: number;
        following: number;
        savedBlogs: number;
    };
    blogs: Array<{
        id: string;
        title: string;
        body: string;
        likes: number;
        comments: number;
        publishedAt: string;
    }>;
    isLoading?: boolean;
    isCurrentUser?: boolean;
    onFollow?: () => void;
    onEditProfile?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    user,
    blogs,
    isLoading = false,
    isCurrentUser = false,
    onFollow,
    onEditProfile,
}) => {
    const [activeTab, setActiveTab] = useState("blogs");

    if (isLoading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row gap-6 items-start mb-8"
            >
                <div className="flex-shrink-0">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/10">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10">
                            {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{user.username}</h1>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>

                        <div className="flex gap-3">
                            {isCurrentUser ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onEditProfile}
                                    className="gap-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onFollow}
                                    className="gap-2"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Follow
                                </Button>
                            )}
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-sm text-muted-foreground max-w-prose">
                            {user.bio}
                        </p>
                    )}

                    <div className="flex gap-6 pt-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{user.followers}</p>
                                <p className="text-xs text-muted-foreground">Followers</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{user.following}</p>
                                <p className="text-xs text-muted-foreground">Following</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Bookmark className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{user.savedBlogs}</p>
                                <p className="text-xs text-muted-foreground">Saved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Content Tabs */}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full mt-8"
            >
                <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="blogs">Blogs</TabsTrigger>
                    <TabsTrigger value="saved">Saved</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                </TabsList>

                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6"
                >
                    <TabsContent value="blogs">
                        <div className="space-y-6">
                            {blogs.length > 0 ? (
                                blogs.map((blog) => (
                                    <BlogCard
                                        key={blog.id}
                                        {...blog}
                                        author={{
                                            name: user.username,
                                            avatar: user.profilePic,
                                        }}
                                        onLike={() => { }}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground">
                                        {isCurrentUser
                                            ? "You haven't written any blogs yet."
                                            : "This user hasn't written any blogs yet."}
                                    </p>
                                    {isCurrentUser && (
                                        <Button variant="link" className="mt-2">
                                            Write your first blog
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="saved">
                        <div className="text-center py-12">
                            <Bookmark className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {isCurrentUser
                                    ? "Your saved blogs will appear here."
                                    : "Saved blogs are private."}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="about">
                        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="font-medium">Email</h3>
                                <p className="text-muted-foreground">{user.email}</p>
                            </div>
                            {user.bio && (
                                <div>
                                    <h3 className="font-medium">Bio</h3>
                                    <p className="text-muted-foreground">{user.bio}</p>
                                </div>
                            )}
                            <div>
                                <h3 className="font-medium">Member Since</h3>
                                <p className="text-muted-foreground">
                                    {new Date().toLocaleDateString()} {/* Replace with actual date */}
                                </p>
                            </div>
                        </div>
                    </TabsContent>
                </motion.div>
            </Tabs>
        </div>
    );
};

const ProfileSkeleton = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-prose" />
                    <Skeleton className="h-4 w-3/4 max-w-prose" />
                    <div className="flex gap-6 pt-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-8" />
                                    <Skeleton className="h-3 w-12 mt-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>

                {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex justify-between pt-4">
                            <div className="flex gap-4">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                            <Skeleton className="h-8 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};