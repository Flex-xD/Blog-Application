import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BookOpen, Feather, Lock, Mail, User } from "react-feather";
import apiClient from "../../utility/axiosClient";
import { AUTH_ENDPOINTS } from "../../constants/constants";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [activeField, setActiveField] = useState<string | null>(null);

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");

    const [loginIdentifier, setLoginIdentifier] = useState<string>("");

    const naviagte = useNavigate();

    const validateAuth = (isSignup: boolean = false) => {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!isSignup ? !email.length && !username.length : !email.length) {
            toast.error("All the fields are required !");
            return false;
        }
        if (!isSignup ? !username.length && !emailPattern.test(email) : !emailPattern.test(email)) {
            toast.error("Follow the correct email pattern!");
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

    const handleAuth = async (isSignup: boolean = isLogin === false) => {
        try {
            if (!validateAuth(isSignup)) return;
            const endpoint = isSignup ? AUTH_ENDPOINTS.REGISTER : AUTH_ENDPOINTS.LOGIN;
            const sideData = isSignup ? { email, password, username } : { email, password };
            const response = await apiClient.post(endpoint, sideData);;
            if (response.status === 200 || response.status === 201) {
                toast.success(response.data.msg);
                console.log("Login successful : ", response.data)
                setTimeout(() => {
                    naviagte("/")
                }, 2000)
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log({ error });
                if (error.response || error.response!.data.msg) {
                    return toast.error(error.response?.data.msg);
                }
                return toast.error(`${isSignup ? "Signup" : "Login"} failed!`);
            } else {
                toast.error("An error occurred!");
            }
        }
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-stone-200/70"
                >
                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8 space-y-3">
                            <motion.div
                                animate={{ rotate: isLogin ? 0 : 5 }}
                                transition={{ type: "spring" }}
                                className="p-3 rounded-full bg-amber-50 text-amber-600"
                            >
                                <BookOpen size={24} />
                            </motion.div>
                            <motion.h1
                                key={isLogin ? "login" : "register"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-serif font-bold text-stone-800"
                            >
                                {isLogin ? "Welcome back" : "Join our story"}
                            </motion.h1>
                            <p className="text-stone-500 text-center">
                                {isLogin
                                    ? "Continue your reading journey"
                                    : "Create your account to start writing"}
                            </p>
                        </div>

                        <div className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative">
                                            <motion.div
                                                animate={{
                                                    x: activeField === "email" ? 4 : 0,
                                                    opacity: activeField === "email" ? 1 : 0.7
                                                }}
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                            >
                                                <Mail size={18} className="text-stone-400" />
                                            </motion.div>
                                            <motion.input
                                                onFocus={() => setActiveField("email")}
                                                onBlur={() => setActiveField(null)}
                                                whileFocus={{
                                                    borderColor: "#f59e0b",
                                                    boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)"
                                                }}
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your@email.com"
                                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none transition-all"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative">
                                <motion.div
                                    animate={{
                                        x: activeField === "username" ? 4 : 0,
                                        opacity: activeField === "username" ? 1 : 0.7
                                    }}
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <User size={18} className="text-stone-400" />
                                </motion.div>
                                <motion.input
                                    onFocus={() => setActiveField("username")}
                                    onBlur={() => setActiveField(null)}
                                    whileFocus={{
                                        borderColor: "#f59e0b",
                                        boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)"
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
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none transition-all"
                                />
                            </div>

                            <div className="relative">
                                <motion.div
                                    animate={{
                                        x: activeField === "password" ? 4 : 0,
                                        opacity: activeField === "password" ? 1 : 0.7
                                    }}
                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                                >
                                    <Lock size={18} className="text-stone-400" />
                                </motion.div>
                                <motion.input
                                    onFocus={() => setActiveField("password")}
                                    onBlur={() => setActiveField(null)}
                                    whileFocus={{
                                        borderColor: "#f59e0b",
                                        boxShadow: "0 0 0 3px rgba(245, 158, 11, 0.1)"
                                    }}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none transition-all"
                                />
                            </div>

                            {isLogin && (
                                <div className="flex items-center justify-between pt-1">
                                    <motion.label
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center space-x-2 cursor-pointer"
                                    >
                                        <input type="checkbox" className="rounded text-amber-500" />
                                        <span className="text-sm text-stone-600">Remember me</span>
                                    </motion.label>
                                    <motion.a
                                        whileHover={{ scale: 1.02 }}
                                        href="#"
                                        className="text-sm text-amber-600 hover:text-amber-500"
                                    >
                                        Forgot password?
                                    </motion.a>
                                </div>
                            )}
                        </div>

                        <motion.button

                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-6 bg-stone-900 hover:bg-stone-800 text-white py-3.5 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                            onClick={() => handleAuth(!isLogin)}

                        >
                            <Feather size={18} />
                            <span>{isLogin ? "Sign in" : "Begin writing"}</span>
                        </motion.button>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-stone-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-3 bg-white text-stone-500">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {["Google", "Twitter"].map((provider) => (
                                    <motion.button
                                        key={provider}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="button"
                                        className="w-full inline-flex justify-center py-2.5 px-4 border border-stone-200 rounded-lg font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                                    >
                                        {provider}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-amber-600 hover:text-amber-500 font-medium"
                            >
                                {isLogin
                                    ? "New here? Create an account"
                                    : "Already have an account? Sign in"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default AuthPage;