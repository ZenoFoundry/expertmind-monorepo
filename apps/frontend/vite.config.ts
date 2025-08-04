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
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5173,
      host: env.VITE_HOST || 'localhost',
      open: true, // Abrir automáticamente en el navegador
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
      __API_URL__: JSON.stringify(env.VITE_API_URL || 'http://localhost:3001'),
    },
  };
});
