import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { UserProfile } from "./UserProfile";
import { Loader } from "lucide-react";
import type { IBlog } from "@/types";


export function UserProfilePage() {

    const { data: user, isLoading } = useUserProfileData();
    if (isLoading) return <div className=" h-screen w-screen flex items-center justify-center"><Loader /></div>
    console.log('Before !user check:', user);
    if (!user) return null;
    const userBlogs = user.userBlogs as unknown as IBlog[]

    return (
        <UserProfile
            user={{
                ...user,
                profilePicture: typeof user.profilePicture === "object" && user.profilePicture !== null
                    ? user.profilePicture
                    : undefined
            }}
            blogs={userBlogs}
            isCurrentUser={true}
            isLoading={isLoading}
        />
    )
}