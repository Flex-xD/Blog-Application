import type { IBlog, IUser } from "@/types";

// ? DUMMY DATA FOR FEED PAGE 

export const blogs: IBlog[] = [
    {
        _id: "1",
        title: "The Evolution of Modern Web Development",
        body: "In the past decade, web development has undergone a radical transformation. From static HTML pages to dynamic single-page applications...",
        image: {
            format: "jpg",
            height: 400,
            width: 800,
            url: "https://picsum.photos/id/1015/800/400",
            publicId: "sample-public-id-1015"
        },
        authorDetails: {
            _id: "u1",
            username: "alexjohnson",
            profilePicture: "https://randomuser.me/api/portraits/men/45.jpg"
        },
        likes: ["u2", "u3", "u4"],
        comments: ["c1", "c2", "c3"],
        createdAt: new Date("2023-06-20T14:30:00Z"),
        updatedAt: new Date("2023-06-25T10:00:00Z")
    },
    {
        _id: "2",
        title: "Understanding TypeScript: A Comprehensive Guide",
        body: "TypeScript has become an essential tool for modern web development...",
        image: {
            format: "jpg",
            height: 400,
            width: 800,
            url: "https://picsum.photos/id/1025/800/400",
            publicId: "sample-public-id-1025"
        },
        authorDetails: {
            _id: "u2",
            username: "mariachen",
            profilePicture: "https://randomuser.me/api/portraits/women/32.jpg"
        },
        likes: ["u1", "u3", "u5"],
        comments: ["c4", "c5"],
        createdAt: new Date("2023-05-15T09:15:00Z"),
        updatedAt: new Date("2023-05-18T12:00:00Z")
    },
    {
        _id: "3",
        title: "Exploring the Power of Serverless Architecture",
        body: "Serverless computing eliminates the need for managing servers...",
        image: {
            format: "jpg",
            height: 400,
            width: 800,
            url: "https://picsum.photos/id/1003/800/400",
            publicId: "sample-public-id-1003"
        },
        authorDetails: {
            _id: "u3",
            username: "noahkim",
            profilePicture: "https://randomuser.me/api/portraits/men/21.jpg"
        },
        likes: ["u1", "u2", "u4"],
        comments: ["c6"],
        createdAt: new Date("2024-01-08T12:45:00Z"),
        updatedAt: new Date("2024-01-10T10:30:00Z")
    },
    {
        _id: "4",
        title: "Why You Should Care About Web Performance in 2025",
        body: "Performance is a ranking factor, a UX must-have, and a conversion booster...",
        image: {
            format: "jpg",
            height: 400,
            width: 800,
            url: "https://picsum.photos/id/1044/800/400",
            publicId: "sample-public-id-1044"
        },
        authorDetails: {
            _id: "u4",
            username: "emilypark",
            profilePicture: "https://randomuser.me/api/portraits/women/68.jpg"
        },
        likes: ["u1", "u2", "u3", "u5"],
        comments: ["c7", "c8"],
        createdAt: new Date("2024-12-03T16:00:00Z"),
        updatedAt: new Date("2024-12-05T11:00:00Z")
    },
    {
        _id: "5",
        title: "Top 10 VS Code Extensions to Boost Productivity",
        body: "Visual Studio Code is one of the most popular code editors today...",
        image: {
            format: "jpg",
            height: 400,
            width: 800,
            url: "https://picsum.photos/id/1050/800/400",
            publicId: "sample-public-id-1050"
        },
        authorDetails: {
            _id: "u5",
            username: "leofernandez",
            profilePicture: "https://randomuser.me/api/portraits/men/54.jpg"
        },
        likes: ["u2", "u4", "u3"],
        comments: ["c9", "c10", "c11"],
        createdAt: new Date("2025-07-10T11:00:00Z"),
        updatedAt: new Date("2025-07-12T09:30:00Z")
    }
]

export type TypeTrendingTopics = {
    id:string
    name: string, postCount: string
}
export const trendingTopics:TypeTrendingTopics[]= [
    { id:"1" , name: "#ReactJS", postCount: "12.5K" },
    { id:"2" , name: "#TypeScript", postCount: "8.2K" },
    { id:"3", name: "#NextJS", postCount: "6.7K" },
    { id:"4" , name: "#WebDev", postCount: "5.9K" },
    { id:"5" , name: "#AI", postCount: "15.3K" },
];

