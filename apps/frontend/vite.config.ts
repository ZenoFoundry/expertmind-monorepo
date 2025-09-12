import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"), // Usar process.cwd() en lugar de __dirname
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: env.VITE_HOST || '0.0.0.0',
      open: false, // Desactivar open en Docker
      watch: {
        usePolling: true, // Necesario para hot reload en Docker
      },
      proxy: {
        // Proxy para la API de Anthropic
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
          headers: {
            'anthropic-version': '2023-06-01'
          }
        }
      }
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
    define: {
      // Variables de entorno para el frontend
      __API_URL__: JSON.stringify(env.VITE_AGENT_API_URL || 'http://localhost:3001'),
    },
  };
});