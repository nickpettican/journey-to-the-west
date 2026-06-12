/**
 * Representative numbers for the pilgrims' textual monk counts ("several
 * thousand monks", "a few hundred"). Shared by scripts/build-data.mjs (map
 * bubble sizing) and the detail components (so every witness column shows a
 * number, with the original phrase underneath). Values are deliberately
 * generous mid-range readings; patterns match in order, most specific first.
 *
 * @type {[RegExp, number][]}
 */
export const MONKS_PHRASE_ESTIMATES = [
	[/several myriads/i, 10000],
	[/several thousand|thousands of/i, 3000],
	[/several hundred/i, 500],
	[/a few hundred/i, 300],
	[/(a )?few tens/i, 50],
	[/many monks/i, 300],
	[/(very )?(a )?few (monks|in number)/i, 20]
];

/**
 * @param {string | null | undefined} text
 * @returns {number | null} representative count, or null when the phrase
 * carries no estimable quantity ("only the families belonging to the monks").
 */
export function estimateMonksFromText(text) {
	if (!text) return null;
	for (const [pattern, value] of MONKS_PHRASE_ESTIMATES) {
		if (pattern.test(text)) return value;
	}
	return null;
}
