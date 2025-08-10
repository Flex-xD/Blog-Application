import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
const HeroSection = () => {
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
                    Introducing BlogCraft AI
                </motion.span>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                    Craft <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Exceptional</span> Content
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    The all-in-one platform for modern bloggers with AI-powered tools to create, enhance, and publish stunning content.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="px-8 shadow-lg">
                        Start Writing — It's Free
                    </Button>
                    <Button size="lg" variant="outline" className="px-8">
                        <Sparkles className="w-4 h-4 mr-2" />
                        See AI in Action
                    </Button>
                </div>
            </motion.div>
        </section>
    )
}

export default HeroSection