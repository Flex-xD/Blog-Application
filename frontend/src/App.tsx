import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import Auth from './pages/AUTH';

interface IRoute {
  path: string,
  isPrivate: boolean,
  redirectTo: string,
  element?: JSX.Element
}

const withAuth = (element: JSX.Element, isPrivate: boolean, redirectTo: string, allowAuthenticated?: boolean) => {
  if (isPrivate) {
    
  }
  // ? To Identify between Private and Public Routes 
}

const routes: IRoute[] = [
  { path: "/", isPrivate: false, redirectTo: "", element: <HomePage /> },
  { path: "auth", isPrivate: false, redirectTo: "", element: <Auth /> },
]



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route
            path={route.path}
            element={route.element}
          />
        ))}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App