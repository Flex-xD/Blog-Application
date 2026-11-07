import useFeaturedBlogs, { type IFeaturedBlog } from "@/customHooks/FeaturedBlogs";
import { SAMPLE_POSTS } from "@/constants/samplePosts";
import type { IExhibitPost } from "@/pages/NormalComponents/PostExhibit";

const toExhibitPost = (post: IFeaturedBlog): IExhibitPost => ({
    id: post._id,
    title: post.title,
    body: post.body,
    author: post.authorDetails?.username ?? "A writer",
    avatarUrl: post.authorDetails?.profilePicture ?? null,
    date: post.createdAt,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    isSample: false,
});


const useExhibitPosts = (limit: number) => {
    const { data, isPending } = useFeaturedBlogs(limit);
    const realPosts = data?.map(toExhibitPost) ?? [];

    const isSample = !isPending && realPosts.length === 0;

    return {
        posts: isPending ? [] : (isSample ? SAMPLE_POSTS : realPosts).slice(0, limit),
        isPending,
        isSample,
    };
};

export default useExhibitPosts;