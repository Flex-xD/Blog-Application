// store/slices/authSlice.ts
import type { StateCreator } from 'zustand';

export interface IAuthState {
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  isHydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
  logout: () => void;
}

export const authSlice: StateCreator<IAuthState> = (set) => ({
  isAuthenticated: false,
  isHydrated: false,
  
  setIsAuthenticated: (isAuthenticated) => {
    console.log('🔄 Setting auth state:', isAuthenticated);
    set({ isAuthenticated });
    
    // Additional safety: Also set in localStorage directly
    if (isAuthenticated) {
      localStorage.setItem('auth-backup', 'true');
    } else {
      localStorage.removeItem('auth-backup');
    }
  },
  
  setHydrated: (hydrated) => {
    console.log('💧 Setting hydrated:', hydrated);
    set({ isHydrated: hydrated });
  },
  
  logout: () => {
    console.log('🚪 Logging out...');
    // Clear everything on logout
    localStorage.removeItem('auth-backup');
    set({ isAuthenticated: false });
  },
});