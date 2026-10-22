import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const scalar = (value) => {
	const text = value.trim();
	if (text.startsWith('"') && text.endsWith('"')) return JSON.parse(text);
	if (text.startsWith("'") && text.endsWith("'")) return text.slice(1, -1).replaceAll("''", "'");
	return text;
};

const posts = [];
for (const filename of (await readdir(resolve(root, 'src/posts'))).sort()) {
	if (!filename.endsWith('.md')) continue;
	const source = await readFile(resolve(root, 'src/posts', filename), 'utf8');
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!match) throw new Error(`Missing frontmatter: ${filename}`);
	const metadata = {};
	for (const line of match[1].split(/\r?\n/)) {
		const field = line.match(/^(\w+):\s*(.*)$/);
		if (!field) continue;
		metadata[field[1]] =
			field[1] === 'tags'
				? [...field[2].matchAll(/'([^']*)'|"([^"]*)"/g)].map((tag) => tag[1] ?? tag[2])
				: scalar(field[2]);
	}
	if (metadata.published === 'false') continue;
	if (!metadata.title || !metadata.date) throw new Error(`Missing title or date: ${filename}`);
	posts.push({
		slug: filename.slice(0, -3),
		title: metadata.title,
		date: metadata.date,
		description: metadata.description ?? '',
		tags: metadata.tags ?? [],
		status: metadata.status ?? '',
		body: match[2].trim()
	});
}
posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
await writeFile(
	resolve(root, 'workstation/src/content.json'),
	JSON.stringify(posts, null, 2) + '\n'
);
console.log(`Prepared ${posts.length} entries for the Rust workstation.`);
