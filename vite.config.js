import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // X:\ is a mapped network drive (\\ASUS\Projects). Node's native fs.watch
  // (ReadDirectoryChangesW) does not work reliably over SMB and crashes the dev
  // server with "Error: UNKNOWN: unknown error, watch" (errno -4094).
  // usePolling makes chokidar stat files on an interval (fs.watchFile) instead
  // of creating native watchers, which is safe on network shares.
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
      binaryInterval: 2000,
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Shared vendor chunks so heavy libraries (three.js, mapbox-gl, gsap)
        // are downloaded and parsed exactly once across lazy-loaded pages.
        // Vite 8 (Rolldown) requires the function form of manualChunks.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'vendor-react'
          if (/[\\/]node_modules[\\/]mapbox-gl[\\/]/.test(id)) return 'vendor-map'
          if (/[\\/]node_modules[\\/]@react-three[\\/]/.test(id)) return 'vendor-r3f'
          if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'vendor-three'
          if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return 'vendor-gsap'
          return undefined
        },
      },
    },
  },
})
