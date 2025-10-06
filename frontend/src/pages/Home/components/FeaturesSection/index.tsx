import type { IFeatures } from "@/pages/Components/FeatureCard";
import FeatureCard from "@/pages/Components/FeatureCard";
import { motion } from "framer-motion";
import { Bot, MessageCircle, Users, TrendingUp, BookOpen, Sparkles, PenSquare } from "lucide-react";

const FeaturesSection = () => {

    const features: IFeatures[] = [
        {
            title: "AI Content Enhancer",
            description: "Transform your writing with 6 different tones and styles. Let AI help you refine and perfect your content.",
            icon: <Bot className="h-6 w-6" />,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "Smart Writing Assistant",
            description: "AI detects your intent and suggests better titles, structure, and content improvements.",
            icon: <Sparkles className="h-6 w-6" />,
            color: "bg-amber-100 text-amber-600",
        },
        {
            title: "Interactive Feed",
            description: "Discover amazing content, like, comment, and engage with writers from around the world.",
            icon: <MessageCircle className="h-6 w-6" />,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Social Community",
            description: "Connect with fellow writers, find popular creators, and build your audience.",
            icon: <Users className="h-6 w-6" />,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Popular Posts",
            description: "See what's trending in the community and get inspired by top-performing content.",
            icon: <TrendingUp className="h-6 w-6" />,
            color: "bg-red-100 text-red-600",
        },
        {
            title: "Save & Organize",
            description: "Bookmark your favorite blogs and create personalized reading lists.",
            icon: <BookOpen className="h-6 w-6" />,
            color: "bg-indigo-100 text-indigo-600",
        },
    ]

    return (
        <section id="features" className="py-12 md:py-20">
            <div className="text-center mb-16">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    Everything You Need to <span className="text-indigo-600">Write Better</span>
                </motion.h2>
                <motion.p
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    From AI-powered writing tools to a vibrant community, we've got you covered
                </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <FeatureCard {...feature} />
                    </motion.div>
                ))}
            </div>

            {/* Story Flow */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mt-20 bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
            >
                <div className="text-center max-w-3xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Writing Journey Starts Here</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PenSquare className="h-6 w-6 text-indigo-600" />
                            </div>
                            <h4 className="font-semibold mb-2">1. Write</h4>
                            <p className="text-sm text-gray-600">Start with your ideas</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold mb-2">2. Enhance</h4>
                            <p className="text-sm text-gray-600">AI helps you improve</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold mb-2">3. Share</h4>
                            <p className="text-sm text-gray-600">Publish to the community</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold mb-2">4. Engage</h4>
                            <p className="text-sm text-gray-600">Connect with readers</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}

export default FeaturesSection;