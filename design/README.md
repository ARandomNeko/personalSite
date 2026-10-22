# Local design archive

These are development references, outside SvelteKit’s `src/routes` and `static`
directories. They are not public pages or assets in a production build.

- `painting-picker/` contains the former picker and detail-view source.
- `painting-picker-collection.ts`, `catalogue.json`, and
  `browser-checks.ts.txt` preserve its original collection helpers, catalogue,
  and browser checks as reference material. They are not an active app.
- `moodboard/`, `moodboard-route.ts`, and `paintings/` preserve the design
  studies, credits, unused reproductions, and baked effects.
- `DESIGN-DEMO.md` records the design’s development history.

Production keeps the 25 approved works listed in
`src/lib/art/selection.json`, their metadata in `src/lib/art/catalogue.json`,
and their responsive images in `static/paintings/catalogue/`. Artwork sources
and applicable image licenses are credited on the homepage. The Turner image
in `static/paintings/turner-moonlight.jpg` also backs the reading pages.

`scripts/prepare-painting-catalogue.mjs` writes approved images to `static/`
and other images here, updating the archived full catalogue and the approved
production catalogue separately. `scripts/prepare-journal-art.mjs` writes old
dither experiments here rather than into the public asset directory.
