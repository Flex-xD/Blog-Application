import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { UserProfile } from "./UserProfile";
import { Loader } from "lucide-react";
import type { IBlog } from "@/types";


export function UserProfilePage() {

    const handleFollow = () => {
        console.log("Follow action");
    };

    const handleEditProfile = () => {
        console.log("Edit profile");
    };

    const { data: user, isLoading } = useUserProfileData();
    console.log(user);
    if (isLoading) return <div className=" h-screen w-screen flex items-center justify-center"><Loader /></div>
    if (!user) return null; // or show a fallback UI
    const userBlogs = user.userBlogs as unknown as IBlog[]

    return (
        <UserProfile
            user={{
                ...user,
                profilePicture: typeof user.profilePicture === "object" && user.profilePicture !== null
                    ? user.profilePicture.url
                    : user.profilePicture
            }}
            blogs={userBlogs}
            isCurrentUser={true} // Set to true if viewing own profile
            isLoading={isLoading}
            onFollow={handleFollow}
            onEditProfile={handleEditProfile}
        />
    )
}