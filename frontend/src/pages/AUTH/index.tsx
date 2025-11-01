import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { BookOpen, Feather, Lock, Mail, User, PenTool } from "react-feather";
import { toast } from "sonner";
import useAuthMutation from "@/customHooks/AuthMutation";
import { Loader, Sparkles } from "lucide-react";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [activeField, setActiveField] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [loginIdentifier, setLoginIdentifier] = useState<string>("");

    const { mutateAsync, isPending: isLoading } = useAuthMutation(!isLogin);

    const validateAuth = (isSignup: boolean = false) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!isSignup ? !email.length && !username.length : !email.length) {
            toast.error("All fields are required!");
            return false;
        }
        if (!isSignup ? !username.length && !emailPattern.test(email) : !emailPattern.test(email)) {
            toast.error("Please enter a valid email address!");
            return false;
        }
        if (!password.length) {
            toast.error("Password is required!");
            return false;
        }
        if (isSignup && !username.length) {
            toast.error("Username is required!");
            return false;
        }
        return true;
    };

    const handleAuth = async () => {
        if (!validateAuth(!isLogin)) return;
        await mutateAsync({
            email: isLogin ? (email || loginIdentifier) : email,
            password,
            username: isLogin ? (username || loginIdentifier) : username,
        });
    };

    if (isLoading) return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center space-y-4"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="p-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                    <Loader className="text-white" size={32} />
                </motion.div>
                <p className="text-lg font-medium text-gray-700">Crafting your experience...</p>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0"
            >
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, 15, 0],
                        }}
                        transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.5,
                        }}
                        className={`absolute ${i === 0 ? 'w-8 h-8 left-1/4 top-1/4' : i === 1 ? 'w-6 h-6 right-1/3 top-1/2' : 'w-10 h-10 right-1/4 bottom-1/3'} bg-gradient-to-r from-indigo-200 to-purple-300 rounded-full opacity-20 blur-sm`}
                    />
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                    <div className="p-8">
                        {/* Header */}
                        <div className="flex flex-col items-center mb-8 space-y-4">
                            <motion.div
                                animate={{
                                    rotate: isLogin ? [0, -5, 0] : [0, 5, 0],
                                    scale: [1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg"
                            >
                                <BookOpen size={28} className="text-white" />
                            </motion.div>

                            <motion.div
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center"
                            >
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {isLogin ? "Welcome Back" : "Join BlogCraft"}
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    {isLogin
                                        ? "Continue your writing journey"
                                        : "Start crafting amazing stories"}
                                </p>
                            </motion.div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-6">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative group">
                                            <motion.div
                                                animate={{
                                                    scale: activeField === "email" ? 1.1 : 1,
                                                    color: activeField === "email" ? "#6366f1" : "#9ca3af"
                                                }}
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                            >
                                                <Mail size={18} />
                                            </motion.div>
                                            <motion.input
                                                onFocus={() => setActiveField("email")}
                                                onBlur={() => setActiveField(null)}
                                                whileFocus={{
                                                    borderColor: "#6366f1",
                                                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)"
                                                }}
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none transition-all group-hover:border-indigo-300"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Username/Email Field */}
                            <div className="relative group">
                                <motion.div
                                    animate={{
                                        scale: activeField === "username" ? 1.1 : 1,
                                        color: activeField === "username" ? "#6366f1" : "#9ca3af"
                                    }}
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <User size={18} />
                                </motion.div>
                                <motion.input
                                    onFocus={() => setActiveField("username")}
                                    onBlur={() => setActiveField(null)}
                                    whileFocus={{
                                        borderColor: "#6366f1",
                                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)"
                                    }}
                                    type="text"
                                    value={isLogin ? loginIdentifier : username}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const value = e.target.value;
                                        setLoginIdentifier(value);
                                        if (isLogin) {
                                            if (value.includes("@")) {
                                                setEmail(value);
                                                setUsername("");
                                            } else {
                                                setUsername(value);
                                                setEmail("");
                                            }
                                        } else {
                                            setUsername(value);
                                        }
                                    }}
                                    placeholder={isLogin ? "username or email" : "choose a username"}
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none transition-all group-hover:border-indigo-300"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative group">
                                <motion.div
                                    animate={{
                                        scale: activeField === "password" ? 1.1 : 1,
                                        color: activeField === "password" ? "#6366f1" : "#9ca3af"
                                    }}
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <Lock size={18} />
                                </motion.div>
                                <motion.input
                                    onFocus={() => setActiveField("password")}
                                    onBlur={() => setActiveField(null)}
                                    whileFocus={{
                                        borderColor: "#6366f1",
                                        boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)"
                                    }}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/50 focus:outline-none transition-all group-hover:border-indigo-300"
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <motion.button
                            whileHover={{
                                y: -2,
                                scale: 1.02,
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-4 rounded-xl font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transition-all"
                            disabled={isLoading}
                            onClick={handleAuth}
                        >
                            <motion.div
                                animate={{ rotate: isLoading ? 360 : 0 }}
                                transition={{ duration: 2, repeat: isLoading ? Infinity : 0 }}
                            >
                                {isLoading ? <Loader size={20} /> : <Feather size={20} />}
                            </motion.div>
                            <span>
                                {isLoading
                                    ? "Crafting..."
                                    : isLogin
                                        ? "Sign In"
                                        : "Start Writing"
                                }
                            </span>
                            {!isLogin && !isLoading && (
                                <Sparkles size={16} className="text-yellow-200" />
                            )}
                        </motion.button>

                        {/* Switch Auth Mode */}
                        <div className="mt-8 text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                            >
                                {isLogin
                                    ? "New to BlogCraft? Join our community →"
                                    : "Already have an account? Sign in →"
                                }
                            </motion.button>
                        </div>

                        {/* Features Preview */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 pt-6 border-t border-gray-100"
                        >
                            <p className="text-xs text-gray-500 text-center mb-3">Unlock powerful features:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {["6 Writing Tones", "AI Enhancement", "Save Blogs", "Follow Writers", "Like & Comment", "Custom Styles"].map((feature, index) => (
                                    <motion.div
                                        key={feature}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="flex items-center space-x-1 text-gray-600"
                                    >
                                        <PenTool size={10} className="text-indigo-500" />
                                        <span>{feature}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthPage;