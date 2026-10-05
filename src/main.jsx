import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { preloadPage } from './data/pageLoading.js'
import './styles/global.css'
// Start the overview request before Home queues its tower-frame downloads.
preloadPage('/amenities')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
