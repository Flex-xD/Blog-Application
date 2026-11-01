import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfileData } from "@/customHooks/UserDataFetching";

interface CreateBlogCardProps {
    setShowCreateModal: React.Dispatch<
        React.SetStateAction<boolean>
    >;
}

const CreateBlogCard = ({
    setShowCreateModal,
}: CreateBlogCardProps) => {
    const { data: userInfo } = useUserProfileData();

    return (
        <div className="mb-6 flex items-center gap-3">
            <Avatar className="size-9">
                <AvatarImage
                    src={userInfo?.profilePicture?.url}
                    className="object-cover"
                    alt=""
                />
                <AvatarFallback className="bg-muted text-sm text-muted-foreground">
                    {(userInfo?.username?.[0] ?? "ME").toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="h-10 min-w-0 flex-1 rounded-full bg-muted px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
                What's on your mind today?
            </button>
        </div>
    );
};

export default CreateBlogCard;