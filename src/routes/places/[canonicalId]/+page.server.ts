import { readFileSync } from 'node:fs';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import type { PlaceDetail } from '$lib/types';

// Runs at build time only (adapter-static + prerender): bake one page per
// canonical place so every place has a deep-linkable, indexable URL.
const details: Record<string, PlaceDetail> = JSON.parse(
	readFileSync('static/data/details.json', 'utf8')
);

export const entries: EntryGenerator = () =>
	Object.keys(details).map((canonicalId) => ({ canonicalId }));

export const load: PageServerLoad = ({ params }) => {
	const detail = details[params.canonicalId];
	if (!detail) error(404, 'Unknown place');
	return { detail };
};
