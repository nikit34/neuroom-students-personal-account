import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/neuroom-students-personal-account/',
  server: {
    port: 5173
  }
});
