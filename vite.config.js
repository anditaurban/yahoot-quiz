import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'yahoot-domain-banner',
      configureServer(server) {
        server.printUrls = () => {
          console.log(`\n  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttp://yahoot.test/\x1b[0m`);
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[2mFallback:\x1b[0m \x1b[36mhttp://localhost:80/\x1b[0m\n`);
        };
      },
    },
  ],
  server: {
    host: true,
    port: 80,
    open: false,
    allowedHosts: ['yahoot.test', '.yahoot.test', 'localhost', '127.0.0.1'],
  },
});
