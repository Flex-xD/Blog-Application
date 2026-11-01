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

/* Destinations are content, not chrome: labels carry their own meaning, so no
   icon is needed to decode them. Profile is reached through the avatar below,
   which keeps this list to the two places a reader actually goes. */
const NAV_LINKS: NavLinkItem[] = [
    { to: "/feed", label: "Explore" },
    { to: "/social", label: "Social" },
];

/* One navbar for the whole app. It is a bar, not a card: flat paper, hairline
   border, no blur, no gradient, no motion for its own sake.

   Three jobs, in weight order:
   1. brand        - the gold mark. The only other gold on this bar is the
                     primary action, and that is never gold on the public
                     landing, where the hero owns the accent.
   2. destinations - labels with a quiet active state (ink, not hue).
   3. search       - lives in the URL (?q=), so it works from any route and
                     survives reload. Type here and you land on the feed with
                     the query applied; on the feed itself it updates live.

   The bar has exactly one hover response (color), one active response (ink
   weight + a hairline mark) and no page-transition animation. */
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

    /* The URL is the source of truth (back/forward, cleared query from a link).
       Only adopt it when it differs, or we would fight the caret mid-word. */
    useEffect(() => {
        if (routeSearch !== term) setTerm(routeSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routeSearch]);

    const onFeed = location.pathname === "/feed";

    /* Public routes (/) are the one place where this bar must not spend gold:
       the landing's own CTA is the page's primary action, and two gold buttons
       in one view means neither reads as primary. */
    const isPublicRoute = location.pathname === "/";

    const writeTarget = () => {
        setIsCreatingBlog(true);
        navigate("/feed");
    };

    const writeLabel = isAuthenticated ? "Write" : "Log in";

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

                {/* Destinations: labels, always visible. The active page is marked by
                    ink weight and a hairline underline - never by a hue, because hue
                    here would compete with the gold action for "notice me". */}
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

                {/* Search. On >= sm it sits in the bar; below sm it takes over the bar
                    when opened, because a 375px screen cannot hold brand + labels +
                    a field + an action + an avatar at once. The box writes ?q= only
                    while on the feed (live filtering); anywhere else it navigates on
                    submit, so half-typed text never yanks a guest off the landing. */}
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

                    {/* Authenticated members get the app's one gold button. Guests get
                        an outline button instead: on this bar "Log in" is a doorway,
                        not the product's primary creative act. */}
                    <Button
                        variant={isPublicRoute || !isAuthenticated ? "outline" : "default"}
                        size="sm"
                        className="hidden rounded-full px-4 sm:inline-flex"
                        onClick={writeTarget}
                    >
                        {writeLabel}
                    </Button>

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

            {/* Mobile: destinations as a second line rather than a hamburger. A menu
                behind a tap hides the map; this map is only two items wide, and the
                whole point of a map is that you can see it. Below sm the bar drops to
                a single row - destinations move to the Feed's own header row only if
                this proves too tall on a small phone. */}
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