import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const CallToAction = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppStore();

    return (
        <section
            id="how"
            aria-labelledby="how-heading"
            className="border-t border-border py-12 md:py-16"
        >
            <div className="mx-auto max-w-2xl text-center">
                <h2 id="how-heading" className="text-2xl md:text-3xl">
                    How it works
                </h2>

                <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                    You write in a plain composer and hit publish. Your post lands in the feed,
                    where readers can like it and answer in the comments. Anything you save stays
                    with your profile, ready for the next time you sit down to write.
                </p>

                <Button
                    variant="outline"
                    size="lg"
                    className="mt-7 px-8"
                    onClick={() => navigate(isAuthenticated ? "/feed" : "/auth")}
                >
                    {isAuthenticated ? "Go to your feed" : "Create an account"}
                </Button>
            </div>
        </section>
    );
};

export default CallToAction;