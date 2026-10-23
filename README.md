# Rituparan Reddy’s personal site

A SvelteKit journal with painting backgrounds, dark reading cards, and scroll-linked
pixel transitions. Posts live in `src/posts` and appear newest first.

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

Run browser checks against a running preview with:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4173 npm run test:e2e
```

Set `CHROMIUM_PATH` when Chromium is installed outside Playwright’s default location.

## Journal and Work

`/blog` and `/projects` use the same `JournalGallery` component. Work selects only
posts tagged `project`; the filters link between those two views. The metadata
index lives in `src/lib/server/posts.ts`, separate from article components. Opening
an article imports only that article. Books marked `plan to read` supply the library
inventory without publishing empty journal pages.

Article painting pairings live in `src/lib/art/postPaintings.ts`. Book essays inherit
their library pairing. Artwork links and credits come from the local catalogue.

The library has Reading now, Owned / to read, and Read groups. The owner-approved
placeholder assignments are in `provisionalReadingStatus` in `src/lib/books.ts`;
replace that map when the final inventory is available. Selecting or focusing a
book changes the backdrop, with reduced-motion and WebGL fallbacks.

## Delivery and rendering

Journal, Work, Library, Résumé, and published articles are prerendered. Cloudflare
serves those pages and their assets without running a Function. The homepage stays
server-rendered so each fresh request can shuffle the approved paintings. Their IDs
live in `src/lib/art/selection.json`; visitor preferences cannot override them.

`SITE_ORIGIN` controls the prerendered canonical origin and defaults to
`https://rituparan.com`, matching the résumé’s website address.

Responsive WebP paintings include 480, 800, 1200, 1600, 2400, 3200, and source-width
variants where available. Foreground cards use their rendered sizes. Darkened phone
backdrops use at most 1600 pixels; desktop artwork retains the larger variants.
Non-leading card images load lazily. Painting and font filenames contain content
hashes and receive one-year immutable cache headers. Keep `_headers` in the repo
root: the installed Cloudflare adapter copies it into the deployment output.

Fonts are self-hosted WOFF2 with their original glyph coverage and licenses. Reading
text uses ET Bembo, matching [Elon Litman’s blog](https://elonlit.com/scrivings/how-to-run-turing-complete-malware-in-pytorchs-backward-pass/).
Critical fonts are preloaded; the site makes no Google Fonts request.

Painting shaders initialize on the first transition. The static résumé never needs
to download or compile the renderer. Homepage text snapshots warm after fonts load,
copy only the layout and paint properties the panels use, and leave their native
HTML borders visible throughout transitions. The browser suite covers interrupted
transitions, reduced motion, GPU loss, fractional borders, and high-density displays.

## Performance measurements

Run the same cold mobile audit against a local preview:

```sh
CHROMIUM_PATH=/path/to/chromium npm run perf -- /tmp/site-performance.json
```

`PERF_BASE_URL` selects another origin. The audit uses a fresh browser context per
page, disabled caches, a 390×844 viewport at 2× density, 80 ms latency, 1.6 Mbps
download throughput, and 4× CPU throttling. It saves resource transfers, LCP, layout
shifts, and long tasks. These are local lab observations; production timings will
also depend on the device and network.

A cold sample before and after this pass measured the following subresource transfers:

| Page          |  Before |   After | Reduction |
| ------------- | ------: | ------: | --------: |
| Journal       | 2.91 MB | 0.46 MB |       84% |
| Library       | 1.42 MB | 0.30 MB |       79% |
| Résumé        | 1.18 MB | 0.29 MB |       76% |
| Drone article | 0.73 MB | 0.38 MB |       48% |

Journal LCP fell from 8.58 s to 1.99 s in those samples. The homepage’s painting
shuffle makes byte comparisons vary between runs; measured startup long-task time
fell from 1.13 s to 0.50 s after simplifying its text snapshots. Article requests fell
from 48 to 34 after removing the full-collection import and unused external font CSS.
