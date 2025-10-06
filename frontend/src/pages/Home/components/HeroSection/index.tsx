import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles, PenSquare, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const HeroSection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppStore();

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/feed");
        } else {
            navigate("/auth");
        }
    };

    return (
        <section className="flex flex-col items-center justify-center py-16 md:py-24 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl"
            >
                <motion.span
                    className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-600 mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Your AI-Powered Writing Companion
                </motion.span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Write, Enhance, and <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Connect</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Create stunning blog posts with AI assistance, engage with a community of writers, and share your stories with the world.
                </p>

                {/* Feature Highlights */}
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                    <div className="flex items-center text-sm text-gray-600">
                        <PenSquare className="w-4 h-4 mr-2 text-indigo-600" />
                        AI-Enhanced Writing
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        6 Content Tones
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-blue-600" />
                        Social Community
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-red-600" />
                        Real-time Engagement
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        className="px-8 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600"
                        onClick={handleGetStarted}
                    >
                        Start Writing — It's Free
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="px-8"
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        See Features
                    </Button>
                </div>
            </motion.div>
        </section>
    )
}

export default HeroSection