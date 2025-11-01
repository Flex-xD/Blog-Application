// store/index.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { authSlice, type IAuthState } from "./slices/authSlice"
import { blogSlice, type IBlogState } from "./slices/blogSlice";
import { socialSlice, type ISocialState } from "./slices/socialSlice";

type IAppState = IAuthState & IBlogState & ISocialState;

export const useAppStore = create<IAppState>()(
  persist(
    (set, get, store) => ({
      ...authSlice(set, get, store),
      ...blogSlice(set, get, store),
      ...socialSlice(set, get, store)
    }),
    {
      name: "app-storage", // Key for localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        // Add other states you want to persist across refreshes
      }),
      // Optional: Add version for future migrations
      version: 1,
      // Optional: Migrate function if you change store structure later
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrate from version 0 to 1
          return persistedState
        }
        return persistedState
      }
    }
  )
);