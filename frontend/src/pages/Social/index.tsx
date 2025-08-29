'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Users,
    TrendingUp,
    MessageCircle,
    Heart,
    Share2,
    UserPlus,
    Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navbar from '../Components/Navbar';

// Mock data types
type User = {
    id: string;
    name: string;
    username: string;
    avatar: string;
    followers: number;
    isFollowing: boolean;
};

type Post = {
    id: string;
    user: User;
    title: string;
    content: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: string;
    tags: string[];
};

type TrendingTopic = {
    id: string;
    name: string;
    postCount: number;
};

// Mock data
const suggestedUsers: User[] = [
    {
        id: '1',
        name: 'Alex Johnson',
        username: 'alexj',
        avatar: '/avatars/1.jpg',
        followers: 1243,
        isFollowing: false,
    },
    {
        id: '2',
        name: 'Maria Garcia',
        username: 'mariag',
        avatar: '/avatars/2.jpg',
        followers: 892,
        isFollowing: false,
    },
    {
        id: '3',
        name: 'Sam Wilson',
        username: 'samw',
        avatar: '/avatars/3.jpg',
        followers: 2456,
        isFollowing: true,
    },
    {
        id: '4',
        name: 'Taylor Swift',
        username: 'taylors',
        avatar: '/avatars/4.jpg',
        followers: 5321,
        isFollowing: false,
    },
    {
        id: '5',
        name: 'Jordan Lee',
        username: 'jordanl',
        avatar: '/avatars/5.jpg',
        followers: 1876,
        isFollowing: false,
    },
];

const popularPosts: Post[] = [
    {
        id: '1',
        user: suggestedUsers[0],
        title: 'How I Built My First SaaS in 30 Days',
        content: 'Sharing my journey of building a SaaS product from scratch in just one month...',
        likes: 243,
        comments: 42,
        shares: 31,
        createdAt: '2 hours ago',
        tags: ['#SaaS', '#Startup'],
    },
    {
        id: '2',
        user: suggestedUsers[1],
        title: 'The Complete Guide to React Hooks',
        content: 'Deep dive into React Hooks with practical examples and best practices...',
        likes: 187,
        comments: 31,
        shares: 28,
        createdAt: '5 hours ago',
        tags: ['#React', '#WebDev'],
    },
    {
        id: '3',
        user: suggestedUsers[2],
        title: 'Design Systems for Developers',
        content: 'How to implement and maintain design systems in large scale applications...',
        likes: 156,
        comments: 28,
        shares: 19,
        createdAt: '1 day ago',
        tags: ['#Design', '#Frontend'],
    },
];

const trendingTopics: TrendingTopic[] = [
    { id: '1', name: '#ReactJS', postCount: 1250 },
    { id: '2', name: '#DesignSystems', postCount: 892 },
    { id: '3', name: '#WebDev', postCount: 756 },
    { id: '4', name: '#UX', postCount: 654 },
    { id: '5', name: '#JavaScript', postCount: 543 },
];

const trendingPosts = [
    {
        id: '1',
        title: 'New CSS Features Coming in 2024',
        engagement: '1.5K engagements today',
        image: '/placeholder-trending-1.jpg',
    },
    {
        id: '2',
        title: 'State Management Showdown',
        engagement: '1.2K engagements today',
        image: '/placeholder-trending-2.jpg',
    },
    {
        id: '3',
        title: 'The Future of Web Components',
        engagement: '980 engagements today',
        image: '/placeholder-trending-3.jpg',
    },
    {
        id: '4',
        title: 'Building Microfrontends',
        engagement: '850 engagements today',
        image: '/placeholder-trending-4.jpg',
    },
];

const SocialComponent = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [followedUsers, setFollowedUsers] = useState<string[]>(
        suggestedUsers.filter(user => user.isFollowing).map(user => user.id)
    );

    const toggleFollow = (userId: string) => {
        setFollowedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <Navbar />

            {/* Main Content */}
            <Tabs defaultValue="discover" className="w-full">

                <div className='flex items-center justify-center p-2'>
                    <TabsList className="grid w-full grid-cols-3 max-w-md mb-6">
                        <TabsTrigger value="discover">Discover</TabsTrigger>
                        <TabsTrigger value="following">Following</TabsTrigger>
                        <TabsTrigger value="trending">Trending</TabsTrigger>
                    </TabsList>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - User Suggestions & Trending Topics */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Suggested Creators */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                    <span>Suggested Creators</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {suggestedUsers.map((user) => (
                                    <motion.div
                                        key={user.id}
                                        whileHover={{ y: -2 }}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    @{user.username} · {user.followers.toLocaleString()} followers
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant={followedUsers.includes(user.id) ? 'outline' : 'default'}
                                            size="sm"
                                            onClick={() => toggleFollow(user.id)}
                                            className="gap-1"
                                        >
                                            {followedUsers.includes(user.id) ? (
                                                <>
                                                    <Check className="h-4 w-4" /> Following
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="h-4 w-4" /> Follow
                                                </>
                                            )}
                                        </Button>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Trending Topics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    <span>Trending Topics</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {trendingTopics.map((topic, index) => (
                                    <motion.div
                                        key={topic.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index }}
                                        className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                    >
                                        <p className="font-medium text-primary">{topic.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {topic.postCount.toLocaleString()} posts this week
                                        </p>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Middle Column - Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <TabsContent value="discover">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Popular Posts</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {popularPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            whileHover={{ scale: 1.01 }}
                                            className="border rounded-xl p-5 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <Avatar>
                                                    <AvatarImage src={post.user.avatar} />
                                                    <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{post.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        @{post.user.username} · {post.createdAt}
                                                    </p>
                                                </div>
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                                            <p className="text-muted-foreground mb-4">{post.content}</p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {post.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-muted-foreground">
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    <Heart className="h-4 w-4" /> {post.likes}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    <MessageCircle className="h-4 w-4" /> {post.comments}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="gap-1">
                                                    <Share2 className="h-4 w-4" /> {post.shares}
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="following">
                            <Card className="min-h-[300px] flex flex-col items-center justify-center">
                                <CardContent className="flex flex-col items-center text-center p-8">
                                    <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                        Your followed content
                                    </h3>
                                    <p className="text-muted-foreground max-w-md">
                                        When you follow creators, their latest posts will appear here for you to discover.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="trending">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Trending Now</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {trendingPosts.map((post) => (
                                            <motion.div
                                                key={post.id}
                                                whileHover={{ y: -5 }}
                                                className="border rounded-lg p-4 hover:shadow-sm transition-all"
                                            >
                                                <div className="h-40 bg-gradient-to-r from-muted/50 to-muted rounded-lg mb-3"></div>
                                                <h3 className="font-medium mb-1">{post.title}</h3>
                                                <p className="text-sm text-muted-foreground">{post.engagement}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    );
};

export default SocialComponent;