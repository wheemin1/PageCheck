import type { RequestHandler } from '@sveltejs/kit';

const SITE_URL = 'https://mocheck.netlify.app';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];

export const GET: RequestHandler = async () => {
	const currentDate = new Date().toISOString().split('T')[0];
	
	// Generate URL entries for each language
	const urlEntries = SUPPORTED_LANGUAGES.map(lang => {
		const hreflangs = SUPPORTED_LANGUAGES.map(hrefLang => 
			`    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${SITE_URL}/${hrefLang}/" />`
		).join('\n');
		
		return `  <url>
    <loc>${SITE_URL}/${lang}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${hreflangs}
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/" />
  </url>`;
	}).join('\n');
	
	// Generate XML sitemap with proper formatting
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
