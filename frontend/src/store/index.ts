import {create} from "zustand"
import { authSlice, type IAuthState } from "./slices/authSlice"

export const useAppStore = create<IAuthState>()((set , get , store) => ({
    ...authSlice(set , get , store),
}));