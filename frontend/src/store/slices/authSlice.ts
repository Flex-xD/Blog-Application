import type { StateCreator } from "zustand";


export interface IAuthState {
    isAuthenticated: boolean
    setIsAuthenticated: (isAuthenticated: boolean) => void
}

export const authSlice: StateCreator<IAuthState> = (set, get, store) => ({
    isAuthenticated:false ,
    setIsAuthenticated:(isAuthenticated:boolean) => set({isAuthenticated})
});
