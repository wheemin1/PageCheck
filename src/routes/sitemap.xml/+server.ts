import type { RequestHandler } from '@sveltejs/kit';

const SITE_URL = 'https://mocheck.netlify.app';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];

export const GET: RequestHandler = async () => {
	const currentDate = new Date().toISOString().split('T')[0];
	
	// Generate XML sitemap with all language pages
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${SUPPORTED_LANGUAGES.map(lang => `  <url>
    <loc>${SITE_URL}/${lang}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${SUPPORTED_LANGUAGES.map(hrefLang => `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${SITE_URL}/${hrefLang}/" />`).join('\n')}
  </url>`).join('\n')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};
