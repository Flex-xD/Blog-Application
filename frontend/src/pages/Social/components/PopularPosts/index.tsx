import { BlogCard } from "@/pages/Components/BlogCard";
import type { IBlog, IUser } from "@/types";
import * as React from "react";

export const suggestedUsersForSocial: IUser[] = [
    {
        username: "john_doe",
        email: "john.doe@example.com",
        password: "hashedPassword123",
        _id: "user1",
        bio: "Tech enthusiast and blogger",
        profilePicture: {
            format: "jpg",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/john_doe.jpg",
            publicId: "profile_john_doe"
        },
        followers: ["user2", "user3"],
        following: ["user4", "user5"],
        saves: ["blog1", "blog2"],
        userBlogs: ["blog1", "blog3"],
        createdAt: new Date("2025-01-10T10:00:00Z"),
        updatedAt: new Date("2025-09-01T12:00:00Z")
    },
    {
        username: "jane_smith",
        email: "jane.smith@example.com",
        password: "hashedPassword456",
        _id: "user2",
        bio: "Lover of travel and photography",
        profilePicture: {
            format: "png",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/jane_smith.png",
            publicId: "profile_jane_smith"
        },
        followers: ["user1", "user4"],
        following: ["user3", "user5"],
        saves: ["blog3", "blog4"],
        userBlogs: ["blog2", "blog4"],
        createdAt: new Date("2025-02-15T14:30:00Z"),
        updatedAt: new Date("2025-09-02T15:00:00Z")
    },
    {
        username: "alex_wilson",
        email: "alex.wilson@example.com",
        password: "hashedPassword789",
        _id: "user3",
        bio: "Foodie and recipe creator",
        followers: ["user1", "user2"],
        following: ["user4", "user6"],
        saves: ["blog5"],
        userBlogs: ["blog5"],
        createdAt: new Date("2025-03-20T09:00:00Z"),
        updatedAt: new Date("2025-09-03T10:00:00Z")
    },
    {
        username: "emma_brown",
        email: "emma.brown@example.com",
        password: "hashedPassword101",
        _id: "user4",
        bio: "Fitness coach and motivator",
        profilePicture: {
            format: "jpg",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/emma_brown.jpg",
            publicId: "profile_emma_brown"
        },
        followers: ["user2", "user5"],
        following: ["user1", "user3"],
        saves: ["blog6"],
        userBlogs: ["blog6"],
        createdAt: new Date("2025-04-10T11:00:00Z"),
        updatedAt: new Date("2025-09-04T12:00:00Z")
    },
    {
        username: "mike_jones",
        email: "mike.jones@example.com",
        password: "hashedPassword202",
        _id: "user5",
        bio: "Gamer and tech reviewer",
        followers: ["user3", "user4"],
        following: ["user1", "user2"],
        saves: ["blog7"],
        userBlogs: ["blog7"],
        createdAt: new Date("2025-05-05T16:00:00Z"),
        updatedAt: new Date("2025-09-05T14:00:00Z")
    },
    {
        username: "sarah_lee",
        email: "sarah.lee@example.com",
        password: "hashedPassword303",
        _id: "user6",
        bio: "Artist and creative writer",
        profilePicture: {
            format: "png",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/sarah_lee.png",
            publicId: "profile_sarah_lee"
        },
        followers: ["user1", "user5"],
        following: ["user2", "user4"],
        saves: ["blog8"],
        userBlogs: ["blog8"],
        createdAt: new Date("2025-06-12T13:00:00Z"),
        updatedAt: new Date("2025-09-06T11:00:00Z")
    },
    {
        username: "david_kim",
        email: "david.kim@example.com",
        password: "hashedPassword404",
        _id: "user7",
        bio: "Entrepreneur and startup mentor",
        followers: ["user2", "user6"],
        following: ["user3", "user5"],
        saves: ["blog9"],
        userBlogs: ["blog9"],
        createdAt: new Date("2025-07-01T15:00:00Z"),
        updatedAt: new Date("2025-09-07T09:00:00Z")
    },
    {
        username: "lisa_wong",
        email: "lisa.wong@example.com",
        password: "hashedPassword505",
        _id: "user8",
        bio: "Fashion enthusiast and stylist",
        profilePicture: {
            format: "jpg",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/lisa_wong.jpg",
            publicId: "profile_lisa_wong"
        },
        followers: ["user4", "user7"],
        following: ["user1", "user6"],
        saves: ["blog10"],
        userBlogs: ["blog10"],
        createdAt: new Date("2025-08-10T17:00:00Z"),
        updatedAt: new Date("2025-09-07T10:00:00Z")
    },
    {
        username: "chris_evans",
        email: "chris.evans@example.com",
        password: "hashedPassword606",
        _id: "user9",
        bio: "Movie buff and critic",
        followers: ["user5", "user8"],
        following: ["user2", "user7"],
        saves: ["blog1", "blog3"],
        userBlogs: ["blog11"],
        createdAt: new Date("2025-08-15T12:00:00Z"),
        updatedAt: new Date("2025-09-07T11:00:00Z")
    },
    {
        username: "anna_taylor",
        email: "anna.taylor@example.com",
        password: "hashedPassword707",
        _id: "user10",
        bio: "Nature lover and hiker",
        profilePicture: {
            format: "png",
            height: 200,
            width: 200,
            url: "https://example.com/profiles/anna_taylor.png",
            publicId: "profile_anna_taylor"
        },
        followers: ["user6", "user9"],
        following: ["user3", "user8"],
        saves: ["blog2", "blog4"],
        userBlogs: ["blog12"],
        createdAt: new Date("2025-08-20T14:00:00Z"),
        updatedAt: new Date("2025-09-07T12:00:00Z")
    }
];

