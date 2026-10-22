# Divine workstation

An experimental personal website rendered by **Rust + GPUI + WebAssembly**, on branch `design/divine-workstation`.

The browser supplies a canvas. GPUI performs layout, text shaping, painting, hit testing, scrolling, and input. All visible workstation controls and views are Rust in `src/lib.rs`. SvelteKit serves the loader and HTML editions of articles, reading, projects, and the résumé. The design follows the approved moodboard and [Anthropic’s frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md); see `DESIGN.md` for the plan and critique.

## Run

Install Rust with the WASM target, and the exact binding generator used by the lockfile:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli --version 0.2.121 --locked
npm install
npm run dev
```

This experiment is separate from the production site. `npm run dev` and
`npm run build` run only SvelteKit; they do not compile or publish this app.
Run `npm run build:workstation` (or `node scripts/build-workstation.mjs --dev`)
to generate bindings under `workstation/web/pkg`. Serve `workstation/web`
with a local static server to open the experiment, for example
`python3 -m http.server 8080 --directory workstation/web`.
Its links to the HTML site require a separate SvelteKit server or hosting setup.

On NixOS, the system Rust package may omit LLVM’s WASM linker. Use `nix shell nixpkgs#lld` and set `CARGO_TARGET_WASM32_UNKNOWN_UNKNOWN_LINKER=wasm-ld`. `WASM_BINDGEN` can point to a separately installed matching binding-generator binary. `CARGO_HOME` and `CARGO_TARGET_DIR` retain their standard Cargo meanings.

GPUI 0.3.9 currently needs `parking_lot`’s nightly feature. The crate-local Cargo configuration scopes `RUSTC_BOOTSTRAP=1` to this experimental build. The browser platform runs single-threaded and tries WebGPU before WebGL2; it does not require cross-origin isolation or SharedArrayBuffer. See the [upstream WASM documentation](https://github.com/longbridge/gpui-kit/blob/main/website/docs/webassembly.md).

## Controls

- `1`–`5`: index, projects, reading, journal, about.
- `I`: invert the theme; preference is saved locally.
- `D`: cycle color, one-bit, and two-bit artwork.
- `[` / `]`: previous / next painting.
- `Escape`: return to the index.

Every shortcut also has a clickable control. Browser back/forward follows in-app navigation. `src/content.json` is regenerated from published Markdown posts at build time, so there is one content source. Article links and the résumé have HTML editions. Screen-reader users can reach the HTML navigation through the loader’s first Tab stops. GPUI’s experimental canvas backend does not provide the same browser semantics as those HTML pages.

## Artwork and typography

The design draws on Sun/NeXT workstations, Penguin Classics, decadent and Symbolist painting, and the owner’s bookshelf: Dante, Dostoevsky, Camus, Kant, Kierkegaard, and Wilde. Ivory, charcoal, verdigris, and restrained violet; literary serif type within dense monospace chrome. The source photograph is a private design reference and is not included.

Historical paintings are bundled locally. The supplied Moreau and Monet links are atmosphere references in the archived `design/moodboard/`. No generated artwork is used.

| File | Work | Source |
| --- | --- | --- |
| `assets/jupiter-and-semele.jpg` | Gustave Moreau, *Jupiter and Semele*, 1894–95 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Jupiter_and_Semele_by_Gustave_Moreau.jpg), public domain |
| `assets/delville-angel.jpg` | Jean Delville, *The Angel of Splendour*, 1894 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:L%E2%80%99Ange_des_Splendeurs_(1894)_-_Jean_Delville.jpg), public domain |
| `assets/monet-etretat.jpg` | Claude Monet, *The Manneporte near Étretat*, 1886 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Claude_Monet_-_The_Manneporte_near_%C3%89tretat.jpg), public domain |
| `assets/monet-footbridge.jpg` | Claude Monet, *The Japanese Footbridge*, 1899 | [National Gallery of Art](https://www.nga.gov/artworks/74796-japanese-footbridge), public domain |

The color mode preserves the original composition. The Rust framebuffer offers Bayer ordered dithering and Floyd–Steinberg error diffusion with two or four luminance levels. Both use the original source on each pass. `src/dither.rs` has isolated algorithm tests:

```sh
rustc --edition 2024 --test workstation/src/dither.rs -o /tmp/workstation-dither-tests
/tmp/workstation-dither-tests
```

Instrument Serif, IBM Plex Sans, and JetBrains Mono are bundled with their OFL licenses. Fonts must be loaded before GPUI opens its first web window; the browser backend has no system font database.
