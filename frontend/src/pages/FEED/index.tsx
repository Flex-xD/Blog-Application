import { BlogCard } from "./components/BLOG";

const Feed = () => {
    const blogs = [
        {
            id: "1",
            title: "The Evolution of Modern Web Development",
            body: "In the past decade, web development has undergone a radical transformation. From static HTML pages to dynamic single-page applications, the landscape has changed dramatically. Modern frameworks like React, Vue, and Angular have enabled developers to build complex applications with maintainable code...",
            author: {
                name: "Alex Johnson",
                avatar: "https://randomuser.me/api/portraits/men/45.jpg",
            },
            image: "https://picsum.photos/id/1015/800/400",
            likes: 128,
            comments: 24,
            publishedAt: "2023-06-20T14:30:00Z",
        },
        {
            id: "2",
            title: "Understanding TypeScript: A Comprehensive Guide",
            body: "TypeScript has become an essential tool for modern web development. This guide covers everything from basic types to advanced patterns. Learn how TypeScript can help catch errors early and improve your development experience...",
            author: {
                name: "Maria Chen",
                avatar: "https://randomuser.me/api/portraits/women/32.jpg",
            },
            image: "https://picsum.photos/id/1025/800/400",
            likes: 95,
            comments: 18,
            publishedAt: "2023-05-15T09:15:00Z",
        },
        {
            id: "3",
            title: "Exploring the Power of Serverless Architecture",
            body: "Serverless computing eliminates the need for managing servers, allowing developers to focus on writing code. Learn how AWS Lambda, Vercel, and Cloudflare Workers are shaping the future of scalable apps...",
            author: {
                name: "Noah Kim",
                avatar: "https://randomuser.me/api/portraits/men/21.jpg",
            },
            image: "https://picsum.photos/id/1003/800/400",
            likes: 67,
            comments: 10,
            publishedAt: "2024-01-08T12:45:00Z",
        },
        {
            id: "4",
            title: "Why You Should Care About Web Performance in 2025",
            body: "Performance is a ranking factor, a UX must-have, and a conversion booster. Dive into lazy loading, image optimization, and hydration strategies every frontend dev should know...",
            author: {
                name: "Emily Park",
                avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            },
            image: "https://picsum.photos/id/1044/800/400",
            likes: 143,
            comments: 29,
            publishedAt: "2024-12-03T16:00:00Z",
        },
        {
            id: "5",
            title: "Top 10 VS Code Extensions to Boost Productivity",
            body: "Visual Studio Code is one of the most popular code editors today. These extensions will help you debug faster, write cleaner code, and customize your workflow like a pro...",
            author: {
                name: "Leo Fernandez",
                avatar: "https://randomuser.me/api/portraits/men/54.jpg",
            },
            image: "https://picsum.photos/id/1050/800/400",
            likes: 110,
            comments: 21,
            publishedAt: "2025-07-10T11:00:00Z",
        },
    ];


    const handleLike = (id: string) => {
        console.log(`Liked blog ${id}`);
        // Add your like logic here
    };

    return (
        <div className="space-y-6 p-4 mt-18 max-w-6xl mx-auto">
            {blogs.map((blog) => (
                <BlogCard
                    key={blog.id}
                    {...blog}
                    onLike={handleLike}
                />
            ))}
        </div>
    );
}

export default Feed