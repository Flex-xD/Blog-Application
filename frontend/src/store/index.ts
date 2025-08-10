import {create} from "zustand"
import { authSlice, type IAuthState } from "./slices/authSlice"
import { blogSlice, type IBlogState } from "./slices/blogSlice";

type IAppState = IAuthState & IBlogState;

export const useAppStore = create<IAppState>()((set , get , store) => ({
    ...authSlice(set , get , store),
    ...blogSlice(set , get , store)
}));