import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-twin',
          'babel-plugin-macros',
          // [
          //   'babel-plugin-styled-components',
          //   { displayName: true, fileName: false },
          // ],
        ],
        ignore: ['\x00commonjsHelpers.js'], // Fix build error (ben-rogerson/babel-plugin-twin#9)
      },
    }),
    imagetools(),
  ],
  server: {
    // Local IC replica proxy
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
