import type { StateCreator } from "zustand";

export interface IAuthState {
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    isHydrated: boolean; // new
    setHydrated: (hydrated: boolean) => void;
}

export const authSlice: StateCreator<IAuthState> = (set) => ({
    isAuthenticated: false,
    isHydrated: false,
    setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
        if (isAuthenticated) {
            localStorage.setItem("authToken", "true");
        } else {
            localStorage.removeItem("authToken");
        }
    },
    setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
});
