import { UserProfile } from "..";

export function UserProfilePage() {
    const user = {
        id: "user-123",
        username: "johndoe",
        email: "john@example.com",
        profilePic: "/avatars/john.jpg",
        bio: "Frontend developer passionate about React and TypeScript. Writing about web development and design systems.",
        followers: 1243,
        following: 56,
        savedBlogs: 28,
    };

    const blogs = [
        {
            id: "blog-1",
            title: "Mastering React Hooks",
            body: "React Hooks have revolutionized how we write React components. In this comprehensive guide, we'll explore all the built-in hooks and how to create your own custom hooks for reusable logic...",
            likes: 245,
            comments: 32,
            publishedAt: "2023-05-15T10:00:00Z",
        },
        {
            id: "blog-2",
            title: "TypeScript Best Practices",
            body: "TypeScript can significantly improve your development experience when used correctly. Here are the patterns and practices I've found most valuable after 3 years of TypeScript development...",
            likes: 189,
            comments: 14,
            publishedAt: "2023-03-22T14:30:00Z",
        },
    ];

    const handleFollow = () => {
        console.log("Follow action");
    };

    const handleEditProfile = () => {
        console.log("Edit profile");
    };

    return (
        <UserProfile
            user={user}
            blogs={blogs}
            isCurrentUser={false} // Set to true if viewing own profile
            onFollow={handleFollow}
            onEditProfile={handleEditProfile}
        />
    );
}