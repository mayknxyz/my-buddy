// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { existsSync, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';
import remarkWikiLinks from './src/plugins/wiki-links/remark-wiki-links.ts';

/** Serve dist/pagefind/ files during dev so search works after `bun run build` */
function pagefindDev() {
  return {
    name: 'pagefind-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split('?')[0];
        if (!pathname?.startsWith('/pagefind/')) return next();
        const file = join(process.cwd(), 'dist', pathname);
        if (!existsSync(file)) return next();
        const types = { '.js': 'application/javascript', '.css': 'text/css', '.wasm': 'application/wasm' };
        res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
        res.end(readFileSync(file));
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkWikiLinks],
  },
  vite: {
    plugins: [tailwindcss(), pagefindDev()],
    build: {
      rollupOptions: {
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
});
