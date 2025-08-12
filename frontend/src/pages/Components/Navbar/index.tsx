import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/store"
import { useScroll, useTransform, motion } from "framer-motion"
import { ChevronDown, PenSquare, Search } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Navbar = () => {
    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 100], [1, 0.9])
    const scale = useTransform(scrollY, [0, 100], [1, 0.98])
    const navigate = useNavigate();

    const { setIsCreatingBlog } = useAppStore();
    const navigateToFeedAndOpenModal = (value: boolean) => {
        setIsCreatingBlog(value);
        navigate("/feed")
    }

    const {isAuthenticated} = useAppStore();
    return (
        <motion.nav
            style={{ opacity, scale }}
            className="w-full px-6 py-3 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
        >
            <div className="flex items-center space-x-2 mr-3">
                <PenSquare className="h-6 w-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-800">BlogCraft</span>
            </div>

            <div className="hidden md:flex items-center space-x-3">
                <Link to={"/feed"} className="text-gray-600 hover:bg-gray-100" onClick={() => setIsCreatingBlog(false)}>
                    Explore
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-gray-600 hover:bg-gray-100 gap-1">
                            Categories <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-48">
                        <DropdownMenuItem>Technology</DropdownMenuItem>
                        <DropdownMenuItem>Business</DropdownMenuItem>
                        <DropdownMenuItem>Lifestyle</DropdownMenuItem>
                        <DropdownMenuItem>Health</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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

            <div className="flex items-center space-x-4">
                <Button
                    variant="default"
                    className="hidden sm:inline-flex bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"

                    onClick={() => navigateToFeedAndOpenModal(true)}
                >
                    {isAuthenticated ? "Create Post" : "LOGIN"}
                </Button>
                {isAuthenticated && <Link to={"/profile"} className="flex items-center space-x-2 cursor-pointer" >
                    <Avatar className="border-2 border-indigo-100">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700 hidden md:inline">John Doe</span>
                </Link>}
            </div>
        </motion.nav>
    )

}

export default Navbar;