# Journal / painted margins

This is a browser-native visual prototype. The prior Rust/GPUI implementation remains at `/workstation/index.html`; it is not loaded by the demo. Do not represent this prototype as GPUI.

Palette: sea ink #252c35, faded violet #8b8190, chalk #e7e4df, dusk rose #bd9290, deep water #33464c. The paintings supply the saturated colors. Instrument Serif supplies titles; Georgia supplies long-form body copy, with modest system monospace dates.

Layout: an uninterrupted painted viewport behind a right-aligned reading column. The site name and three small anchors occupy the opposite margin. Each section moves the reader to another painting. The paper is opaque enough to read without depending on the painting behind it. Mobile preserves a generous opening view of the painting and then brings the reading column into the viewport.

```
rituparan reddy                 Writing  Books  Work

          painted sky
                          date
                          Cloud chamber
                          existing opening passage
                          Read entry

      painted light       Books
                          titles / authors

      painted shadow      Hexapod robot
                          existing opening passage
```

Motion: native page scroll, a passive event listener and one requestAnimationFrame per scroll update. Opacity dissolves and small vertical transforms only. No idle animation loop, scroll interception, shaders, or effect controls. Reduced motion uses one stationary painting. Four independently loaded reproductions; first eager, later images near their sections.

Review: the earlier framing made art a separate exhibit and filled empty space with invented personal copy. This pass removes the gallery framing, statuses, theme toggle, dithering controls, slogans, and duplicated biography. It uses existing project excerpts and the user's supplied book titles. The book list does not claim reading completion or invent reviews. A small colophon credits the paintings; a separate moodboard explains the art direction.

References: the user's Monet/Moreau references, bookshelf photo, literary list, and feedback; Anthropic's frontend-design skill (previously fetched from its official repository). The new moodboard studies atmospheric crops, not a gallery of controls.

## Revision after live feedback

