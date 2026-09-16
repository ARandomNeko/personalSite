---
title: 'Web Development'
date: '2024-08-20'
tags: ['project']
description: 'Inside this site: Markdown posts, SvelteKit routes, a monochrome interface, and a Three.js background.'
published: true
---

This website is one of my web-development projects, and a useful example because you can look around the result while reading about it. It brings together a portfolio, a blog, a reading list, and a résumé. Underneath those pages is a fairly small SvelteKit application with Markdown files for content.

The interesting part is how much those pages share. A project is also a blog post. A book can appear in the reading list before it has a reading note. The homepage pulls recent entries from the same collection. Those relationships shape the code more than any individual page does.

## One collection, several views

Posts live in `src/posts` as Markdown files. Each file starts with frontmatter: a title, date, description, tags, and a publication flag. Book entries also have a reading status. The filename supplies the URL slug, so `cloud-chamber.md` becomes `/blog/cloud-chamber`.

The content loader discovers those files with Vite's `import.meta.glob`. It checks for the required metadata, filters out unpublished entries, and sorts the rest by date. From there, each page asks for a different view of the collection:

- The blog lists published entries, excluding books marked “plan to read.”
- The projects page selects entries tagged `project`.
- The reading page selects entries tagged `book`.
- The homepage shows the three most recent entries eligible for the blog.

That means adding a project doesn't require maintaining a separate project database and blog index. Its tag makes it appear in the right place, while the article itself has one URL.

There is a small but useful distinction in the data model: a full post includes its rendered component, while a list preview only needs metadata and a slug. Cards need a title, description, and link; the article route needs the body. Keeping those responsibilities separate also keeps component functions out of server responses that must be serialized.

## Writing and rendering

The site uses mdsvex to compile Markdown into Svelte components. A shared article layout handles the title, date, tags, and reading width. The article route adds metadata such as the page description and Open Graph title.

For a site this size, files fit the workflow well. Content and layout changes can travel in the same Git commit, and a post is readable without opening a CMS. The tradeoff is that publishing involves the repository and a build. That is convenient for my own site, though it would be a different choice for a team of editors who don't work in code.

## The visual side

The interface uses a monospace typeface, a monochrome palette, thin borders, and a spacing grid. CSS variables carry the light and dark themes through cards, text, and navigation. The theme toggle saves a preference locally, with the system preference as the initial fallback.

Behind the pages is a Three.js scene containing animated spheres. A custom shader uses a 4-by-4 dithering pattern to turn changes in brightness into a visible pixel-like texture. It gives the background a different character from smoothly shaded 3D objects while using the same restrained palette as the rest of the site.

The page layouts change with available space. The homepage and résumé use columns on wider screens and stack their content on smaller ones. Navigation can wrap, card text can break, and articles have a capped line length. Those details matter once real titles and paragraphs replace short placeholders.

## A site that can keep growing

The project is still small enough that its structure is easy to follow: files hold the writing, a loader organizes it, and Svelte components present it. That leaves room for the content to grow without requiring a separate publishing system first.

You can browse the [projects](/projects), see the [reading list](/reading), or explore the [site's source on GitHub](https://github.com/ARandomNeko/personalSite).
