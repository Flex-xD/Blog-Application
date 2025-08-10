import type { IFeatures } from "@/pages/Components/FeatureCard";
import FeatureCard from "@/pages/Components/FeatureCard";
import { motion } from "framer-motion";
import { Bookmark, Bot, Image, LayoutDashboard, PenSquare, Sparkles } from "lucide-react";

const FeaturesSection = () => {

    const features : IFeatures[]= [
        {
            title: "AI Blog Writer",
            description: "Generate high-quality blog posts with our advanced AI in seconds.",
            icon: <Bot className="h-6 w-6" />,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "Content Enhancer",
            description: "Improve your existing content with smart suggestions and edits.",
            icon: <Sparkles className="h-6 w-6" />,
            color: "bg-amber-100 text-amber-600",
        },
        {
            title: "Visual Editor",
            description: "Create beautiful posts with our intuitive WYSIWYG editor.",
            icon: <PenSquare className="h-6 w-6" />,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "AI Image Generator",
            description: "Automatically create images for your posts with AI.",
            icon: <Image className="h-6 w-6" />,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "Personal Dashboard",
            description: "Track your blog's performance and manage all posts in one place.",
            icon: <LayoutDashboard className="h-6 w-6" />,
            color: "bg-red-100 text-red-600",
        },
        {
            title: "Bookmark & Save",
            description: "Save your favorite articles and access them anytime.",
            icon: <Bookmark className="h-6 w-6" />,
            color: "bg-indigo-100 text-indigo-600",
        },
    ]
    return (
        <section className="py-12 md:py-20">
            <div className="text-center mb-16">
                <motion.h2
                    className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    Elevate Your <span className="text-indigo-600">Content Creation</span>
                </motion.h2>
                <motion.p
                    className="text-lg text-gray-600 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    Everything you need to create professional blog content in one place
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
                        <FeatureCard {...feature}/>
                    </motion.div>
                ))}
            </div>
        </section>
    )
}

export default FeaturesSection;