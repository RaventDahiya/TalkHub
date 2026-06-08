import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5080', // Proxy API calls to backend port
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5080',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  }
});
