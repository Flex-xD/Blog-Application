import { useEffect, type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Auth from './pages/AUTH';
import { UserProfilePage } from './pages/PROFILE';
import Feed from './pages/FEED';
import WithAuth from './pages/AUTH/AuthComponents/WithAuthWrapper';
import Social from './pages/Social';
import { useAppStore } from './store';

interface IRoute {
  path: string,
  isPrivate: boolean,
  redirectTo: string,
  element: JSX.Element
  allowAuthenticated?: boolean
}

const routes: IRoute[] = [
  { path: "/", isPrivate: false, redirectTo: "/", element: <HomePage />, allowAuthenticated: true },
  { path: "/auth", isPrivate: false, redirectTo: "/", element: <Auth />, allowAuthenticated: true },
  { path: "/profile", isPrivate: true, redirectTo: "/auth", element: <UserProfilePage /> },
  { path: "/feed", isPrivate: true, redirectTo: "/auth", element: <Feed /> },
  { path: "/social", isPrivate: true, redirectTo: "/auth", element: <Social /> },
]

const App = () => {
  const {  setIsAuthenticated, isHydrated, setHydrated } = useAppStore();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);
    setHydrated(true);
  }, [setIsAuthenticated, setHydrated]);

  if (!isHydrated) return null; 
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <WithAuth
                isPrivate={!!route.isPrivate}
                redirectTo={route.redirectTo || "/"}
                allowAuthenticated={route.allowAuthenticated}
              >
                {route.element}
              </WithAuth>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App