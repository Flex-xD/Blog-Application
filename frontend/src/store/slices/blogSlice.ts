import type { StateCreator } from "zustand";


export interface IBlogState {
    isCreatingBlog: boolean
    setIsCreatingBlog: (isCreationBlog: boolean) => void
}

export const blogSlice: StateCreator<IBlogState> = (set, get, store) => ({
    isCreatingBlog: false,
    setIsCreatingBlog: (isCreatingBlog: boolean) => set({ isCreatingBlog })
});
