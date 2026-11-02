import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { seoPlugin } from './vite-plugins/seo';

const here = dirname(fileURLToPath(import.meta.url));
const lib = (p: string) => resolve(here, '../../packages/deract/src', p);

export default defineConfig({
  plugins: [react(), seoPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: /^@atlis\/deract\/playground$/, replacement: lib('playground/index.ts') },
      { find: /^@atlis\/deract\/styles\.css$/, replacement: lib('styles.css') },
      { find: /^@atlis\/deract\/fonts\.css$/, replacement: lib('fonts.css') },
      { find: /^@atlis\/deract$/, replacement: lib('index.ts') },
    ],
  },
});