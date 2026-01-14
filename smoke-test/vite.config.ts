import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@amuaapps/ui-library/button': resolve(__dirname, '../dist/components/button.js'),
      '@amuaapps/ui-library/card': resolve(__dirname, '../dist/components/card.js'),
      '@amuaapps/ui-library/alert': resolve(__dirname, '../dist/components/alert.js'),
      '@amuaapps/ui-library/badge': resolve(__dirname, '../dist/components/badge.js'),
      '@amuaapps/ui-library/input': resolve(__dirname, '../dist/components/input.js'),
      '@amuaapps/ui-library/label': resolve(__dirname, '../dist/components/label.js'),
      '@amuaapps/ui-library/styles': resolve(__dirname, '../dist/styles'),
      '@amuaapps/ui-library': resolve(__dirname, '../dist/index.js'),
    },
  },
});
