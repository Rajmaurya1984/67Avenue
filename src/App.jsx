import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { loadPage } from './data/pageLoading.js'
import Amenities from './pages/Amenities.jsx'

// Resolve each page module before committing navigation, so transitions capture
// the destination page rather than a temporary Suspense loading message.
const router = createBrowserRouter([
  // Keep the overview ready even when Amenities is clicked immediately.
  // Its WebGL tour still loads only when a visitor opens a 360 view.
  { path: '/amenities', Component: Amenities },
  ...['/', '/location', '/plan', '/legacy'].map((path) => ({
    path,
    lazy: async () => ({ Component: (await loadPage(path)).default }),
  })),
  { path: '*', element: <Navigate to="/" replace /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
