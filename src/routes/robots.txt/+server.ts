import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
    const origin = url.origin;
    const body = `User-agent: *
Allow: /
Sitemap: ${origin}/sitemap.xml`;
    return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};

