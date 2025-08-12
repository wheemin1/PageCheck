import type { RequestHandler } from '@sveltejs/kit';

const SITE_URL = 'https://mocheck.netlify.app';
const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'fr', 'de'];

export const GET: RequestHandler = async () => {
	const currentDate = new Date().toISOString().split('T')[0];
	
	// Build standard sitemap XML content
	let xmlContent = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
	xmlContent += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
	
	// Add each language page as a simple URL entry
	for (const lang of SUPPORTED_LANGUAGES) {
		xmlContent += '  <url>\n';
		xmlContent += `    <loc>${SITE_URL}/${lang}/</loc>\n`;
		xmlContent += `    <lastmod>${currentDate}</lastmod>\n`;
		xmlContent += '    <changefreq>weekly</changefreq>\n';
		xmlContent += '    <priority>1.0</priority>\n';
		xmlContent += '  </url>\n';
	}
	
	xmlContent += '</urlset>\n';

	return new Response(xmlContent, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'X-Robots-Tag': 'noindex',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
