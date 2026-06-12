import { readFileSync } from 'node:fs';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageServerLoad } from './$types';
import type { Journey } from '$lib/types';

const PILGRIMS = ['faxian', 'xuanzang', 'yijing'] as const;

export const entries: EntryGenerator = () => PILGRIMS.map((pilgrim) => ({ pilgrim }));

export const load: PageServerLoad = ({ params }) => {
	if (!PILGRIMS.includes(params.pilgrim as (typeof PILGRIMS)[number])) {
		error(404, 'Unknown pilgrim');
	}
	const journey: Journey = JSON.parse(
		readFileSync(`static/data/journeys/${params.pilgrim}.json`, 'utf8')
	);
	return { journey };
};