The user found the first browser demo too soft and explicitly asked to restore the esoteric computer character. The final direction uses dark document panes (#202225), compact mono navigation, hard borders and shadows, serif headings, and Georgia reading text. The former continuous pale column is now a sequence of separate hypertext windows. No fake terminal output, effect menus, or personal slogans.

Turner's moonlit harbor opens the site; Böcklin's island, John Martin's apocalyptic landscape, and the user's Monet sunset follow. Four-tone dithering is baked to WebP and masked into the original paintings at the left and lower edges. Scroll only changes transforms and opacity. No image processing runs in the page. The supplied Monet remains a point of continuity; Delville and Moreau are removed from this demo.

## Final refinement

The user approved the direction and requested less jarring dithering, no painting bleed, a short introduction, and the résumé tab. The dither overlay is now 16% opacity and confined to the outer edges. Exactly one opaque painting is visible at a time; the page switches paintings as each section enters the reading area, after its image has decoded. The small parallax movement remains. The introduction states only established facts and includes GitHub/email links. Résumé is restored to both navigation bars.

## Reading-card transitions

The about and artwork panels share a measured height and width. Their natural
content determines the height, including changes in artwork-title length; the
mobile layout uses the same sizing rule with compact typography.

Painting changes follow the reading card nearest the viewport's reading line.
There are no added spacers, scroll snapping, wheel interception, pinned reading
cards, or simulated scroll progress. The four current reading cards use the
first four approved paintings; the complete 25-work selection remains saved for
future entries. Smaller preview collections cycle once per reading card.

A 760ms opacity dissolve and a faint, temporary grain texture replace the wipe.
The focused window and artwork credit update when the dissolve starts. Fast
scrolling interrupts the current mix and targets the latest card without a
transition queue. The background stays stationary, and reduced-motion users get
instant painting and focus changes. Images decode before appearing, with just
the current card and the next card requested ahead of time.

## GPU noise dissolve and persistent identity

`src/lib/art/NoiseDissolve.ts` replaces the generic fade when WebGL is available.
The name card now stays fixed alongside the artwork credit, using the same
width, measured height, border, opaque background, and serif title treatment.
On mobile both remain compact and fixed, with ordinary document scrolling
between them.

The renderer has two passes. A cached, half-resolution framebuffer stores a
static reveal rank for each 2px cell. The rank combines domain-warped fractal
value noise, 16px block hashes, and interleaved-gradient fine detail. This makes
larger regions break into small computer-like clusters without re-randomizing
the pattern every frame. A second shader samples the rank and advances one
threshold over 1150ms. It blends the narrow reveal frontier in linear light and
adds a restrained scanline accent only at that frontier.

When the reader changes direction mid-transition, the renderer redraws the
current state and copies it into one of two alternating GPU snapshot textures.
The next reveal starts from those actual pixels, without CPU readback, stale
queues, or a jump to either endpoint. The technique uses WebGL's
[`copyTexImage2D`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/copyTexImage2D).

The animation buffer is capped at 2.5 million pixels and 1.25 device-pixel ratio;
individual uploaded images are capped at 3 million pixels. Painting textures
are cached around the current scene, and the rank field is regenerated only on
viewport resize. No rendering loop runs when the painting is settled; the canvas
hides and the original responsive image takes over. WebGL unavailability or
context loss falls back to native decoded images; reduced motion skips the
animation entirely. Nothing intercepts wheel/touch input or adds scroll distance.

## Quadtree transition refinement

The current effect keeps the fine ending but replaces the noisy opening with a
quadtree hybrid. A deterministic root-to-leaf traversal subdivides each continued
node into four children. Coarse leaves start first; child start times accumulate
their ancestors' delays. Each leaf makes a shallow orthographic fold while its
image changes. There are no edge-on gaps, mirrored faces, or whole-image motion.

The first 12% introduces only a faint blend. Broad regions establish the change
before smaller leaves become active. A small subset of high-rank pixels remains
for the existing fine noise resolve at the end. The 1450ms transition still runs
only while changing paintings. RGBA in the cached field texture now stores the
fine rank, leaf depth, inherited start time, and fold axis, so the tree is built
once per viewport rather than traversed in every animation frame. Native scroll,
focus synchronization, interrupted-frame snapshots, and reduced-motion fallback
remain in place.

## Instant pixel switching through 1×1 leaves

The current transition uses **binary source selection**, following the clarified
meaning of “flip.” Each output pixel samples either the old painting or the new
painting. There is no image alpha tween, color interpolation, scanline tint,
rotation, folding, or distorted texture coordinate. The old CSS/compositor fade
fallback has also been removed; unavailable WebGL switches to the decoded image.

The cached mask traces a complete quadtree path to 1×1 **drawing-buffer pixels**,
not CSS-sized tiles. A forest of 256px roots bounds the earliest changed regions.
A resolved node may switch its region early; unresolved nodes recurse through
128, 64, 32, 16, 8, 4, 2, and 1 pixels. Metadata generation keeps tracing every
path to one pixel, including regions resolved by ancestors. At the last level,
individual pixels get distinct, stable switch times. The only per-frame operation
is comparing the cached switch time with the current hierarchy cursor.

Both the mask and transition buffer now use the actual display pixel ratio, so
a 2× display gets a 2× drawing buffer and can address individual display pixels.
Painting texture uploads remain bounded. The higher-resolution mask is generated
once per viewport; GPU rendering stops when the transition completes.

For a later native implementation, the rendering contract is two painting
textures, a cached switch-time texture, and one progress value. At each output
pixel the operation is `cursor >= switch_time ? new_pixel : old_pixel`. The
algorithm is isolated from the page layout in `src/lib/art/NoiseDissolve.ts` for
the Rust/GPUI port; the current preview remains browser-based.

## Staged pixel tail and evolving fine branches

Switch times now use two RGBA8 channels as a 16-bit integer, decoded with
`(R * 256 + G) / 65535`. The mask uses nearest sampling and disables hardware
dithering so its bytes remain exact. The first three quadtree levels keep the
same decisions and local timing across transitions. Deeper decisions incorporate
an inherited branch hash and a per-transition xorshift seed. The seed stays fixed
throughout each animation; increasing the cursor can only reveal more pixels.
On interruption, the old field is rendered and snapshotted before reseeding.
The field is regenerated once per transition, reusing its texture allocation.

`QuadtreeTiming.ts` allocates real milliseconds to each depth. The last two
levels get extra time based on drawing-buffer size and the expected unresolved
population from the tree's branch probabilities. This is an estimate, without
a synchronous GPU readback in the scrolling path. At 1280×900 the transition
takes about 2034ms, including a 646ms individual-pixel stage. The final stage
uses a quadratic ease-out for its threshold, tapering the remaining population
instead of clearing a large group on the final frame. Terminal pixel ranks span
the whole stage rather than being concentrated by averaging noise distributions.

GPU readback verification at 1280×900 found over 22,000 distinct switch times,
identical coarse ranks across seeds, changed fine ranks, and zero interpolated
source colors. One sampled transition had 17,655 pixels outstanding at 90%,
4,278 at 95%, 673 at 98%, 168 at 99%, and 45 at 99.5%. Every traced leaf still
reaches one drawing-buffer pixel. Exact populations vary with the fine seed.

## Smooth onset and randomness throughout the tree

The current revision supersedes the invariant opening and xorshift seed above.
Each transition takes fresh entropy from `crypto.getRandomValues`; every depth
uses that seed. The GPU expands it into a fixed random switch schedule for that
transition. Nothing rerolls during playback, so revealed pixels cannot flicker
back. Interrupted frames are still snapshotted before changing the seed.

Pacing now follows a monotone cubic Hermite curve through the depth boundaries,
using weighted harmonic interior tangents and zero velocity at both endpoints.
This removes the initial hold followed by a full-speed launch, and the abrupt
speed changes between layers. The 1280×900 schedule takes about 2154ms, with
the same 646ms budget for individual-pixel leaves and a gradually settling tail.
Timing tests check monotonicity, matching boundary velocities, gentle onset,
and quadratic decay of the outstanding tail.

Timing alone cannot soften a large patch whose pixels all change in one frame.
Early resolved branches therefore distribute their pixels over short seeded
release windows. Those windows contract with depth; terminal 1px leaves still
have full-range random ranks. Each pixel continues to select exactly one source
painting, with no color blend. The mask records both the resolving ancestor and
the fully traced 1px terminal depth. This retains the hierarchy while avoiding
whole-square pops at the beginning.

A GPU sample found 6301 distinct switch times within the coarsest leaves, changed
ranks at every depth across seeds, and no blended output pixels. The first
active 60Hz opening frame switched 184 of 1,152,000 pixels, followed by a gradual
ramp. These counts describe one seed; they are not fixed animation targets.
Pixel ranks now use a seeded spatial hash instead of interleaved-gradient noise,
removing the repeating diagonal grain visible inside the early release windows.
Native scroll and scene focus behavior are unchanged.

## Independent shader on the artwork credit

The painting-info card now has its own `NoiseDissolve` instance and small drawing
buffer. The renderer accepts either painting images or canvas snapshots, and a
surface-size callback replaces the viewport assumption. Both instances share a
`DissolveClock` (start timestamp and easing timeline), but have independent
textures, random masks, GPU contexts, and interruption snapshots. The background
continues to use native responsive images when settled.

`cardSnapshot.ts` rasterizes the text-only card using an SVG foreign object with
computed styles and embedded copies of the site's two fonts. Font data is cached
once, and snapshots are made only when content or layout changes. No DOM-to-image
dependency or duplicate canvas typography is needed. `dissolveCard.ts` temporarily
overlays the local shader while preserving the semantic HTML and actual links
underneath. It restores native text after playback, on keyboard focus, on resize,
or if its own context is lost. Reduced motion skips snapshot preparation and
animation. Async snapshots use revision guards to discard stale updates.

The old/new HTML font rasterizations were visually compared with native text.
Browser coverage checks the separate buffer's card-sized dimensions, exact shared
start/duration, interrupted navigation, reduced motion, and independent context
loss followed by working links. For a GPUI port, the DOM snapshot adapter can be
replaced with render-to-texture text; the quadtree shader contract remains the same.

## Shader-driven changes to card height

Card transitions now include the panel silhouette and border. Their canvas lives
beside the native card on a transparent fixed surface spanning the union of its
old and new rectangles. The old/new textures keep their original pixel scale and
are placed using normalized bounds; pixels outside each rectangle are transparent.
The existing binary reveal selects all four RGBA channels, dissolving the added
or removed area against the live painting behind it. It does not stretch text,
interpolate opacity, or animate a CSS height.

The native card, including its frame, stays transparent while its target layout
settles and is captured. It returns at completion with the shader already showing
that same shape. The painting card remains bottom anchored; the matching identity
card gets the same treatment only when their shared height changes, remaining top
anchored. Both follow the background clock. A GPU freeze captures an interrupted
transition before moving its surface, including its current alpha mask, and places
that texture into the next surface without a CPU pixel readback.

Geometry tests check both anchors, original pixel scale, and snapshot placement.
A browser regression exercises growth, shrinkage, and a reversal during shrinking
with a long title at larger text size. GPU readback in the added strip confirms a
mix of alpha 0 and 255 pixels with no intermediate alpha values. Existing HiDPI,
reduced-motion, context-loss, and link behavior checks continue to pass.

Interruption snapshots use the actual context's framebuffer format: RGB for the
opaque painting canvas and RGBA for transparent cards. An RGBA copy from the
opaque WebGL1 framebuffer is invalid and leaves an unusable texture, producing
black pixels on the next reveal. A regression captures pixels immediately before
the copy and compares them with the next transition's initial frame, including
rapid navigation across multiple scenes. It also checks that the GPU reports no
copy error. The transparent card geometry continues to preserve its alpha mask.

## One shuffled painting per card

Each homepage load receives a fresh 32-bit seed from server-side Web Crypto.
`shuffle.ts` uses seeded Fisher–Yates over the full selected collection, without
mutating the picker order or saved preferences. SSR and hydration share the seed,
so the initial painting is already correct in the HTML. The component retains
that seed for its lifetime, including data refreshes, scrolling, and resizing.

The existing card-to-painting mapping is unchanged: card N uses item N from the
shuffled list, wrapping only after the collection is exhausted. Today's four
cards therefore draw from the entire selection; future cards automatically use
more of it. There is no timer, extra scroll distance, or automatic cycling within
a card. Current/next decoding and the bounded GPU texture cache remain in place.

Tests cover reproducibility, complete permutations without duplicates, eligibility
of every selected painting for the first four cards, server/hydration agreement,
fresh reload order, stable card mapping, and unchanged saved selection.
