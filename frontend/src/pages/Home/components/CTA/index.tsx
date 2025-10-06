import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const CallToAction = () => {
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
        <section className="py-16 md:py-24">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white overflow-hidden relative"
            >
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Share Your Story?</h2>
                    <p className="text-xl mb-8">
                        Join our community of writers and readers. Create, connect, and inspire with every post.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="secondary"
                            className="px-8 shadow-lg font-medium"
                            onClick={handleGetStarted}
                        >
                            Start Writing Now
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 bg-transparent text-white hover:bg-white/10 border-white/20 hover:border-white/30"
                            onClick={() => navigate("/feed")}
                        >
                            Explore Community
                        </Button>
                    </div>
                    <p className="text-sm mt-6 text-white/80">
                        Free forever • No credit card required • Join thousands of writers
                    </p>
                </div>
            </motion.div>
        </section>
    )
}

export default CallToAction