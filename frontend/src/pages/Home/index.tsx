import { motion } from "framer-motion"
import { LayoutDashboard, PenSquare, Sparkles, Bot, Image, Bookmark,  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Navbar from "../Components/Navbar"

const Home = () => {

  const features = [
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
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sticky Navbar with scroll effects */}
      <Navbar/>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
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

          {/* Features Grid */}
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
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-indigo-100 group">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${feature.color}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="group-hover:text-indigo-600 transition-colors">
                            {feature.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Writing Process?</h2>
                <p className="text-xl mb-8">
                  Join thousands of creators who publish faster and better with BlogCraft.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="px-8 shadow-lg font-medium"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 bg-transparent text-white hover:bg-white/10 border-white/20 hover:border-white/30"
                  >
                    Schedule Demo
                  </Button>
                </div>
                <p className="text-sm mt-6 text-white/80">
                  No credit card required • 7-day free trial • Cancel anytime
                </p>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Home