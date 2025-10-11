import usePostUserBlog from "@/customHooks/PostUserBlog";
import type { BlogFormAction, BlogFormState } from "@/types";
import { createContext, useCallback, useReducer } from "react";
import { toast } from "sonner";

type BlogFormContextType = {
    blogForm: BlogFormState;
    dispatch: React.Dispatch<BlogFormAction>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlogPost: () => Promise<void>; 
    postBlogPending: boolean;
};

export const BlogFormContext = createContext<BlogFormContextType | undefined>(undefined);

const BlogFormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const initialBlogFormState: BlogFormState = {
        title: "",
        body: "",
        selectedImage: null,
        imagePreview: null,
    };
    const blogFormReducer = (state: BlogFormState, action: BlogFormAction): BlogFormState => {
        switch (action.type) {
            case "SET_TITLE":
                return { ...state, title: action.payload };
            case "SET_BODY":
                return { ...state, body: action.payload };
            case "SET_IMAGE":
                return { ...state, selectedImage: action.payload.file, imagePreview: action.payload.preview };
            case "RESET":
                return initialBlogFormState;
            default:
                return state;
        }
    };
    
    const [blogForm, dispatch] = useReducer(blogFormReducer, initialBlogFormState);
    const { mutateAsync: postBlog, isPending: postBlogPending } = usePostUserBlog();

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                dispatch({ type: "SET_IMAGE", payload: { file, preview: e.target?.result as string } });
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleBlogPost = useCallback(async () => {
        try {
            await postBlog({
                title: blogForm.title,
                body: blogForm.body,
                image: blogForm.selectedImage,
            });
            dispatch({ type: "RESET" });
        } catch (error) {
            toast.error("Failed to post blog. Please try again.");
            throw error; 
        }
    }, [blogForm, postBlog]);

    return (
        <BlogFormContext.Provider value={{ blogForm, dispatch, handleImageUpload, handleBlogPost, postBlogPending }}>
            {children}
        </BlogFormContext.Provider>
    );
};

export default BlogFormProvider;