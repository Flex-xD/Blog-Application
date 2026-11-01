import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    Search,
    Home,
    Users,
    PenSquare,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { useUserProfileData } from "@/customHooks/UserDataFetching";

interface FeedNavbarProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    onWrite: () => void;
}

export const FeedNavbar: React.FC<FeedNavbarProps> = ({
    searchQuery,
    setSearchQuery,
    onWrite,
}) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppStore();
    const { data: userInfo } = useUserProfileData();

    const handleNavbarNavigation = (endpoint: string) => {
        navigate(endpoint);
    };

    const handleSearch = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchQuery(e.target.value);
    };

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link
                        to="/"
                        className="flex shrink-0 items-center"
                    >
                        <PenSquare className="h-6 w-6 text-indigo-600" />

                        <span className="ml-2 hidden text-xl font-bold text-gray-900 sm:block">
                            BlogCraft
                        </span>
                    </Link>

                    <div className="mx-2 flex-1 sm:mx-4 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <Input
                                type="search"
                                placeholder="Search blogs..."
                                className="w-full rounded-full border-none bg-gray-100 py-1 pl-10 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={handleSearch}
                                aria-label="Search blogs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {isAuthenticated && (
                            <Button
                                onClick={onWrite}
                                variant="ghost"
                                className="hidden gap-2 sm:flex"
                            >
                                <PenSquare className="h-4 w-4" />
                                Write
                            </Button>
                        )}

                        <div className="flex items-center space-x-1">
                            <Button
                                onClick={() =>
                                    handleNavbarNavigation("/")
                                }
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:bg-gray-100"
                                aria-label="Home"
                            >
                                <Home className="h-5 w-5" />
                            </Button>

                            <Button
                                onClick={() =>
                                    handleNavbarNavigation("/social")
                                }
                                variant="ghost"
                                size="icon"
                                className="text-gray-600 hover:bg-gray-100"
                                aria-label="Social"
                            >
                                <Users className="h-5 w-5" />
                            </Button>
                        </div>

                        {isAuthenticated && (
                            <Avatar
                                onClick={() =>
                                    handleNavbarNavigation("/profile")
                                }
                                className="h-10 w-10 cursor-pointer overflow-hidden border border-indigo-100 transition-transform duration-200 hover:scale-105"
                            >
                                <AvatarImage
                                    src={
                                        userInfo?.profilePicture?.url
                                    }
                                    className="h-full w-full object-cover"
                                    alt=""
                                />

                                <AvatarFallback>
                                    ME
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};