export const fakeUsersArray: IUser[] = [
    {
        _id: '1',
        username: 'EmmaJohnson',
        email: 'emma.johnson@example.com',
        password: 'hashed_password_1',
        bio: 'Digital artist and creative writer. Exploring the intersection of technology and art.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'emma_johnson_profile'
        },
        followers: ['2', '3', '4'],
        following: ['2', '5'],
        saves: ['101', '102'],
        userBlogs: ['201', '202'],
        createdAt: new Date('2022-03-15'),
        updatedAt: new Date('2023-08-10')
    },
    {
        _id: '2',
        username: 'AlexChen',
        email: 'alex.chen@example.com',
        password: 'hashed_password_2',
        bio: 'Tech enthusiast and software developer. Building the future one line of code at a time.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'alex_chen_profile'
        },
        followers: ['1', '3', '5', '6'],
        following: ['1', '3', '7'],
        saves: ['103', '104'],
        userBlogs: ['203', '204'],
        createdAt: new Date('2021-11-20'),
        updatedAt: new Date('2023-07-22')
    },
    {
        _id: '3',
        username: 'SophiaMartinez',
        email: 'sophia.martinez@example.com',
        password: 'hashed_password_3',
        bio: 'Travel blogger and photographer. Capturing moments and stories from around the world.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            format: 'jpg',
            width: 2071,
            height: 2071,
            publicId: 'sophia_martinez_profile'
        },
        followers: ['1', '2', '4', '7', '8'],
        following: ['2', '5', '9'],
        saves: ['105', '106'],
        userBlogs: ['205', '206'],
        createdAt: new Date('2022-05-10'),
        updatedAt: new Date('2023-09-05')
    },
    {
        _id: '4',
        username: 'JamesWilson',
        email: 'james.wilson@example.com',
        password: 'hashed_password_4',
        bio: 'Food critic and culinary expert. Exploring flavors and culinary traditions globally.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            format: 'jpg',
            width: 2070,
            height: 2070,
            publicId: 'james_wilson_profile'
        },
        followers: ['1', '3', '5', '9'],
        following: ['1', '6', '10'],
        saves: ['107', '108'],
        userBlogs: ['207', '208'],
        createdAt: new Date('2022-01-30'),
        updatedAt: new Date('2023-08-28')
    },
    {
        _id: '5',
        username: 'OliviaBrown',
        email: 'olivia.brown@example.com',
        password: 'hashed_password_5',
        bio: 'Fitness coach and wellness advocate. Helping people live healthier, happier lives.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1888&q=80',
            format: 'jpg',
            width: 1888,
            height: 1888,
            publicId: 'olivia_brown_profile'
        },
        followers: ['2', '4', '6', '10'],
        following: ['2', '3', '7'],
        saves: ['109', '110'],
        userBlogs: ['209', '210'],
        createdAt: new Date('2021-12-05'),
        updatedAt: new Date('2023-07-15')
    },
    {
        _id: '6',
        username: 'MichaelTaylor',
        email: 'michael.taylor@example.com',
        password: 'hashed_password_6',
        bio: 'Entrepreneur and startup advisor. Passionate about innovation and business growth.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'michael_taylor_profile'
        },
        followers: ['2', '4', '5', '7', '8'],
        following: ['4', '8', '9'],
        saves: ['111', '112'],
        userBlogs: ['211', '212'],
        createdAt: new Date('2022-02-18'),
        updatedAt: new Date('2023-09-12')
    },
    {
        _id: '7',
        username: 'IsabellaGarcia',
        email: 'isabella.garcia@example.com',
        password: 'hashed_password_7',
        bio: 'Fashion designer and style influencer. Creating trends and celebrating individuality.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80',
            format: 'jpg',
            width: 1964,
            height: 1964,
            publicId: 'isabella_garcia_profile'
        },
        followers: ['3', '5', '6', '9', '10'],
        following: ['3', '5', '10'],
        saves: ['113', '114'],
        userBlogs: ['213', '214'],
        createdAt: new Date('2022-04-22'),
        updatedAt: new Date('2023-08-05')
    },
    {
        _id: '8',
        username: 'WilliamLee',
        email: 'william.lee@example.com',
        password: 'hashed_password_8',
        bio: 'Music producer and audio engineer. Crafting sounds that move the soul.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'william_lee_profile'
        },
        followers: ['3', '6', '9'],
        following: ['6', '9'],
        saves: ['115', '116'],
        userBlogs: ['215', '216'],
        createdAt: new Date('2022-06-14'),
        updatedAt: new Date('2023-07-30')
    },
    {
        _id: '9',
        username: 'MiaAnderson',
        email: 'mia.anderson@example.com',
        password: 'hashed_password_9',
        bio: 'Environmental scientist and climate activist. Working towards a sustainable future.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'mia_anderson_profile'
        },
        followers: ['4', '7', '8', '10'],
        following: ['3', '6', '8'],
        saves: ['117', '118'],
        userBlogs: ['217', '218'],
        createdAt: new Date('2022-01-08'),
        updatedAt: new Date('2023-09-01')
    },
    {
        _id: '10',
        username: 'BenjaminClark',
        email: 'benjamin.clark@example.com',
        password: 'hashed_password_10',
        bio: 'History professor and author. Uncovering stories from the past to understand our present.',
        profilePicture: {
            url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            format: 'jpg',
            width: 1887,
            height: 1887,
            publicId: 'benjamin_clark_profile'
        },
        followers: ['4', '5', '7', '9'],
        following: ['4', '7'],
        saves: ['119', '120'],
        userBlogs: ['219', '220'],
        createdAt: new Date('2022-03-03'),
        updatedAt: new Date('2023-08-20')
    }
];