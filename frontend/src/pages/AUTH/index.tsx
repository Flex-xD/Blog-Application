import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import useAuthMutation from "@/customHooks/AuthMutation";
import useExhibitPosts from "@/customHooks/ExhibitPosts";
import { cn } from "@/lib/utils";
import PostExhibit from "../NormalComponents/PostExhibit";

type FieldName = "identifier" | "email" | "username" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-z_.]+$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)/;

interface FieldProps {
    id: FieldName;
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete: string;
    type?: "text" | "email" | "password";
    hint?: string;
    error?: string;
    disabled?: boolean;
}

const Field = ({
    id,
    label,
    value,
    onChange,
    autoComplete,
    type = "text",
    hint,
    error,
    disabled,
}: FieldProps) => {
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className={cn(
                    "mt-2 w-full rounded-md border bg-card px-3 py-2.5 text-[15px] outline-none transition-colors duration-150",
                    "focus:border-ring focus:ring-[3px] focus:ring-ring/20",
                    "disabled:opacity-60",
                    error ? "border-destructive" : "border-input"
                )}
            />
            {error ? (
                <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-destructive">
                    {error}
                </p>
            ) : hint ? (
                <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted-foreground">
                    {hint}
                </p>
            ) : null}
        </div>
    );
};

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});

    const { mutateAsync, isPending: isLoading, error: mutationError } = useAuthMutation(!isLogin);

    const { posts, isPending: isFeedPending, isSample } = useExhibitPosts(1);
    const post = posts[0];
    const showExhibit = isFeedPending || Boolean(post);

    const serverMessage = mutationError
        ? ((mutationError as AxiosError<{ msg?: string }>).response?.data?.msg ??
        "Something went wrong. Try again.")
        : null;

    const clearError = (field: FieldName) => {
        setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    };

    const switchMode = () => {
        setIsLogin((prev) => !prev);
        setErrors({});
        setPassword("");
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const next: FieldErrors = {};

        if (isLogin) {
            if (!identifier.trim()) next.identifier = "Enter your username or email.";
            if (!password) next.password = "Enter your password.";
        } else {
            if (!email.trim()) next.email = "Enter your email.";
            else if (!EMAIL_RE.test(email.trim()))
                next.email = "That doesn't look like an email address.";

            if (!username.trim()) next.username = "Pick a username.";
            else if (!USERNAME_RE.test(username.trim()))
                next.username = "Lowercase letters, dots and underscores only.";

            if (!password) next.password = "Choose a password.";
            else if (!PASSWORD_RE.test(password))
                next.password = "Include at least one letter and one number.";
        }

        setErrors(next);
        if (Object.keys(next).length > 0) return;

        const trimmedIdentifier = identifier.trim();
        const identifierIsEmail = EMAIL_RE.test(trimmedIdentifier);

        const payload = isLogin
            ? {
                  email: identifierIsEmail ? trimmedIdentifier : "",
                  username: identifierIsEmail ? "" : trimmedIdentifier,
                  password,
              }
            : { email: email.trim(), username: username.trim(), password };

        void mutateAsync(payload).catch(() => undefined);
    };

    return (
        <main className="flex min-h-screen flex-col justify-center bg-background">
            <div className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-8">
                <div
                    className={cn(
                        showExhibit
                            ? "grid gap-14 lg:grid-cols-[minmax(0,23rem)_minmax(0,1fr)] lg:items-start lg:gap-20"
                            : "max-w-md"
                    )}
                >
                    <motion.section
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                        aria-labelledby="auth-heading"
                    >
                        <Link
                            to="/"
                            className="font-serif text-xl tracking-tight transition-colors duration-150 hover:text-muted-foreground"
                        >
                            Blogcraft
                        </Link>

                        <h1 id="auth-heading" className="mt-12 text-3xl sm:text-4xl">
                            {isLogin ? "Welcome back." : "Create your account."}
                        </h1>

                        <p className="mt-3 leading-relaxed text-muted-foreground">
                            {isLogin
                                ? "Your drafts and posts are where you left them."
                                : "A name, an email, and you're in."}
                        </p>

                        <form onSubmit={handleSubmit} noValidate className="mt-9 space-y-5">
                            {isLogin ? (
                                <Field
                                    id="identifier"
                                    label="Username or email"
                                    value={identifier}
                                    onChange={(value) => {
                                        setIdentifier(value);
                                        clearError("identifier");
                                    }}
                                    autoComplete="username"
                                    error={errors.identifier}
                                    disabled={isLoading}
                                />
                            ) : (
                                <>
                                    <Field
                                        id="email"
                                        label="Email"
                                        type="email"
                                        value={email}
                                        onChange={(value) => {
                                            setEmail(value);
                                            clearError("email");
                                        }}
                                        autoComplete="email"
                                        error={errors.email}
                                        disabled={isLoading}
                                    />
                                    <Field
                                        id="username"
                                        label="Username"
                                        value={username}
                                        onChange={(value) => {
                                            setUsername(value);
                                            clearError("username");
                                        }}
                                        autoComplete="username"
                                        hint="Lowercase letters, dots and underscores."
                                        error={errors.username}
                                        disabled={isLoading}
                                    />
                                </>
                            )}

                            <Field
                                id="password"
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(value) => {
                                    setPassword(value);
                                    clearError("password");
                                }}
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                hint={isLogin ? undefined : "At least one letter and one number."}
                                error={errors.password}
                                disabled={isLoading}
                            />

                            {serverMessage && (
                                <p role="alert" className="text-sm text-destructive">
                                    {serverMessage}
                                </p>
                            )}

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isLoading}
                                aria-busy={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" aria-hidden="true" />
                                        {isLogin ? "Signing in…" : "Creating account…"}
                                    </>
                                ) : isLogin ? (
                                    "Sign in"
                                ) : (
                                    "Create account"
                                )}
                            </Button>
                        </form>

                        <p className="mt-8 text-sm text-muted-foreground">
                            {isLogin ? "No account yet?" : "Already have one?"}{" "}
                            <button
                                type="button"
                                onClick={switchMode}
                                className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-150 hover:decoration-foreground"
                            >
                                {isLogin ? "Create one" : "Sign in"}
                            </button>
                        </p>
                    </motion.section>

                    {showExhibit && (
                        <motion.aside
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: 0.05 }}
                            className="lg:mt-20"
                        >
                            <p className="text-sm text-muted-foreground">
                                {isFeedPending
                                    ? "Loading the feed…"
                                    : isSample
                                      ? "A sample post"
                                      : "From the feed"}
                            </p>

                            {post && (
                                <div className="mt-3">
                                    <PostExhibit post={post} variant="single" />
                                </div>
                            )}
                        </motion.aside>
                    )}
                </div>
            </div>
        </main>
    );
};

export default AuthPage;
