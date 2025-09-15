import {create} from "zustand"
import { authSlice, type IAuthState } from "./slices/authSlice"
import { blogSlice, type IBlogState } from "./slices/blogSlice";
import { socialSlice, type ISocialState } from "./slices/socialSlice";

type IAppState = IAuthState & IBlogState & ISocialState;

export const useAppStore = create<IAppState>()((set , get , store) => ({
    ...authSlice(set , get , store),
    ...blogSlice(set , get , store) , 
    ...socialSlice(set , get , store)
}));