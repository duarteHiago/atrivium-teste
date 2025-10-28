import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Enable React automatic JSX runtime so explicit `import React from 'react'` is
// not required in every JSX file (React 17+ feature).
export default defineConfig({
  plugins: [
    react({
      // Use the automatic runtime for JSX transform
      jsxRuntime: 'automatic',
    }),
  ],
    server: {
      host: '0.0.0.0', // Permite acesso externo (necessário para Docker)
      port: 5173,
      watch: {
        usePolling: true, // Necessário para hot-reload em Docker
      },
    },
  })
