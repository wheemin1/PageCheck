import type { RequestHandler } from '@sveltejs/kit';

const SITE_URL = 'https://mocheck.netlify.app';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];

export const GET: RequestHandler = async () => {
	const currentDate = new Date().toISOString().split('T')[0];
	
	// Build sitemap XML content
	let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
	xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
	
	// Add each language page
	for (const lang of SUPPORTED_LANGUAGES) {
		xmlContent += '  <url>\n';
		xmlContent += `    <loc>${SITE_URL}/${lang}/</loc>\n`;
		xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
		xmlContent += '    <changefreq>weekly</changefreq>\n';
		xmlContent += '    <priority>1.0</priority>\n';
		
		// Add hreflang links for all languages
		for (const hrefLang of SUPPORTED_LANGUAGES) {
			xmlContent += `    <xhtml:link rel="alternate" hreflang="${hrefLang}" href="${SITE_URL}/${hrefLang}/" />\n`;
		}
		
		// Add x-default hreflang
		xmlContent += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/en/" />\n`;
		xmlContent += '  </url>\n';
	}
	
	xmlContent += '</urlset>';

	return new Response(xmlContent, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
