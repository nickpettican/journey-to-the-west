/**
 * The twenty-two stations of the Nālandā scroll tour. All quotations are verbatim
 * from the translations and studies used by this site (typographic ligatures
 * normalised):
 *   F  — Faxian, "A Record of Buddhistic Kingdoms", tr. James Legge (1886), ch. XXVIII.
 *   X  — Xuanzang, "The Great Tang Dynasty Record of the Western Regions",
 *        tr. Li Rongxi (1996), Fascicle IX.
 *   YR — Yijing, "A Record of the Buddhist Religion", tr. Takakusu (1896).
 *   YB — Yijing, "Biography of Eminent Monks (Kao Seng Chuan)",
 *        tr. Latika Lahiri (1986), chüan 1.
 *   R  — M. B. Rajani, "A satellite's view of Nalanda's past" (2014); the
 *        satellite/field survey of the site's full, mostly unexcavated extent.
 * Anything that is later tradition or archaeological inference rather than
 * the pilgrims' testimony is badged as such on its card.
 */
export interface TourStation {
	id: string;
	kicker: string;
	title: string;
	body: string;
	quote?: { text: string; cite: string };
	photo?: { src: string; alt: string; credit: string; label?: string };
	badge?: string;
}

export const STATIONS: TourStation[] = [
	{
		id: 'approach',
		kicker: 'c. 637 CE · thirty li north of Rājagṛha',
		title: 'The approach',
		body: 'Xuanzang walks north from Rājagṛha through mango groves and villages — Faxian had passed this way two centuries before him, and Yijing would follow a generation later, staying ten years. The monastery ahead was held to stand on a grove once bought by five hundred merchants and offered to the Buddha. Yijing records that two hundred and one villages, granted by generations of kings, sustained the establishment these fields surround — an establishment that, as the fields themselves still secretly testify, ran far beyond the walls archaeologists have since uncovered.',
		quote: {
			text: 'The Buddha preached the Dharma at this place for three months and thereupon the merchants attained sainthood.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'sariputra-nala',
		kicker: 'c. 405 CE · Faxian',
		title: 'The village before the university',
		body: 'Two centuries before the great monastery rose, Faxian passed this way and knew the place only as a village — Nala, later Nālandā. What drew him was not a university but a memory: this, he was told, was where Śāriputra, wisest of the Buddha’s disciples, had been born, to which he returned to die, and over whose cremation a stupa still stood in Faxian’s day. (Xuanzang, coming later, put Śāriputra’s birth at a village nearby instead — the pilgrims do not always agree, and Legge’s own note flags the doubt.)',
		quote: {
			text: 'A yojana south-west from this place brought them to the village of Nala, where Sariputtra was born, and to which also he returned, and attained here his pari-nirvâna.',
			cite: 'Faxian, A Record of Buddhistic Kingdoms (tr. Legge), ch. XXVIII'
		}
	},
	{
		id: 'gate',
		kicker: 'one gate for all the monasteries',
		title: 'The gatekeeper’s examination',
		body: 'A lofty enclosure rings the whole complex. Xuanzang describes one gate for all the monasteries — this southern one; later Tibetan accounts remember four, to the cardinal points, and all four are drawn here, around a wall taken right out to the extent the surveys suggest. At the gate strangers are questioned before they may enter, and most who come to debate are turned away — the surest sign of the monastery’s confidence.',
		quote: {
			text: 'The visiting students carry on debates with the resident monks but seven or eight out of ten flee in defeat.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'well',
		kicker: 'inside the south gate',
		title: 'The great well',
		body: 'Just within the gate lies the well of the merchants’ miracle: thirsting traders came to the Buddha, who pointed at the ground; water gushed out when they dug with a cart-axle, and all who drank and heard the Dharma were enlightened.',
		quote: {
			text: 'Inside the south gate of the enclosure is a large well.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'buried-south',
		kicker: 'crop-marks and field-mounds',
		title: 'The city beneath the fields',
		badge: 'Satellite-inferred — not yet excavated (Rajani 2014)',
		body: 'The dug ruins are only the core of Nālandā. South of Monastery 1, satellite images show a vegetation pattern tracing three sides of a rectangle whose edges align with the excavated monastery walls — more courts, still underground — and, in line with the temples, a canopy gap where another temple seems to lie. Walking the fields, the surveyors found three circular mounds, drawn here as the great stupas they may conceal. Everything translucent in this reconstruction is such a guess: read from the ground, not yet touched by the spade.',
		quote: {
			text: 'This suggests that there may be additional similarly shaped structures south of Monastery 1.',
			cite: 'M. B. Rajani, ‘A satellite’s view of Nalanda’s past’ (2014)'
		},
		photo: {
			src: 'nalanda/rajani-2016-satellite.jpg',
			alt: 'Satellite view of the Nalanda environs with the excavated remains and surrounding mounds, tanks and villages',
			credit: 'M. B. Rajani, Archives of Asian Art 66 (2016)',
			label: 'The site from orbit'
		}
	},
	{
		id: 'six-kings',
		kicker: 'five generations of builders',
		title: 'The six kings',
		body: 'Nālandā was not built once but six times. Śakrāditya raised the first monastery; his son Buddhagupta built to the south; Tathāgatagupta to the east; Bālāditya to the north-east; his son Vajra to the west; and a king of Central India added the last, then walled everything into a single establishment. In Śakrāditya’s own court, forty monks still dine daily in honour of the founders. Ahead rises the great Temple 3 with Monasteries 18 and 1A pressed against its side — the oldest corner of the excavated city.',
		quote: {
			text: 'Later, a king of Central India built another great monastery to the north and constructed a lofty enclosure with one gate for all the monasteries.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'cells',
		kicker: 'nine cells to a row',
		title: 'Inside a court',
		body: 'The walk begins here, in Monastery 1, where the path of the pilgrims’ days threaded court after court. Yijing, who lived ten years in ranges like these, describes them exactly: “the three-storeyed building had brickpaved rooms”, nine cells to a side around a square courtyard, each cell over a hundred square feet, with high single-leaf doors deliberately left unscreened. Every monastery followed the same plan and rose to the same three storeys, so alike that to see one was to see them all.',
		quote: {
			text: 'The monks would rather inspect each other than to allow any privacy among them.',
			cite: 'Yijing, Kao Seng Chuan, chüan 1'
		},
		photo: {
			src: 'nalanda/inside-a-court.jpg',
			alt: 'Inside an excavated monastery court at Nalanda: cell doorways around the open courtyard',
			credit: 'site collection'
		}
	},
	{
		id: 'daily-life',
		kicker: '≈3,500 monks · 201 villages',
		title: 'A day at Nālandā',
		body: 'The day ran on water: a clepsydra — a perforated bowl sinking in a basin — sounded the hours, and the night was divided into three watches, the first and last for meditation and chanting. Nothing was decided without the consent of every resident monk; to spend even a husk of rice unexplained meant expulsion. Yijing counted about three and a half thousand monks, supported by the revenue of 201 villages.',
		quote: {
			text: 'About three thousand five hundred monks were living in the Nālandā monastery. This establishment was in possession of 201 villages.',
			cite: 'Yijing, Kao Seng Chuan, chüan 1'
		}
	},
	{
		id: 'precentor',
		kicker: 'eight halls · three hundred apartments',
		title: 'The precentor’s round',
		body: 'The monastery was too vast to gather for worship in one place — eight great halls and three hundred apartments, Yijing counted. So the ritual came to the monks instead: each day a precentor walked the whole establishment hall by hall, chanting hymns of praise, led by lay servants and children bearing incense and flowers, pausing at each in turn until the round was done.',
		quote: {
			text: 'it is customary to send out, every day, one precentor to go round from place to place chanting hymns, being preceded by monastic lay servants and children carrying with them incense and flowers.',
			cite: 'Yijing, A Record of the Buddhist Religion (tr. Takakusu)'
		}
	},
	{
		id: 'traces',
		kicker: 'the sacred traces',
		title: 'Stupas, relics and the willow tree',
		body: 'Around the courts the sacred traces are “counted by the hundreds”. A stupa keeps hair and nail relics of the Buddha, clipped over three months — the sick circle it to be cured. Nearby stands an extraordinary tree, eight or nine feet high, grown from a willow twig the Buddha chewed to clean his teeth and cast to the ground: its two branches never increase nor decrease. Yijing, seeing the same tree, doubted the story’s botany — the Buddha’s tooth-wood tree, he wrote, “is not the willow”. To the south rises Śīlāditya’s Brass Temple, abandoned half-built.',
		quote: {
			text: 'To the south is Brass Temple, constructed by King Śīlāditya, though the work is unfinished.',
			cite: 'Xuanzang, Record, Fascicle IX'
		},
		photo: {
			src: 'nalanda/temple3-shrine.jpg',
			alt: 'A smaller shrine beside Temple 3 at Nalanda, among the votive stupas',
			credit: 'G41rn8, CC BY-SA 4.0, via Wikimedia Commons'
		}
	},
	{
		id: 'bathing',
		kicker: 'more than ten great pools',
		title: 'The bathing bell',
		body: 'Outside the walls the tanks did double duty. Yijing, who bathed here for ten years, counted more than ten great pools around the monastery and a bell — a ghanti — rung every morning to call the monks to wash; they went out in their hundreds, sometimes a thousand at once, each carrying his own bathing-cloth, then returned to the day’s study. The same squared pools, ringing the site on the cardinal points, are the ones the surveys still trace from the air.',
		quote: {
			text: 'There are more than ten great pools near the Nālandā monastery, and there every morning a ghanti is sounded to remind the priests of the bathing-hour.',
			cite: 'Yijing, A Record of the Buddhist Religion (tr. Takakusu)'
		}
	},
	{
		id: 'sparrow',
		kicker: 'outside the west wall',
		title: 'The heretic and the bird',
		body: 'Beside that tank, just outside the west wall, stands a stupa both pilgrims stopped at. Here, they were told, a man came to the Buddha with a small bird held in his hand and asked him about life and death — a trap, whether the Buddha would say the bird would live or die. Xuanzang set the spot down in the 630s; Yijing, a generation later, found the same caitya still standing, “more than ten feet high”, on the very ground Xuanzang had described.',
		quote: {
			text: 'The stupa beside the tank at the outside of the west wall of the enclosure was the place where a heretic, holding a small bird in his hand, asked the Buddha about the problem of life and death.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'world-monarch',
		kicker: 'a hundred paces south',
		title: 'The monk who chose a crown',
		body: 'A small stupa south of the temple marked a quieter kind of failure. Here, the story went, a monk of rare merit once knelt before the Buddha — and wished not for awakening but to be a cakravartin, a wheel-turning king of the world. The Buddha called him pitiful: so near to buddhahood, and turning instead toward a crown and its long chain of worldly rebirths.',
		quote: {
			text: 'This bhikṣu is very pitiful. He is a man of great bliss and deep virtue with a mind of firm faith, and he would have realized buddhahood very soon if he had aimed at [that goal].',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'copper-buddha',
		kicker: 'outside the east wall',
		title: 'The copper colossus',
		body: 'Past Temple 2 and its twin by the Sarai mound, two hundred paces beyond the enclosure stands King Pūrṇavarman’s standing Buddha of copper, sheltered by its own pavilion of six storeys. Further north, a brick temple of Tārā Bodhisattva draws kings and ministers with incense and music every New Year.',
		quote: {
			text: 'Further to the east, more than two hundred paces outside the enclosure, is a copper image of the Buddha in the standing posture, over eighty feet tall and sheltered by a pavilion as high as six stories.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'scholars',
		kicker: 'Śīlabhadra · Dharmapāla · Sthiramati',
		title: 'The scholars',
		body: 'This was the reason to come: several thousand monks, “all of whom are brilliant scholars of high learning”. Xuanzang names its luminaries — Dharmapāla and Candragupta, Guṇamati and Sthiramati, Prabhāmitra, Viśeṣamitra, Jñānacandra, and Śīlabhadra, “of sublime virtue and profound insight”, the centenarian master under whom Xuanzang himself studied for five years. Yijing arrived a generation later and stayed ten, gathering texts that by his own count amounted to more than 500,000 ślokas. One study defeated even him: he went regularly to Nālandā’s altar to master the esoteric Vidyādhara-piṭaka, the great collection of mantras (the strand of practice later gathered under the name Vajrayāna), and by his own account “worked quite hard but could not attain full success.”',
		quote: {
			text: 'There are several thousand monks, all of whom are brilliant scholars of high learning',
			cite: 'Xuanzang, Record, Fascicle IX'
		},
		photo: {
			src: 'nalanda/towers.jpg',
			alt: 'Brick towers and shrines among the excavated remains of Nalanda',
			credit: 'Oo91, CC BY-SA 4.0, via Wikimedia Commons'
		}
	},
	{
		id: 'seniority',
		kicker: 'two monks “from China”',
		title: 'The rule of seniority',
		body: 'When Bālāditya finished his monastery to the north-east he held a feast, and monks came from across India. Two arrived late and were led up to the third storey; asked where they were from, they answered that they came from China, having stayed to feed their sick teacher — then vanished before the king could reach them. Knowing he had entertained saints, Bālāditya deepened in faith and at last gave up his throne to become a monk, ranked lowest of all in his own foundation. From his discontent Nālandā took a custom found nowhere else: that those not yet fully ordained could reckon seniority by age.',
		quote: {
			text: 'We come from China. Because our teacher is ill we served him his meal before we started the journey.',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'baladitya-temple',
		kicker: 'over three hundred feet',
		title: 'Bālāditya’s great temple',
		badge: 'Location conjectural — temple crop-marks north of Temple 14 (Rajani 2014)',
		body: 'Xuanzang saw a temple here that dwarfed everything now standing — over three hundred feet, raised by the king who later renounced his throne to become the lowest-ranked monk in his own foundation. No excavated ruin comes near that scale, so the great temple is drawn translucent among the satellite finds: north of Temple 14 the surveys read two more buried temples on the same axis, spaced exactly like Temples 12 to 14, and the larger is given here to Bālāditya — with the nearer, smaller one standing in for the temple of Avalokiteśvara that Xuanzang places just south of it. North again, a robbed brick mound at Baragaon was read as one more chaitya, drawn as a great stupa.',
		quote: {
			text: 'To the north of the temple of Avalokiteśvara Bodhisattva is a great temple, more than three hundred feet high, built by King Bālāditya. Its size and ornamentation and the Buddha’s image within are similar to those of the great temple at the bodhi tree.',
			cite: 'Xuanzang, Record, Fascicle IX'
		},
		photo: {
			src: 'nalanda/rajani-2016-multispectral.jpg',
			alt: 'Multispectral satellite imagery showing crop-marks of buried temples north of the excavated site',
			credit: 'M. B. Rajani, Archives of Asian Art 66 (2016)',
			label: 'The crop-marks in multispectral imagery'
		}
	},
	{
		id: 'tanks',
		kicker: 'Dighi · Pansokar · Indra · Suraj',
		title: 'The tanks that built the bricks',
		body: 'A ring of great rectangular tanks bounds the whole site, their sides squared to the cardinal points. Tradition holds they were not dug as reservoirs at all: they are the holes the monastery came out of — the earth lifted from them was fired into the millions of bricks that became its courts and towers (Rajani 2014). Water was always part of the place’s own story: Xuanzang heard that the very name Nālandā came from a pond in the mango grove, and the dragon who lived in it.',
		quote: {
			text: 'in the mango grove to the south of the monastery there was a pond where a dragon named Nālandā lived, hence the name of the monastery built beside the pond',
			cite: 'Xuanzang, Record, Fascicle IX'
		}
	},
	{
		id: 'library',
		kicker: 'what later tradition adds',
		title: 'The nine-storeyed library',
		badge: 'Later Tibetan tradition — not in the pilgrims’ records',
		body: 'Tibetan historians writing centuries later tell of a library precinct called Dharmagañja with three great buildings — Ratnasāgara, Ratnodadhi and Ratnarañjaka — Ratnodadhi rising nine storeys and housing the rarest texts. Neither Xuanzang nor Yijing, who together spent fifteen years here, mentions any of it, and no record places it on the ground. The three halls are drawn here only in outline — Ratnodadhi’s nine storeys between its two sisters — in the northern mound cluster between the buried temples and the Begumpur quadrangle: undug ground where, if they stood at all, they may yet wait.',
	},
	{
		id: 'begumpur',
		kicker: '~450 × 400 m · four-pointed',
		title: 'The Begumpur quadrangle',
		badge: 'Satellite-inferred — not yet excavated (Rajani 2014)',
		body: 'The walk ends at the strangest of the satellite’s finds: under the village of Begumpur, at the far north, the ground rises four or five metres into an enormous four-pointed shape. A trench dug by a villager exposed brick at exactly its north-east corner. It is drawn here in the manner of Somāpura — a vast square of monks’ quarters around a cruciform temple — for that is the family the surveyors place it in: either Nālandā’s own last great extension, or a sister foundation of the Pāla age standing at its edge.',
		quote: {
			text: 'The massive structure one suspects lies hidden beneath the northern mound is comparable in size and shape to the Vihara quadrangles of Vikramasila (in Bihar) and Somapura (in Bangladesh).',
			cite: 'M. B. Rajani, ‘A satellite’s view of Nalanda’s past’ (2014)'
		}
	},
	{
		id: 'drawn-plan',
		kicker: '“so Rājagṛha would be in China”',
		title: 'Yijing draws the plan',
		body: 'Before he sailed home, Yijing drew a plan of Nālandā — its courts, halls and towers set down in short — to send back to China, hoping the throne might one day raise a copy of it, so that Rājagṛha itself would stand in the east. His drawing is lost. What you have just walked is the same wish attempted again: Nālandā rebuilt from the pilgrims’ own measurements and words, set down where it can be seen once more.',
		quote: {
			text: 'If he appeals to the Emperor, requesting him to construct a monastery according to this plan, then Rajagṛha would be in China without much difference.',
			cite: 'Yijing, Kao Seng Chuan (tr. Lahiri)'
		}
	},
	{
		id: 'legacy',
		kicker: '399 — 695 — today',
		title: 'What remains',
		body: 'Faxian passed a village; Xuanzang found a university; Yijing timed his days by its water-clock. The excavated courts at Bargaon still follow the plan the pilgrims walked — yet the surveys suggest they are only a fraction of a city of courts and towers running over a mile from south to north, the rest still asleep under fields, tanks and villages. Monasteries from Tibet to Bhutan still build to Nālandā’s pattern of court, cell and temple. The pilgrims’ pages remain the closest thing we have to standing inside it.',
		quote: {
			text: 'lived in the Nālanda Vihāra for ten years',
			cite: 'Yijing, Record (tr. Takakusu)'
		},
		photo: {
			src: 'nalanda/temple3-sw.jpg',
			alt: 'Temple 3 at Nalanda from the south-west, its stepped brick mass rising over the stupa field',
			credit: 'site collection'
		}
	}
];
