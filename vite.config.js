import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      // Inject Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy
      // headers so that SharedArrayBuffer (needed by Whisper WASM) works.
      name: 'configure-response-headers',
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
          next();
        });
      },
    },
  ],
  worker: {
    format: 'es',
  },
  optimizeDeps: {
    // web-llm ships its own bundles; let Vite skip it in dep pre-bundling
    exclude: ['@mlc-ai/web-llm'],
  },
  server: {
    port: 5180,
    strictPort: false,
    host: true,
  },
  preview: {
    port: 4180,
    strictPort: false,
    host: true,
  },
  build: {
    target: 'esnext',
  },
});

