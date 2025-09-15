import type { StateCreator } from "zustand";


export interface ISocialState {
    isFollowed: boolean
    setIsFollowed: (isFollowed: boolean) => void
}

export const socialSlice: StateCreator<ISocialState> = (set, get, store) => ({
    isFollowed: false,
    setIsFollowed: (isFollowed: boolean) => set({ isFollowed })
});
