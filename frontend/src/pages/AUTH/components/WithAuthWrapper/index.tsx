import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import type { JSX } from "react";

interface WithAuthProps {
    isPrivate: boolean;
    redirectTo: string;
    allowAuthenticated?: boolean;
    children: JSX.Element;
}

const WithAuth = ({ isPrivate, redirectTo, allowAuthenticated, children }: WithAuthProps) => {
    const { isAuthenticated } = useAppStore();

    if (isPrivate) {
        return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
    } else {
        if (allowAuthenticated === false && isAuthenticated) {
            return <Navigate to={redirectTo} replace />;
        }
        return children;
    }
};

export default WithAuth;
