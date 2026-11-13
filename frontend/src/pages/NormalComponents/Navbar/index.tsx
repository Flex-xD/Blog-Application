import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PenSquare, Search, Users, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import { cn } from "@/lib/utils";

interface NavLinkItem {
    to: string;
    label: string;
}

const NAV_LINKS: NavLinkItem[] = [
    { to: "/feed", label: "Explore" },
    { to: "/social", label: "People" },
];

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isAuthenticated, setIsCreatingBlog } = useAppStore();
    const { data: userInfo } = useUserProfileData();

    const routeSearch = searchParams.get("q") ?? "";
    const [term, setTerm] = useState(routeSearch);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (routeSearch !== term) setTerm(routeSearch);

    }, [routeSearch]);

    const onFeed = location.pathname === "/feed";

    const isPublicRoute = location.pathname === "/";

    const writeTarget = () => {
        setIsCreatingBlog(true);
        navigate("/feed");
    };

    const writeLabel = isAuthenticated ? "Write" : "Log in";

    console.log("Is Authenticated : " , isAuthenticated);

    const updateQuery = (value: string) => {
        setTerm(value);
        if (!onFeed) return;
        setSearchParams(
            (prev) => {
                if (value) prev.set("q", value);
                else prev.delete("q");
                return prev;
            },
            { replace: true }
        );
    };

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = term.trim();
        const next = q ? `/feed?q=${encodeURIComponent(q)}` : "/feed";
        if (location.pathname === "/feed") {
            setSearchParams(
                (prev) => {
                    if (q) prev.set("q", q);
                    else prev.delete("q");
                    return prev;
                },
                { replace: true }
            );
        } else {
            navigate(next);
        }
        setMobileSearchOpen(false);
    };

    const isActive = (to: string) => location.pathname === to;

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
                <Link to="/" className="flex flex-shrink-0 items-center gap-2" aria-label="BlogCraft home">
                    <PenSquare className="size-5 text-primary" aria-hidden="true" />
                    <span className="hidden text-base font-semibold sm:block">BlogCraft</span>
                </Link>

                <ul className="hidden items-center gap-1 sm:flex">
                    {NAV_LINKS.map((link) => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                aria-current={isActive(link.to) ? "page" : undefined}
                                className={cn(
                                    "flex h-14 items-center border-b-2 px-3 text-sm transition-colors",
                                    isActive(link.to)
                                        ? "border-foreground font-medium text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
                <form
                    onSubmit={submitSearch}
                    role="search"
                    className={cn(
                        "relative min-w-0 flex-1 sm:ml-4 sm:max-w-xs sm:flex-none",
                        mobileSearchOpen ? "block" : "hidden sm:block"
                    )}
                >
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        ref={searchInputRef}
                        type="search"
                        value={term}
                        onChange={(e) => updateQuery(e.target.value)}
                        placeholder="Search blogs..."
                        aria-label="Search blogs"
                        className="h-9 rounded-full bg-muted pl-9 text-sm focus-visible:border-ring"
                    />
                </form>

                <div className="ml-auto flex items-center gap-1">
                    {!mobileSearchOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="sm:hidden"
                            aria-label="Search"
                            onClick={() => {
                                setMobileSearchOpen(true);
                                requestAnimationFrame(() => searchInputRef.current?.focus());
                            }}
                        >
                            <Search className="size-5" />
                        </Button>
                    )}

                    {mobileSearchOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="sm:hidden"
                            aria-label="Close search"
                            onClick={() => {
                                setMobileSearchOpen(false);
                                updateQuery("");
                            }}
                        >
                            <X className="size-5" />
                        </Button>
                    )}
                    {
                        isAuthenticated ?  <Button
                        variant={isPublicRoute || !isAuthenticated ? "outline" : "default"}
                        size="sm"
                        className="hidden rounded-full px-4 sm:inline-flex"
                        onClick={writeTarget}
                    >
                        Write
                    </Button> : ""
                    }

                    {isAuthenticated ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-1"
                            aria-label="Your profile"
                            aria-current={isActive("/profile") ? "page" : undefined}
                            onClick={() => navigate("/profile")}
                        >
                            <Avatar className="size-8">
                                <AvatarImage src={userInfo?.profilePicture?.url} className="object-cover" alt="" />
                                <AvatarFallback className="bg-muted text-sm text-muted-foreground">
                                    {(userInfo?.username?.[0] ?? "ME").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    ) : (
                        <Button variant="ghost" size="sm" className="rounded-full px-3" onClick={() => navigate("/auth")}>
                            Log in
                        </Button>
                    )}
                </div>
            </div>
            <ul className="flex items-center gap-1 border-t border-border/60 px-2 sm:hidden">
                {NAV_LINKS.map((link) => (
                    <li key={link.to}>
                        <Link
                            to={link.to}
                            aria-current={isActive(link.to) ? "page" : undefined}
                            className={cn(
                                "flex items-center border-b-2 px-3 py-2 text-sm transition-colors",
                                isActive(link.to)
                                    ? "border-foreground font-medium text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default Navbar;