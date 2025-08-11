import type { RequestHandler } from '@sveltejs/kit';
import { getAllPosts } from '$lib/posts';

export const GET: RequestHandler = async ({ url }) => {
    const origin = url.origin;

    const staticUrls = [
        '/',
        '/blog',
        '/projects',
        '/reading',
        '/resume'
    ];

    const posts = await getAllPosts();

    const urls = [
        ...staticUrls.map((path) => `${origin}${path}`),
        ...posts.map((p) => `${origin}/blog/${p.slug}`)
    ];

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map((loc) => `<url><loc>${loc}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`) 
    .join('\n')}
</urlset>`;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml'
        }
    });
};

