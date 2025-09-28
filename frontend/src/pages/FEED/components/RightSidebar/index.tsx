import type { IUser } from "@/types"
import { motion } from "framer-motion"
import { TrendingUp, PenSquare } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useState } from "react"

type RightSidebarProps = {
    suggestedUsers: IUser[] ,
    trendingTopics: {
        name: string
        posts: string
    }[]
}

const RightSidebar = ({ suggestedUsers, trendingTopics }: RightSidebarProps) => {
    const [showCreateModal, setShowCreateModal] = useState(false)

    return (
        <div className="lg:w-80 space-y-6" >
            {/* Trending Topics */}
            < motion.div
                initial={{ opacity: 0, x: 20 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
                <h3 className="font-semibold text-lg mb-4 flex items-center" >
                    <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                    Trending Topics
                </h3>
                < div className="space-y-4" >
                    {
                        trendingTopics.map((topic, index) => (
                            <div key={index} className="flex justify-between items-center" >
                                <span className="font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer" >
                                    {topic.name}
                                </span>
                                < span className="text-sm text-gray-500" > {topic.posts} posts </span>
                            </div>
                        ))
                    }
                </div>
            </motion.div>

            {/* Suggested Users */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
                <h3 className="font-semibold text-lg mb-4" > Suggested Creators </h3>
                < div className="space-y-4" >
                    {
                        suggestedUsers.map((user, index) => (
                            <div key={index} className="flex items-center space-x-3" >
                                <Avatar className="h-10 w-10" >
                                    <AvatarImage src={user.profilePicture?.url} />
                                    <AvatarFallback>{user.username.charAt(0)} </AvatarFallback>
                                </Avatar>
                                < div className="flex-1 min-w-0" >
                                    <p className="font-medium truncate" > {user.username} </p>
                                    < p className="text-sm text-gray-500 truncate" > {user.bio} </p>
                                </div>
                                < Button variant="outline" size="sm" className="rounded-full" >
                                    Follow
                                </Button>
                            </div>
                        ))
                    }
                </div>
            </motion.div>

            {/* Create Blog Floating Button (Mobile) */}
            <div className="fixed bottom-6 right-6 lg:hidden" >
                <Button
                    size="lg"
                    className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => setShowCreateModal(true)}
                >
                    <PenSquare className="h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}

export default RightSidebar
