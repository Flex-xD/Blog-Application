import { Navigate } from "react-router-dom";
import { useAppStore } from "@/store";
import type { JSX } from "react";
import Cookies from 'js-cookie';

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
  
  // Double-check token on every render for debugging
  const tokenFromCookies = Cookies.get('token');
  
  console.log('🔐 WithAuth Debug:', { 
    isPrivate, 
    redirectTo, 
    redirectIfAuthenticated, 
    isAuthenticated, 
    isHydrated,
    tokenFromCookies
  });

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Rule 1: Redirect authenticated users from auth pages
  if (redirectIfAuthenticated && isAuthenticated) {
    console.log('🔄 Redirecting: Authenticated user trying to access auth page');
    return <Navigate to={redirectTo} replace />;
  }

  // Rule 2: Redirect unauthenticated users from private routes
  if (isPrivate && !isAuthenticated) {
    console.log('🔄 Redirecting: Unauthenticated user trying to access private route');
    return <Navigate to={redirectTo} replace />;
  }

  console.log('✅ Rendering children for route');
  return children;
};

export default WithAuth;