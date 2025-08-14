import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useUserProfileData } from './customHooks/UserDataFetching/index.ts'

const queryCleint = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    },
    mutations: {
      retry: 0
    }
  }
})

// const {data , isLoading} = useUserProfileData();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryCleint}>
    <App />
    <Toaster position="top-right" richColors />
  </QueryClientProvider>
)
