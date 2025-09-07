import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Search, Home, Bookmark, Bell, PenSquare } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAppStore } from "@/store"

export const FeedNavbar = () => {
    const navigate = useNavigate();
    const { setIsCreatingBlog, isAuthenticated } = useAppStore();

    const navigateToFeedAndOpenModal = (value: boolean) => {
        setIsCreatingBlog(value);
        navigate("/feed")
    }

    const handleNavbarNavigation = (endpoint:string) => {
        navigate(endpoint);
    }
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Left side - Logo */}
                    <Link to="/" className="flex items-center flex-shrink-0">
                        <PenSquare className="h-6 w-6 text-indigo-600" />
                        <span className="ml-2 text-xl font-bold text-gray-900 hidden sm:block">BlogCraft</span>
                    </Link>

                    {/* Center - Search */}
                    <div className="flex-1 max-w-xl mx-4 hidden md:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search blogs, topics, or people..."
                                className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Right side - Navigation */}
                    <div className="flex items-center space-x-3">
                        {/* Mobile Search */}
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Desktop Navigation */}
                        <div className="hidden sm:flex items-center space-x-1">
                            <Button onClick={() => handleNavbarNavigation("/")} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Home className="h-5 w-5" />
                            </Button>
                            <Button  onClick={() => handleNavbarNavigation("/profile")} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Bookmark className="h-5 w-5" />
                            </Button>
                            <Button onClick={() => handleNavbarNavigation("/notifications")} variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="hidden sm:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 ml-2"
                                onClick={() => navigateToFeedAndOpenModal(true)}
                            >
                                Create
                            </Button>
                        </div>

                        {/* Profile */}
                        {isAuthenticated && (
                            <Avatar onClick={() => handleNavbarNavigation("/profile")} className="h-8 w-8 border-2 border-indigo-100 cursor-pointer">
                                <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}