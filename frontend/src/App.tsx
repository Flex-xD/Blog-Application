import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Auth from './pages/AUTH';
import { UserProfilePage } from './pages/PROFILE/UserProfile';
import Feed from './pages/FEED';
import WithAuth from './pages/AUTH/components/WithAuthWrapper';
import { useUserProfileData } from './customHooks/UserDataFetching';
import { Loader } from 'lucide-react';

interface IRoute {
  path: string,
  isPrivate: boolean,
  redirectTo: string,
  element: JSX.Element
  allowAuthenticated?: boolean
}

const routes: IRoute[] = [
  { path: "/", isPrivate: false, redirectTo: "/", element: <HomePage />, allowAuthenticated: true },
  { path: "/auth", isPrivate: false, redirectTo: "/", element: <Auth />, allowAuthenticated: false },
  { path: "/profile", isPrivate: true, redirectTo: "/auth", element: <UserProfilePage /> },
  { path: "/feed", isPrivate: true, redirectTo: "/auth", element: <Feed /> },
]

const App = () => {
  const {data , isLoading} = useUserProfileData();
  if (isLoading) return <div className='h-screen w-screen flex items-center justify-center'><Loader/></div>
  console.log(data)
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
  )
}

export default App