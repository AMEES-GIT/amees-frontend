import type { Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { SEO, SITE_URL, NOINDEX_PATHS, type SeoRoute } from '../src/content/seo';

type RouteWithFlags = SeoRoute & { noindex?: boolean };

export function seoPlugin(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'amees-seo',
    apply: 'build',
    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },
    closeBundle() {
      const dist = resolve(root, outDir);
      const indexPath = join(dist, 'index.html');

      if (!existsSync(indexPath)) {
        this.error('[amees-seo] dist/index.html missing — did the build succeed?');
        return;
      }

      const template = readFileSync(indexPath, 'utf8');
      const marker = /<!-- seo:start -->[\s\S]*?<!-- seo:end -->/;

      if (!marker.test(template)) {
        this.error(
          '[amees-seo] index.html is missing <!-- seo:start -->…<!-- seo:end --> markers',
        );
        return;
      }

      // Per-route pages
      for (const route of SEO) {
        const head = buildHeadBlock(route);
        const html = template.replace(marker, head);
        const file =
          route.path === '/' ? 'index.html' : `${route.path.replace(/^\//, '')}.html`;
        writeFileSync(join(dist, file), html);
      }

      // 404 page — noindex, styled by the SPA once it hydrates
      const notFoundHtml = template.replace(
        marker,
        buildHeadBlock({
          path: '/404',
          title: 'Page not found · AMEES',
          description: 'The page you were looking for could not be found.',
          noindex: true,
        }),
      );
      writeFileSync(join(dist, '404.html'), notFoundHtml);

      writeFileSync(join(dist, 'sitemap.xml'), buildSitemap());
      writeFileSync(join(dist, 'robots.txt'), buildRobots());
    },
  };
}

function buildHeadBlock(route: RouteWithFlags): string {
  const url =
    route.path === '/' || route.path === '/404'
      ? `${SITE_URL}/`
      : `${SITE_URL}${route.path}`;

  const robots = route.noindex
    ? '<meta name="robots" content="noindex, nofollow" />'
    : '<meta name="robots" content="index, follow" />';

  return [
    '<!-- seo:start -->',
    `<title>${route.title}</title>`,
    `<meta name="description" content="${route.description}" />`,
    `<link rel="canonical" href="${url}" />`,
    robots,
    `<meta property="og:title" content="${route.title}" />`,
    `<meta property="og:description" content="${route.description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta name="twitter:title" content="${route.title}" />`,
    `<meta name="twitter:description" content="${route.description}" />`,
    '<!-- seo:end -->',
  ].join('\n    ');
}

function buildSitemap(): string {
  const today = new Date().toISOString().slice(0, 10);
  const entries = SEO.map((r) => {
    const loc = r.path === '/' ? SITE_URL : `${SITE_URL}${r.path}`;
    const priority = r.path === '/' ? '1.0' : '0.8';
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '    <changefreq>weekly</changefreq>',
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n');
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function buildRobots(): string {
  const disallow = NOINDEX_PATHS.map((p) => `Disallow: ${p}`).join('\n');
  return `User-agent: *\nAllow: /\n${disallow}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}