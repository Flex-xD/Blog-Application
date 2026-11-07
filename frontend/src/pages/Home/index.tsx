import Navbar from "../NormalComponents/Navbar";
import HeroSection from "./HomeComponents/HeroSection";
import CallToAction from "./HomeComponents/CTA";
import FeaturedPosts from "./HomeComponents/FeaturedPost";

const Home = () => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <HeroSection />

                <FeaturedPosts />

                <CallToAction />
            </main>
        </div>
    );
};

export default Home;