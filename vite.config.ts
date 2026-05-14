import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('@react-three/fiber') || id.includes('@react-three/drei') || id.includes('three')) {
            return 'three-vendor'
          }

          if (
            id.includes('/react/') ||
            id.includes('\\react\\') ||
            id.includes('react-dom') ||
            id.includes('scheduler')
          ) {
            return 'react-vendor'
          }

          return undefined
        },
      },
    },
  },
})
