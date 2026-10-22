# Rituparan Reddy’s personal site

A SvelteKit journal and portfolio with painting backgrounds, dark reading cards,
and scroll-linked pixel transitions. Posts live in `src/posts`; the homepage,
blog, and projects use the same newest-first post list.

```sh
npm install
npm run dev
npm run check
npm run test:unit -- --run
```

Build for Cloudflare with `npm run build`, or use the Node adapter locally:

```sh
SITE_ADAPTER=node npm run build
npm run preview
```

Run browser checks against the Node build with
`SITE_ADAPTER=node npm run test:e2e`. Set `CHROMIUM_PATH` if Chromium is installed
outside Playwright’s default location.

The approved artwork IDs live in `src/lib/art/selection.json`. The homepage
shuffles that collection once per load; visitors cannot change it through
cookies or browser storage. `static/` contains only public site assets.

Responsive WebP paintings ship as static files through Cloudflare’s CDN, without
an image-service subscription. Their filenames include content hashes so they
can use a one-year immutable browser cache in `_headers`. Regenerating an
image changes its URL. Only the current painting and its neighbor load ahead.

Reading text uses self-hosted ET Bembo, matching the body font on
[Elon Litman’s blog](https://elonlit.com/scrivings/how-to-run-turing-complete-malware-in-pytorchs-backward-pass/).
Its MIT license is included in `static/fonts/ETBembo-LICENSE.txt`.

The library separates Reading now, Owned / to read, and Read. The owner-approved
placeholder assignments are in `provisionalReadingStatus` in `src/lib/books.ts`;
replace that map when the final reading inventory is available.
