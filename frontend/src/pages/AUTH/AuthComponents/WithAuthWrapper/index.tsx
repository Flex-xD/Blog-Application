import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import type { JSX } from "react";

interface WithAuthProps {
  isPrivate: boolean;
  redirectTo: string;
  redirectIfAuthenticated?: boolean;
  children: JSX.Element;
}

const WithAuth = ({
  isPrivate,
  redirectTo,
  redirectIfAuthenticated = false,
  children
}: WithAuthProps) => {
  const { isAuthenticated, isHydrated } = useAppStore();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (redirectIfAuthenticated && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (isPrivate && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default WithAuth;
