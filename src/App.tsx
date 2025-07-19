import type { JSX } from 'react';
import type React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';

interface IRoute {
  path:string , 
  isPrivate:boolean , 
  redirectTo:string , 
  element?:JSX.Element
}

const withAuth = (element:JSX.Element , isPrivate:boolean , redirectTo:string , allowAuthenticated?:boolean) => {
// ? To Identify between Private and Public Routes 
}

const routes :IRoute[]= [
  {path:"/" , isPrivate:false ,  redirectTo:"" , element:<HomePage/>}
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
      <Route path='*' element={<Navigate to="/" replace/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App