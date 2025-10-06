import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/store"
import { useScroll, useTransform, motion } from "framer-motion"
import { ChevronDown, PenSquare, Search, Menu, Home, Users, User } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useUserProfileData } from "@/customHooks/UserDataFetching"

const Navbar = () => {
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 100], [1, 0.9])
    const scale = useTransform(scrollY, [0, 100], [1, 0.98])
    const navigate = useNavigate();
    const location = useLocation();

    const { setIsCreatingBlog, isAuthenticated } = useAppStore();

    const navigateToFeedAndOpenModal = (value: boolean) => {
        setIsCreatingBlog(value);
        navigate("/feed")
    }
    const { data: userInfo } = useUserProfileData();

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.nav
            style={{ opacity, scale }}
            className="w-full px-4 sm:px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-49"
        >
            <Link to="/" className="flex items-center space-x-2 mr-3 flex-shrink-0">
                <PenSquare className="h-6 w-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800 hidden sm:block">BlogCraft</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 space-x-3">
                <Link
                    to="/feed"
                    className={`px-3 py-2 rounded-lg transition-colors ${isActive('/feed') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setIsCreatingBlog(false)}
                >
                    Explore
                </Link>
                <Link
                    to="/social"
                    className={`px-3 py-2 rounded-lg transition-colors ${isActive('/social') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    onClick={() => setIsCreatingBlog(false)}
                >
                    Social
                </Link>
            </div>


            <div className="flex-1 max-w-xl mx-4 hidden lg:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder="Search for blogs, topics, or authors..."
                        className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="hidden sm:flex items-center space-x-4">
                <Button
                    variant="default"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => isAuthenticated ? navigateToFeedAndOpenModal(true) : navigate("/auth")}
                >
                    {isAuthenticated ? "Create Post" : "LOGIN"}
                </Button>
                {isAuthenticated && (
                    <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-8 w-8 border-2 border-indigo-100 overflow-hidden">
                            <AvatarImage
                                src={userInfo?.profilePicture?.url}
                                className="h-full w-full object-cover"
                            />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>

                        <span className="font-medium text-gray-700 hidden md:inline">John Doe</span>
                    </Link>
                )}
            </div>

            {/* Mobile Menu */}
            <div className="flex items-center space-x-2 sm:hidden">
                {/* Mobile Search Icon */}
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Search className="h-5 w-5" />
                </Button>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                        <div className="flex flex-col h-full">
                            {/* Mobile Navigation */}
                            <div className="space-y-4 py-6">
                                <Link
                                    to="/feed"
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive('/feed') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setIsCreatingBlog(false)}
                                >
                                    <Home className="h-5 w-5" />
                                    <span>Explore</span>
                                </Link>
                                <Link
                                    to="/social"
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive('/social') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setIsCreatingBlog(false)}
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Social</span>
                                </Link>
                                {isAuthenticated && (
                                    <Link
                                        to="/profile"
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <User className="h-5 w-5" />
                                        <span>Profile</span>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Categories */}
                            <div className="py-6 border-t">
                                <h3 className="px-3 text-sm font-medium text-gray-500 mb-3">Categories</h3>
                                <div className="space-y-2">
                                    {['Technology', 'Business', 'Lifestyle', 'Health'].map((category) => (
                                        <Button key={category} variant="ghost" className="w-full justify-start text-gray-600">
                                            {category}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Auth Section */}
                            <div className="mt-auto pt-6 border-t">
                                {isAuthenticated ? (
                                    <Button
                                        className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                                        onClick={() => navigateToFeedAndOpenModal(true)}
                                    >
                                        Create Post
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                                        onClick={() => navigate("/auth")}
                                    >
                                        Login
                                    </Button>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </motion.nav>
    )
}

export default Navbar;