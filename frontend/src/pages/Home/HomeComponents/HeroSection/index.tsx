import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const HeroSection = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppStore();

    const handleGetStarted = () => {
        navigate(isAuthenticated ? "/feed" : "/auth");
    };

    return (
        <section className="pb-14 pt-20 text-center md:pb-20 md:pt-28">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="mx-auto max-w-3xl"
            >
                <h1 className="text-4xl leading-[1.12] md:text-6xl">
                    Write what you feel.
                    <br className="hidden sm:block" /> Someone out there feels it too.
                </h1>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                    Blogcraft is a small publishing space for honest posts. Write in your own words,
                    publish to your feed, and hear back from the people who read it.
                </p>

                <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={handleGetStarted}
                    >
                        Start writing
                    </Button>

                    <a
                        href="#featured"
                        className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline"
                    >
                        See what people are publishing
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;