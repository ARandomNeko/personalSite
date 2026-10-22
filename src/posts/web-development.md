---
title: 'Web Development'
date: '2024-08-20'
tags: ['project']
description: 'How Markdown files become posts, project pages, and a reading list in SvelteKit.'
published: true
---

This site runs on SvelteKit. Posts live in Markdown files; mdsvex compiles them into Svelte components.

## One file per entry

Each file in `src/posts` has frontmatter for its title, date, description, tags, and publication status. Book entries also have a reading status. The filename becomes the URL: `cloud-chamber.md` lives at `/blog/cloud-chamber`.

A loader finds the files with Vite’s `import.meta.glob`, checks their metadata, filters out unpublished entries, and sorts by date. The pages select from that collection:

- Projects use the `project` tag.
- The reading list uses the `book` tag.
- The blog excludes books marked “plan to read.”

A book can sit on the reading list before it has a note. A project can appear in both the portfolio and the blog without duplicating the article.

## Rendering

List pages receive metadata and a slug. Article pages load the compiled Markdown component. That keeps component functions out of serialized server responses.

A shared layout handles article titles, dates, and reading width. The route supplies page metadata. Content and code live in the same repository, so publishing an entry follows the same Git and build workflow as changing the site.

[Source on GitHub](https://github.com/ARandomNeko/personalSite).
