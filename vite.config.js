import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase')) {
            return 'vendor-firebase';
          }
          if (id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
