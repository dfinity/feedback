import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            'babel-plugin-twin',
            {
              exclude: ['\x00'], // Fix build error
            },
          ],
          'babel-plugin-macros',
        ],
      },
    }),
    imagetools(),
  ],
});
