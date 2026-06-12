import { readFileSync } from 'node:fs';
import type { PageServerLoad } from './$types';
import type { PlaceDetail } from '$lib/types';

export const load: PageServerLoad = () => {
	const details: Record<string, PlaceDetail> = JSON.parse(
		readFileSync('static/data/details.json', 'utf8')
	);
	return { detail: details['bodh-gaya'] };
};
