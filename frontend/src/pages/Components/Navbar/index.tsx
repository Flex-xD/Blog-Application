import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store";
import { motion } from "framer-motion";
import { PenSquare, Search, Menu, Home, Users, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUserProfileData } from "@/customHooks/UserDataFetching";

const HIDDEN_SEARCH_ROUTES = ["/profile", "/"];

const NavLink = ({
    to,
    label,
    icon: Icon,
}: {
    to: string;
    label: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}) => {
    const { pathname } = useLocation();

    return (
        <Link
            to={to}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === to
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
        >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Link>
    );
};


const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, setIsCreatingBlog } = useAppStore();
    const { data: userInfo } = useUserProfileData();

    const navigateToFeedAndOpenModal = () => {
        setIsCreatingBlog(true);
        navigate("/feed");
    };

    const shouldShowSearch = !HIDDEN_SEARCH_ROUTES.includes(location.pathname);

    return (
        <motion.nav
            className="w-full px-4 sm:px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-49"
            initial={{ opacity: 1 }}
            whileHover={{ opacity: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <Link to="/" className="flex items-center space-x-2 mr-3 flex-shrink-0">
                <PenSquare className="h-6 w-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800 hidden sm:block">BlogCraft</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 space-x-3">
                <NavLink to="/feed" label="Explore" icon={Home} />
                <NavLink to="/social" label="Social" icon={Users} />
            </div>

            {shouldShowSearch && (
                <div className="flex-1 max-w-xl mx-4 hidden lg:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search for blogs . . ."
                            className="pl-10 rounded-full bg-gray-100 border-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            value={""}
                            onChange={(e) => console.log((e.target.value))}
                        />
                    </div>
                </div>
            )}

            <div className="hidden sm:flex items-center space-x-4">
                <Button
                    variant="default"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => isAuthenticated ? navigateToFeedAndOpenModal() : navigate("/auth")}
                >
                    {isAuthenticated ? "Create Post" : "LOGIN"}
                </Button>
                {isAuthenticated && (
                    <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-8 w-8 border-2 border-indigo-100 overflow-hidden">
                            <AvatarImage src={userInfo?.profilePicture?.url} className="h-full w-full object-cover" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-700 hidden md:inline">{userInfo?.username}</span>
                    </Link>
                )}
            </div>

            <div className="flex items-center space-x-2 sm:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                        <div className="flex flex-col h-full">
                            <div className="space-y-4 py-6">
                                <NavLink to="/feed" label="Explore" icon={Home} />
                                <NavLink to="/social" label="Social" icon={Users} />
                                {isAuthenticated && <NavLink to="/profile" label="Profile" icon={User} />}
                            </div>
                            <div className="mt-auto pt-6 border-t">
                                <Button
                                    className="w-full mb-4 bg-gradient-to-r from-indigo-600 to-purple-600"
                                    onClick={() => isAuthenticated ? navigateToFeedAndOpenModal() : navigate("/auth")}
                                >
                                    {isAuthenticated ? "Create Post" : "Login"}
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </motion.nav>
    );
};

export default Navbar;