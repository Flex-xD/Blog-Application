import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Navbar from '../Components/Navbar';
import { popularBlogs, PopularPosts, suggestedUsersForSocial } from './components/PopularPosts';
import type { IUser } from '@/types';
import ProfileModal from '../Components/UserProfileModal';



type TrendingTopic = {
    id: string;
    name: string;
    postCount: number;
};

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
        suggestedUsersForSocial.filter(user => user._id).map(user => user._id)
    );

    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);

    const handleUserClick = (user: IUser) => {
        setSelectedUser(user);
        setProfileModalOpen(true)
    }

    const toggleFollow = (userId: string) => {
        setFollowedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleUnfollow = () => {
        console.log("Unfollowed !");
    }

    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <Navbar />

                {/* Main Content */}
                <Tabs defaultValue="discover" className="w-full">

                    <div className='flex items-center justify-center p-2'>
                        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto bg-gray-100 p-1 h-auto rounded-xl">
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
                                    {suggestedUsersForSocial.map((user) => (
                                        <motion.div
                                            onClick={() => handleUserClick(user)}
                                            key={user._id}
                                            whileHover={{ y: -2 }}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={user.profilePicture?.url} />
                                                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{user.username}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        @{user.username} · {user.followers.toLocaleString()} followers
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant={followedUsers.includes(user._id) ? 'outline' : 'default'}
                                                size="sm"
                                                onClick={() => toggleFollow(user._id)}
                                                className="gap-1"
                                            >
                                                {followedUsers.includes(user._id) ? (
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
                                        <PopularPosts />
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

            {selectedUser && (
                <ProfileModal
                    user={selectedUser}
                    isOpen={profileModalOpen}
                    onClose={() => setProfileModalOpen(false)}
                    onFollow={toggleFollow}
                    onUnfollow={handleUnfollow}
                    currentUserId="current-user-id-here" // Pass the current user's ID
                    blogs={popularBlogs} // Pass the selected user's blogs
                />
            )}
        </>
    );
};



export default SocialComponent;