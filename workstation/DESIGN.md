# The examined life / design pass two

The approved moodboard is the brief: a Symbolist study, Impressionist light, Penguin Classics materials, and Sun/NeXT interface precision. The subject is Rituparan's existing work and reading; visitors should understand the person, browse real projects, and read the writing.

Tokens: Penguin black `#222621`, aged paper `#e8e1cd`, verdigris `#54716c`, violet dusk `#7f748f`, tarnished gold `#c1a774`, oxblood `#703d48`. Dark is the initial gallery setting; the inverted paper setting stays available. Instrument Serif carries names, titles, and article prose. JetBrains Mono carries navigation, dates, and compact controls. IBM Plex Sans is bundled for the web platform's system-font requirement.

Layout: a restrained workstation frame surrounds a full-width gallery with a narrow introduction and a substantially larger painting. Navigation sits in the top bar. Align text left. Keep the art in its original colors and preserve its composition. Project rows carry title, description, and year; the reading shelf creates a quieter second act. On phones, the name and opening painting precede the biography.

```text
wordmark          home / work / library / journal / about     paper / moodboard
             name, introduction     large painted surface
             projects / journal    title, artist / rendering controls

             selected work         title / description / year
                                   title / description / year

             reading shelf         a quieter Monet study
```

Review against the brief: the previous two-column portfolio made the painting too small and gave decorative numbering too much space. The new composition spends its scale on the painting, uses the approved dark palette, and removes unnecessary eyebrows and slogan-like copy. Workstation texture remains in the outer frame and a small section of window chrome. Dithering remains interactive, not permanently applied to the paint. No automatic animation; state changes respond to input.

Applied reference: Anthropic's [frontend-design skill](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), fetched and read from the official repository on 2026-10-18. This plan follows its plan/review/build/critique process; the client's explicit moodboard and Rust/GPUI/WASM requirements take precedence.
