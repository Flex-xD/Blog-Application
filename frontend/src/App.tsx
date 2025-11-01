import { useEffect, type JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Auth from './pages/AUTH';
import { UserProfilePage } from './pages/PROFILE';
import Feed from './pages/FEED';
import Social from './pages/Social';
import WithAuth from './pages/AUTH/AuthComponents/WithAuthWrapper';
import { useAppStore } from './store';
import Cookies from 'js-cookie';

interface IRoute {
  path: string;
  isPrivate: boolean;
  redirectTo: string;
  element: JSX.Element;
  redirectIfAuthenticated?: boolean;
}

const App = () => {
  const { isHydrated } = useAppStore();

  const routes: IRoute[] = [
    {
      path: '/',
      isPrivate: false,
      redirectTo: '/feed',
      element: <HomePage />,
      redirectIfAuthenticated: false
    },
    {
      path: '/auth',
      isPrivate: false,
      redirectTo: '/feed',
      element: <Auth />,
      redirectIfAuthenticated: false
    },
    {
      path: '/profile',
      isPrivate: true,
      redirectTo: '/auth',
      element: <UserProfilePage />
    },
    {
      path: '/feed',
      isPrivate: true,
      redirectTo: '/auth',
      element: <Feed />
    },
    {
      path: '/social',
      isPrivate: true,
      redirectTo: '/auth',
      element: <Social />
    },
  ];


  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = Cookies.get('token');

        if (token) {
          useAppStore.getState().setIsAuthenticated(true);

        } else {
          useAppStore.getState().setIsAuthenticated(false);

        }
      } catch (error) {

        useAppStore.getState().setIsAuthenticated(false);
      } finally {

        useAppStore.getState().setHydrated(true);
      }
    };

    initializeAuth();
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <WithAuth
                isPrivate={route.isPrivate}
                redirectTo={route.redirectTo}
                redirectIfAuthenticated={route.redirectIfAuthenticated}
              >
                {route.element}
              </WithAuth>
            }
          />
        ))}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;