export const popularBlogs: IBlog[] = [
    {
        _id: "blog1",
        title: "The Future of AI in 2025",
        body: "Exploring the advancements in AI and their impact on society.",
        image: {
            format: "jpg",
            height: 600,
            width: 800,
            url: "https://imgs.search.brave.com/LRHlyrz-FEDtdPUvWj455KdmJrGTALl6aMX_NehEoW0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzJkL2Mw/L2M2LzJkYzBjNjkw/MzY3ZGM5NDcyMWM0/YmUzMzU4M2FlNjNj/LmpwZw",
            publicId: "blog_ai_future"
        },
        authorDetails: {
            username: "john_doe",
            _id: "user1",
            profilePicture: "https://example.com/profiles/john_doe.jpg"
        },
        likes: ["user2", "user3"],
        comments: ["comment1", "comment2"],
        createdAt: new Date("2025-01-15T10:00:00Z"),
        updatedAt: new Date("2025-09-01T12:00:00Z")
    },
    {
        _id: "blog2",
        title: "Top 10 Travel Destinations for 2025",
        body: "Discover the best places to visit this year.",
        image: {
            format: "png",
            height: 600,
            width: 800,
            url: "https://imgs.search.brave.com/lZgSTVLoLGk8_95IdXV_4JYyG_V9o7pk3G-QOSJYzrw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTA4/MTg2OTM1Ni9waG90/by90YWtpbmctb24t/dGhlLWxhdGUtc2hp/ZnQtd2l0aC10cnVl/LWRlZGljYXRpb24u/anBnP3M9NjEyeDYx/MiZ3PTAmaz0yMCZj/PTZjZDBYQ2M3U1hi/d2gzZ0RURGdnN3lq/bGpCUGJXOGdBbVVV/bURDUXFzOUU9",
            publicId: "blog_travel_destinations"
        },
        authorDetails: {
            username: "jane_smith",
            _id: "user2",
            profilePicture: "https://example.com/profiles/jane_smith.png"
        },
        likes: ["user1", "user4"],
        comments: ["comment3"],
        createdAt: new Date("2025-02-20T14:00:00Z"),
        updatedAt: new Date("2025-09-02T15:00:00Z")
    },
    {
        _id: "blog3",
        title: "Healthy Recipes for Busy People",
        body: "Quick and nutritious meals for a hectic lifestyle.",
        image: {
            format: "jpg",
            height: 600,
            width: 800,
            url: "https://imgs.search.brave.com/4-C5b0_ZU7sx7vJaTZxdc7ZvInOr-0E8BaWpXMLVDuw/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjE1/NTc2OTU1NS9waG90/by9hcnRpZmljaWFs/LWludGVsbGlnZW5j/ZS1jb25jZXB0LWNw/dS1xdWFudHVtLWNv/bXB1dGluZy5qcGc_/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9WXR4/RnVkc01YOVpDVmpk/Yml4ZERFTTRjSjV4/b3RNbjVnNWdnR0Jl/amdmcz0",
            publicId: "blog_healthy_recipes"
        },
        authorDetails: {
            username: "alex_wilson",
            _id: "user3",
            profilePicture: "https://example.com/profiles/alex_wilson.jpg"
        },
        likes: ["user2", "user5"],
        comments: ["comment4", "comment5"],
        createdAt: new Date("2025-03-25T09:00:00Z"),
        updatedAt: new Date("2025-09-03T10:00:00Z")
    },
    {
        _id: "blog4",
        title: "Fitness Tips for Beginners",
        body: "Start your fitness journey with these simple tips.",
        image: {
            format: "png",
            height: 600,
            width: 800,
            url: "https://imgs.search.brave.com/INjvDnGLeKWlv3jg-t8-lU3I896__gQ9Xmeu0tpaKGY/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMTUw/ODc4MDY3MS9waG90/by90b3VjaGluZy1t/ZXRhdmVyc2UuanBn/P3M9NjEyeDYxMiZ3/PTAmaz0yMCZjPTgw/YnA0NE1jM1VBNFFw/NVlrYmxBZUpmalhC/cWJ6clRUa2hQbjYt/b3JPLWM9",
            publicId: "blog_fitness_tips"
        },
        authorDetails: {
            username: "emma_brown",
            _id: "user4",
            profilePicture: "https://example.com/profiles/emma_brown.jpg"
        },
        likes: ["user1", "user6"],
        comments: ["comment6"],
        createdAt: new Date("2025-04-15T11:00:00Z"),
        updatedAt: new Date("2025-09-04T12:00:00Z")
    },
    {
        _id: "blog5",
        title: "Latest Gaming Trends in 2025",
        body: "What's new in the world of gaming this year.",
        image: {
            format: "jpg",
            height: 600,
            width: 800,
            url: "https://imgs.search.brave.com/KxK8qHvgPXvlKdCh8l5h_3GZwrV5LfGfI6SfQZR-BmM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzczLzQ5/Lzk5LzczNDk5OTdh/NGQwN2ZiYjk3MTgw/YzlhNTI2ZmI4OGZm/LmpwZw",
            publicId: "blog_gaming_trends"
        },
        authorDetails: {
            username: "mike_jones",
            _id: "user5",
            profilePicture: "https://example.com/profiles/mike_jones.jpg"
        },
        likes: ["user3", "user7"],
        comments: ["comment7", "comment8"],
        createdAt: new Date("2025-05-10T16:00:00Z"),
        updatedAt: new Date("2025-09-05T14:00:00Z")
    },
    {
        _id: "blog6",
        title: "Art Techniques for Beginners",
        body: "Learn the basics of drawing and painting.",
        image: {
            format: "png",
            height: 600,
            width: 800,
            url: "https://example.com/blogs/art_techniques.png",
            publicId: "blog_art_techniques"
        },
        authorDetails: {
            username: "sarah_lee",
            _id: "user6",
            profilePicture: "https://example.com/profiles/sarah_lee.png"
        },
        likes: ["user4", "user8"],
        comments: ["comment9"],
        createdAt: new Date("2025-06-15T13:00:00Z"),
        updatedAt: new Date("2025-09-06T11:00:00Z")
    },
    {
        _id: "blog7",
        title: "Starting a Startup in 2025",
        body: "Key steps to launching your own company.",
        image: {
            format: "jpg",
            height: 600,
            width: 800,
            url: "https://example.com/blogs/startup_guide.jpg",
            publicId: "blog_startup_guide"
        },
        authorDetails: {
            username: "david_kim",
            _id: "user7",
            profilePicture: "https://example.com/profiles/david_kim.jpg"
        },
        likes: ["user5", "user9"],
        comments: ["comment10"],
        createdAt: new Date("2025-07-05T15:00:00Z"),
        updatedAt: new Date("2025-09-07T09:00:00Z")
    },
    {
        _id: "blog8",
        title: "Fashion Trends to Watch in 2025",
        body: "Stay stylish with these upcoming trends.",
        image: {
            format: "png",
            height: 600,
            width: 800,
            url: "https://example.com/blogs/fashion_trends.png",
            publicId: "blog_fashion_trends"
        },
        authorDetails: {
            username: "lisa_wong",
            _id: "user8",
            profilePicture: "https://example.com/profiles/lisa_wong.jpg"
        },
        likes: ["user6", "user10"],
        comments: ["comment11", "comment12"],
        createdAt: new Date("2025-08-12T17:00:00Z"),
        updatedAt: new Date("2025-09-07T10:00:00Z")
    },
    {
        _id: "blog9",
        title: "Top 5 Movies of 2025",
        body: "A review of the best films released this year.",
        image: {
            format: "jpg",
            height: 600,
            width: 800,
            url: "https://example.com/blogs/top_movies.jpg",
            publicId: "blog_top_movies"
        },
        authorDetails: {
            username: "chris_evans",
            _id: "user9",
            profilePicture: "https://example.com/profiles/chris_evans.jpg"
        },
        likes: ["user7", "user10"],
        comments: ["comment13"],
        createdAt: new Date("2025-08-18T12:00:00Z"),
        updatedAt: new Date("2025-09-07T11:00:00Z")
    },
    {
        _id: "blog10",
        title: "Hiking Trails for Adventure Seekers",
        body: "Explore the best trails for your next adventure.",
        image: {
            format: "png",
            height: 600,
            width: 800,
            url: "https://example.com/blogs/hiking_trails.png",
            publicId: "blog_hiking_trails"
        },
        authorDetails: {
            username: "anna_taylor",
            _id: "user10",
            profilePicture: "https://example.com/profiles/anna_taylor.png"
        },
        likes: ["user8", "user9"],
        comments: ["comment14", "comment15"],
        createdAt: new Date("2025-08-25T14:00:00Z"),
        updatedAt: new Date("2025-09-07T12:00:00Z")
    }
];

// Component to render the popular posts
export const PopularPosts: React.FC = () => {
    return (
        <div className="space-y-6">
            {popularBlogs.map((post) => (
                <BlogCard
                    key={post._id}
                    _id={post._id}
                    title={post.title}
                    body={post.body}
                    image={{
                        url: post.image.url,
                        publicId: `blog-image-${post._id}`,
                        width: 1200,
                        height: 800,
                        format: "jpg",
                    }}
                    authorDetails={post.authorDetails}
                    likes={post.likes}
                    comments={post.comments}
                    createdAt={post.createdAt}
                    updatedAt={post.updatedAt}
                    onLike={(id) => console.log(`Liked post with id: ${id}`)}
                    onSave={(id) => console.log(`Saved post with id: ${id}`)}
                />
            ))}
        </div>
    );
};