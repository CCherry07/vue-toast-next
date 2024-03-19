/// <reference types="vitest" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      entryRoot:"./src",
      insertTypesEntry: true,
      cleanVueFileName: true,
      outDir: 'dist',
      staticImport: true,
      exclude: ['**/__tests__/**/*', '**/__mocks__/**/*', '**/demo/**/*'],
    }),
    vueJsx(),
  ],

  build: {
    lib: {
      entry: ['src/index.ts'],
      fileName: () => 'index.js',
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      input: ['./src/index.ts'],
      external: ['vue'],
      output: [
        {
          dir: "dist",
          globals: {
            vue: 'vue',
          }
        },
      ]
    },
  },
});
