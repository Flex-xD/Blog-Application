import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Search, Home, Users, PenSquare } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAppStore } from "@/store"
import { useUserProfileData } from "@/customHooks/UserDataFetching"

interface FeedNavbarProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const FeedNavbar: React.FC<FeedNavbarProps> = ({ searchQuery, setSearchQuery }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppStore();
    const { data: userInfo } = useUserProfileData();

    const handleNavbarNavigation = (endpoint: string) => {
        navigate(endpoint);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="flex items-center flex-shrink-0">
                        <PenSquare className="h-6 w-6 text-indigo-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">BlogCraft</span>
                    </Link>

                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search blogs, topics, or people..."
                                className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={handleSearch}
                                aria-label="Search blogs"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-5 w-5" />
                        </Button>

                        <div className="hidden sm:flex items-center space-x-1">
                            <Button onClick={() => handleNavbarNavigation("/")} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Home className="h-5 w-5" />
                            </Button>
                            <Button onClick={() => handleNavbarNavigation("/social")} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Users className="h-5 w-5" />
                            </Button>
                        </div>

                        {isAuthenticated && (
                            <Avatar
                                onClick={() => handleNavbarNavigation("/profile")}
                                className="h-10 w-10 border border-indigo-100 cursor-pointer overflow-hidden hover:scale-105 transition-transform duration-200"
                            >
                                <AvatarImage
                                    src={userInfo?.profilePicture?.url}
                                    className="object-cover h-full w-full"
                                />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}