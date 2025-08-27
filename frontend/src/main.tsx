import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

const queryCleint = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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
