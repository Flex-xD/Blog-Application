import Navbar from "../Components/Navbar"
import HeroSection from "./components/HeroSection"
import FeaturesSection from "./components/FeaturesSection"
import CallToAction from "./components/CTA"
import { useUserProfileData } from "@/customHooks/UserDataFetching"

const Home = () => {
  // const { data, isLoading, isError, error } = useUserProfileData();
  // if (isLoading) return <p>"Loading ....."</p>
  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <FeaturesSection />
          <CallToAction />
        </div>
      </main>
    </div>
  )
}

export default Home