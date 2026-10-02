import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'

// Resolve each page module before committing navigation, so transitions capture
// the destination page rather than a temporary Suspense loading message.
const router = createBrowserRouter([
  { path: '/', lazy: async () => ({ Component: (await import('./pages/Home.jsx')).default }) },
  { path: '/location', lazy: async () => ({ Component: (await import('./pages/Location.jsx')).default }) },
  { path: '/amenities', lazy: async () => ({ Component: (await import('./pages/Amenities.jsx')).default }) },
  { path: '/plan', lazy: async () => ({ Component: (await import('./pages/Plan.jsx')).default }) },
  { path: '/legacy', lazy: async () => ({ Component: (await import('./pages/Legacy.jsx')).default }) },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}