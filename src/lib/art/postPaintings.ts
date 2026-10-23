import { paintings } from './collection';
import { bookPaintings } from '$lib/bookPaintings';

// Book essays inherit their library pairing when they are published.
const postPaintings: Record<string, string> = {
	'rl-ppo-drone-sandbox': 'nga-66425',
	'polymarket-bot': 'nga-111194',
	'hexapod-robot': 'vasnetsov-crossroads',
	'web-development': 'schinkel-cathedral',
	'cloud-chamber': 'nga-50299',
	'ergonomic-keyboard': 'nga-46523'
};

export function paintingForPost(slug: string) {
	const id = postPaintings[slug] ?? bookPaintings[slug];
	return paintings.find((painting) => painting.id === id) ?? paintings[0];
}
