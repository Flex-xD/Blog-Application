import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Navbar from "../NormalComponents/Navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/customHooks/useDebounce";
import useFollowOrUnfollowMutation from "@/customHooks/Follow&Unfollow";
import useSuggestedUserData from "@/customHooks/SuggestedUserFetching";
import { useUserProfileData } from "@/customHooks/UserDataFetching";
import type { IBlog, IUser } from "@/types";

const ProfileModal = lazy(() => import("./SocialComponents/UserProfileModal"));

const PersonRow = ({
    user,
    isFollowing,
    isPending,
    onOpen,
    onFollow,
}: {
    user: IUser;
    isFollowing: boolean;
    isPending: boolean;
    onOpen: (user: IUser) => void;
    onFollow: (userId: string) => void;
}) => {
    const followers = user.followers.length;
    const meta = [user.bio?.trim(), `${followers} ${followers === 1 ? "follower" : "followers"}`]
        .filter(Boolean)
        .join(" · ");

    return (
        <li className="flex items-center gap-3 py-3.5">
            {/* The row's subject is the person, so the person is the button — a key
                reachable target — and Follow is a sibling, never nested inside it. */}
            <button
                type="button"
                onClick={() => onOpen(user)}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.profilePicture?.url} alt="" className="object-cover" />
                    <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">
                        {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                    <span className="block truncate font-medium">{user.username}</span>
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">{meta}</span>
                </span>
            </button>

            <Button
                variant="outline"
                size="sm"
                onClick={() => onFollow(user._id)}
                disabled={isPending}
                aria-pressed={isFollowing}
                className={isFollowing ? "shrink-0 text-muted-foreground" : "shrink-0"}
            >
                {isFollowing ? "Following" : "Follow"}
            </Button>
        </li>
    );
};

const PeopleSkeleton = () => (
    <ul className="mt-3 divide-y divide-border border-y border-border" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-44" />
                </div>
                <Skeleton className="h-8 w-20 rounded-sm" />
            </li>
        ))}
    </ul>
);

const SocialComponent = () => {
    const { data: userData } = useUserProfileData();
    const {
        data: suggestedUsers,
        isPending: isSuggestionsPending,
        isError: isSuggestionsError,
        refetch: refetchSuggestions,
    } = useSuggestedUserData(userData?._id ?? "");

    const { mutateAsync: followMutate } = useFollowOrUnfollowMutation();

    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (userData?.following) setFollowingIds(userData.following.map(String));
    }, [userData]);

    /* Username only. The old filter also matched `email`, which turned a public
       directory into a way to confirm whether an address exists — and nobody
       finds people by typing their address. */
    const visiblePeople = useMemo(() => {
        if (!Array.isArray(suggestedUsers)) return [];
        const q = debouncedQuery.trim().toLowerCase();
        if (!q) return suggestedUsers;
        return suggestedUsers.filter((user) => user.username.toLowerCase().includes(q));
    }, [suggestedUsers, debouncedQuery]);

    const handleFollow = useCallback(
        async (userId: string) => {
            const wasFollowing = followingIds.includes(userId);
            const previous = followingIds;

            setFollowingIds(
                wasFollowing ? followingIds.filter((id) => id !== userId) : [...followingIds, userId]
            );
            setPendingId(userId);

            try {
                await followMutate({
                    targetUserId: userId,
                    currentUserId: userData?._id || "",
                    isCurrentlyFollowing: wasFollowing,
                });
            } catch {
                setFollowingIds(previous);
            } finally {
                setPendingId(null);
            }
        },
        [followingIds, followMutate, userData?._id]
    );

    const handleOpen = useCallback((user: IUser) => {
        setSelectedUser(user);
        setModalOpen(true);
    }, []);

    const isSearching = debouncedQuery.trim().length > 0;

    return (
        <>
            <Navbar />
            <main className="mx-auto w-full max-w-[42rem] px-4 py-10 sm:px-6 sm:py-14">
                <header>
                    <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">People</h1>
                    <p className="mt-2 text-muted-foreground">
                        Writers you haven&rsquo;t followed yet.
                    </p>
                </header>

                <div className="relative mt-8">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username"
                        aria-label="Search people by username"
                        className="pl-9"
                    />
                </div>

                {isSuggestionsPending ? (
                    <PeopleSkeleton />
                ) : isSuggestionsError ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        We couldn&rsquo;t load suggestions.{" "}
                        <button
                            type="button"
                            onClick={() => refetchSuggestions()}
                            className="underline underline-offset-4 hover:text-foreground"
                        >
                            Try again
                        </button>
                    </p>
                ) : visiblePeople.length === 0 ? (
                    <p className="mt-6 text-sm text-muted-foreground">
                        {isSearching
                            ? `No one here goes by “${debouncedQuery.trim()}”.`
                            : "You already follow everyone we could suggest. Check back soon."}
                    </p>
                ) : (
                    <>
                        <p className="mt-8 text-sm text-muted-foreground">
                            {visiblePeople.length === 1
                                ? "1 writer"
                                : `${visiblePeople.length} writers`}
                        </p>
                        <ul className="mt-3 divide-y divide-border border-y border-border">
                            {visiblePeople.map((user) => (
                                <PersonRow
                                    key={user._id}
                                    user={user}
                                    isFollowing={followingIds.includes(user._id)}
                                    isPending={pendingId === user._id}
                                    onOpen={handleOpen}
                                    onFollow={handleFollow}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </main>

            <Suspense fallback={null}>
                {selectedUser && (
                    <ProfileModal
                        user={selectedUser}
                        isOpen={modalOpen}
                        onClose={() => setModalOpen(false)}
                        isFollowingUser={followingIds.includes(selectedUser._id)}
                        handleFollowAndUnfollow={() => handleFollow(selectedUser._id)}
                        currentUserId={userData?._id}
                        blogs={selectedUser.userBlogs as unknown as IBlog[]}
                    />
                )}
            </Suspense>
        </>
    );
};

export default SocialComponent;