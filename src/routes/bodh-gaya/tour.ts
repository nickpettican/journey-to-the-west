/**
 * The stations of the Bodh Gayā scroll tour. All quotations are verbatim from
 * the translations and studies used by this site (typographic ligatures
 * normalised):
 *   X  — Xuanzang, "The Great Tang Dynasty Record of the Western Regions",
 *        tr. Li Rongxi (1996), Fascicle VIII.
 *   F  — Faxian, "A Record of Buddhistic Kingdoms", tr. Legge (1886).
 *   Y  — Yijing, "A Record of the Buddhist Religion", tr. Takakusu (1896).
 *   C  — A. Cunningham, "Mahâbodhi, or the Great Buddhist Temple under the
 *        Bodhi Tree at Buddha-Gayâ" (1892) — the excavated, measured survey.
 * The stations of the seven weeks are Xuanzang's monuments; the week-by-week
 * numbering is later tradition and is badged as such on its cards. Where facts
 * come only from Cunningham's excavation (build date, ruined state) the prose
 * says so; the quoted block always keeps to the pilgrims.
 */
import type { TourStation } from '../nalanda/tour';

export const STATIONS: TourStation[] = [
	{
		id: 'approach',
		kicker: 'c. 637 CE · south-west from Prāgbodhi Mountain',
		title: 'The approach',
		body: 'Xuanzang comes down from Prāgbodhi Mountain and walks the last fourteen or fifteen li to the bodhi tree. Faxian had stood here two centuries earlier; Yijing would follow within a generation, carrying silk for an offering. The whole sacred ground is ringed by a high, strong wall of brick, the enclosure Xuanzang measured at some five hundred paces around, long from east to west and narrow from south to north. It is what holds the precinct apart from the fields: inside it stand the tree, the great stone tower, and the crowd of stupas that kings and nobles of distant countries had raised on the ground where the Buddha awoke. Its gates open east to the river, south to the flower pool and north to a great monastery; the west side, where we stand, has no gate at all — Xuanzang calls it an inaccessible natural barrier, and the mounds still bank against it.',
		quote: {
			text: 'The surrounding walls are built high and strong out of brick; they are long from east to west and narrow from south to north, and are about five hundred paces in circuit.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'river',
		kicker: 'the Nairañjanā',
		title: 'Down to the river',
		badge: 'Sujātā stupa across the water: satellite-inferred — not yet excavated',
		body: 'Passing between the enclosure and the monastery, the path comes out on the sands of the Nairañjanā — the river the Bodhisattva bathed in before he crossed to the tree, and the reason the main gate faces east. On the far bank, surveys read the Sujātā stupa and its neighbours as part of the same great establishment; they are drawn here sand-pale, as inference rather than excavation. Everything the pilgrims used daily is on this side: the ford, the road from Gayā, the gate.',
		quote: {
			text: 'The main gate opens east toward the Nairañjanā River and the southern gate is near a large flower pool. The west side is an inaccessible natural barrier, while the northern gate leads to a big monastery.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'east-gate',
		kicker: 'the main gate of the texts',
		title: 'In by the east gate',
		body: 'The road from the river runs straight at the tower, past an octagonal well and in through the eastern gatehouse. Beside the gate stands the stupa where Māra, having failed to tempt the Bodhisattva, arrayed his demon troops to menace him — with two more nearby built by Indra and Brahmā. Further along, a pair of stupas flank the road where Māra’s daughters volunteered to seduce him and were changed into decrepit old women. A granite toraṇa gateway frames the last approach.',
		quote: {
			text: 'the Bodhisattva remained in the meditation of great compassion and all the weapons turned into lotus flowers.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'great-temple',
		kicker: 'the shrine east of the tree',
		title: 'The Great Temple',
		body: 'The Mahābodhi temple stands east of the tree on a tall base more than twenty paces across: several tiers of niches climb the four faces, each niche holding a gilded image, and the walls between are cut with strings of pearls and figures of spirits, just as Xuanzang describes. On the summit sits a gilt-copper āmalaka fruit — "also said to be a precious bottle or a precious pot", the pot-shaped finial drawn here with its umbrellas. Before the door a storied pavilion was added, its eaves in three layers; on either side of the outer door stood an image cast in silver and more than ten feet high, Avalokiteśvara to the left, Maitreya to the right.',
		quote: {
			text: 'In all the niches arranged in tiers there are golden images, and on the four walls are marvelous carvings in the shapes of strings of pearls or figures of spirits. On top is installed a gilded copper āmalaka fruit.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		},
		photo: {
			src: 'bodhgaya/cunningham-plate-xi.jpg',
			alt: 'Cunningham’s measured plan of the Great Temple, its terrace, railing and Buddha’s Walk',
			credit: 'A. Cunningham, Mahābodhi (1892), Plate XI — public domain',
			label: 'The excavated plan'
		}
	},
	{
		id: 'the-tower',
		kicker: 'the tower, and its long ruin',
		title: 'A hundred and seventy feet of it',
		body: 'Xuanzang gives the height as one hundred and sixty or seventy feet, on a base twenty paces wide, of brick faced with lime. Cunningham, clearing it twelve centuries later, found the very same building: forty-eight feet square, its straight sides tapering in a blunt pyramid (the mark, he argued, of an early date), with a gold impression of a coin of the Kuṣāṇa king Huviṣka among the relics under the throne, which sets its building in the second century CE, on the site of Aśoka’s older small shrine. Inside, a ground-floor sanctum holds the earth-touching image; a stair climbs past an upper chamber to the terrace where the tree stands. He found it a ruin — the great hall roofless, the whole front above the third chamber fallen away in a triangular gap twenty feet high, the west face peeled of brick to a depth of five feet, a pipal root "as thick as a man’s thigh" splitting the buttresses behind. Beglar rebuilt the surface niche for niche between 1880 and 1884, modelling the restored porch and the four corner towers on a small stone model of the temple turned up in the rubble.',
		quote: {
			text: 'To the east of the bodhi tree is a shrine, one hundred and sixty or seventy feet high, built on a base whose front side is more than twenty paces wide. It was built with brick and plastered with lime.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		},
		photo: {
			src: 'bodhgaya/mahabodhi-ruined-1870s.jpg',
			alt: 'The Mahābodhi tower before restoration, drowned in creeper, a village at its foot',
			credit: 'Photographed before Beglar’s restoration, 1870s — public domain',
			label: 'The tower before restoration'
		}
	},
	{
		id: 'image-within',
		kicker: 'the earth-witness',
		title: 'The image within',
		body: 'Inside, in a chamber where lamps burn continually, sits the statue that legend says Maitreya himself made: a brahman shut himself in with scented clay and a lamp, asking that the door stay closed for six months; the monks opened it four days early and found the image finished but for one small spot above the breast. It faces east, right hand touching the earth — the moment the Buddha called the ground itself to witness against Māra. When King Śaśāṅka ordered it destroyed, his minister instead walled it up behind a screen with a lamp inside; the wall came down, and the lamp was still burning.',
		quote: {
			text: 'the left hand was drawn back and the right one pointed downward. It was just as if the figure was alive.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'tree-and-throne',
		kicker: 'the centre of the world',
		title: 'The bodhi tree and the diamond seat',
		badge: 'Week one — the seven-week numbering is later tradition',
		body: 'Behind the temple, against its west wall, is the reason for everything else: the pipal tree, and beneath it the diamond seat on which every buddha of this age attains enlightenment. Xuanzang found the throne already lost under drifted sand, and the tree (cut down by Aśoka before his conversion, by Aśoka’s queen, and lately by King Śaśāṅka) standing behind the stone wall King Pūrṇavarman raised twenty-four feet high after reviving the roots with the milk of a thousand cows. Here the Buddha sat without rising for the first seven days after his awakening. The trunk is yellowish-white, the leaves green in winter and summer alike.',
		quote: {
			text: 'Whenever the earth quakes this spot alone remains stable.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		},
		photo: {
			src: 'bodhgaya/cunningham-plate-ii.jpg',
			alt: 'Cunningham’s restored plan of Aśoka’s temple with the Vajrāsana throne at its centre',
			credit: 'A. Cunningham, Mahābodhi (1892), Plate II — public domain',
			label: 'Aśoka’s temple and the throne'
		}
	},
	{
		id: 'walk',
		kicker: 'eighteen flowers',
		title: 'Buddha’s Walk',
		badge: 'Week three — the seven-week numbering is later tradition',
		body: 'North of the tree runs a low brick terrace where the Buddha paced east and west for seven days, flowers springing up under his footprints. People of later times built the promenade about three feet high to mark the line; Cunningham uncovered it still standing, fifty-three feet long, with a row of Aśoka’s lettered pillar-bases down each side from the canopy it once carried. A record Xuanzang repeats says the walk foretells the measure of a life: it lengthens or shortens according to the span of the one who paces it.',
		quote: {
			text: 'When he had walked over ten paces signs of wondrous flowers followed his footprints at eighteen points.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'gazing-shrine',
		kicker: 'unwinking eyes',
		title: 'The gazing shrine',
		badge: 'Week two — the seven-week numbering is later tradition',
		body: 'On a huge rock north of the promenade stands a shrine holding a Buddha with its eyes raised: the Animeṣalocana, "unwinking eyes". In the week the tradition counts second, the Buddha stood here and simply looked at the tree that had sheltered him — seven days, without blinking, out of gratitude. It is the smallest of the great stations and perhaps the most human; the little tower still stands north-east of the temple today.',
		quote: {
			text: 'Formerly the Tathāgata looked at the bodhi tree from this place for seven days without blinking, gazing at the tree attentively with a feeling of gratitude.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'kasyapa',
		kicker: 'north-west of the tree',
		title: 'Kāśyapa’s shrine and the earth gods',
		body: 'North-west of the tree stands a shrine of Kāśyapa Buddha — the buddha before this one — whose image was famous for emitting light; walk round it seven times, the old record said, and you might learn where you were born in a former life. Beyond it are two small brick chambers, each holding the image of an earth god: one who came up out of the ground to warn the Buddha of Māra’s approach, and one who rose to bear him witness when he touched the earth. People of later times made these images in memory of what the two had done.',
		quote: {
			text: 'In a shrine to the northwest of the bodhi tree there is an image of Kāśyapa Buddha. Well known for its spirituality and sanctity, it often emits a bright light.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'ratnagrha',
		kicker: 'the jewel house',
		title: 'The Ratnagṛha',
		badge: 'Week four — the seven-week numbering is later tradition',
		body: 'Not far west of the tree, a shrine housed a brass image of the Buddha standing and facing east, adorned with rare jewels, with a blue stone of wonderful veins before it. Here, in the week of the jewel house, Brahmā raised a hall of the seven precious substances and Indra a seat to match, and the Buddha sat emitting light that shone upon the bodhi tree. Xuanzang places it west; the spot shown at the complex today is to the north-west — Cunningham trusted the pilgrim, "as he actually visited the place".',
		quote: {
			text: 'This is the place where Brahmā built a hall out of the seven precious substances and Indra made a seat, also with the seven precious substances, at the time when the Tathāgata first attained enlightenment.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'saffron-stupa',
		kicker: 'beyond the west wall',
		title: 'The Saffron Stupa',
		body: 'West of the enclosure stands a stupa plastered in saffron clay, raised by a merchant lord of Jāguḍa who had once despised the buddha-dharma. Driven off course in the South Sea and adrift three years, his ship bore down on what seemed a mountain under two bright suns — until he named it a makara fish, its cliffs the fins, the suns its eyes. The whole company called on Avalokiteśvara with one mind; the mountain sank, and a monk came through the air to bring them home. They built this stupa in thanks. Later, on pilgrimage to the tree, they rounded a corner and found the very stupa they had built at home, carried here.',
		quote: {
			text: 'Not far to the west of the bodhi tree enclosure is a stupa more than forty feet high, known as Saffron Stupa, built by a merchant lord of the country of Jāguḍa.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'grass-cutter',
		kicker: 'the seat of clean grass',
		title: 'Aśoka’s stupa of the grass',
		body: 'South of the tree rises Aśoka’s stupa, more than a hundred feet high, on the spot where the Bodhisattva took his seat. Fresh from bathing in the Nairañjanā and wondering what to sit on, he met a grass-cutter on the road (Indra in disguise) and asked for some of his grass; with that clean grass he made the seat under the tree. North-east of the grass spot a second stupa marks a good omen: bluebirds and a herd of deer that came as the Bodhisattva was about to become a buddha, the luckiest of signs.',
		quote: {
			text: 'Meanwhile Indra transformed himself into a grass cutter, carrying a bundle of grass going on his way. The Bodhisattva said to him, “Can you favor me with some of your grass?”',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'banyan',
		kicker: 'the south-east corner',
		title: 'The banyan of Brahmā’s entreaty',
		badge: 'Week five — the seven-week numbering is later tradition',
		body: 'At the south-east corner of the enclosure grows a banyan — the herdsman’s nyagrodha of the older accounts — with a stupa and a temple of the seated Buddha beside it. Faxian lists it among the places already marked by towers in his day: "where he sat under the nyagrodha tree, on a square rock, with his face to the east, and Brahma-deva came and made his request to him". On this asking, the Buddha rose from the bliss of emancipation and agreed to turn the wheel of the Dharma; without the week under this tree there would be no teaching at all.',
		quote: {
			text: 'Formerly, when the Tathāgata had just attained buddhahood, Mahābrahmā came here and entreated him to turn the wonderful wheel of the Dharma.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'sinking-bodhisattva',
		kicker: 'the south and north limits',
		title: 'The sinking bodhisattva',
		body: 'At the four inner corners of the enclosure stand four great stupas, on the ground that trembled as the Buddha approached the seat and grew still when he reached it. And at the southern and northern limits sit two statues of Avalokiteśvara, facing east, set up by kings after the Buddha’s death from a tradition of how he had described the coming age. The old people gave them as a clock for the Dharma itself: when the two figures sink away and can no longer be seen, the buddha-dharma will end. The southern one, Xuanzang notes, has already gone down as far as the chest.',
		quote: {
			text: 'Some old people said that when the statues of Avalokiteśvara disappear and become invisible the buddha-dharma will come to an end. The statue at the south corner has already sunk down up to the chest.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'scales-of-a-fish',
		kicker: 'stupas past counting',
		title: 'Like the scales of a fish',
		body: 'Pull back, and the courtyard shows what the pilgrims kept insisting on: monuments crowding every open space, each raised by some king or minister or noble of a distant country in memory of the teaching they had received. Between the named stupas lie hundreds more too small and too many to record — Cunningham counted some two hundred votive stupas in the lowest stratum alone, stacked four and five tiers deep, and every clearance turned up more Buddha figures and inscribed slabs. Xuanzang simply gave up trying to list them.',
		quote: {
			text: 'Inside the enclosure are many sacred sites located as closely together as the scales of a fish, and it is difficult to describe them all in full detail.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'milkmaids',
		kicker: 'the south-west corner',
		title: 'The milkmaids’ gruel',
		body: 'Outside the south-west corner a cluster of stupas keeps the memory of the meal that ended the fast. After six years of austerity had brought him no nearer awakening, the Bodhisattva accepted milk gruel from two village women (Sujātā of the tradition) and regained the strength to sit under the tree. One stupa marks their old house, one the place where they cooked the gruel, and one the spot where the Tathāgata received it. It is the small human hinge of the whole story: without the gruel, no seat, no tree, no enlightenment.',
		quote: {
			text: 'At the southwest corner outside the bodhi tree enclosure is a stupa that marks the site of the old house of the two milkmaids who offered milk gruel to the Buddha.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'flower-pool',
		kicker: 'outside the south gate',
		title: 'The flower pool',
		body: 'The south gate opens onto the great tank the texts call the flower pool, dug, the story goes, by the younger of the two brahman brothers whom Maheśvara sent to build the shrine and excavate the pond. Cunningham found it exactly where Xuanzang put it, four hundred feet due south of the temple, its size unchanged, its north bank a niched wall with steps to the water: the tank now called Buddhokar. Beyond it lie Indra’s bathing pool and the great rock brought from the Snow Mountains for drying the Buddha’s washed robes.',
		quote: {
			text: 'Outside the south gate of the bodhi tree enclosure is a big pond more than seven hundred paces in circuit, with clear and lucid water in which dragons and fish dwell.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		},
		photo: {
			src: 'bodhgaya/cunningham-plate-i.jpg',
			alt: 'Cunningham’s map of the country around Mahābodhi: the temple, monastery mound, tanks and the Phalgu river',
			credit: 'A. Cunningham, Mahābodhi (1892), Plate I (east at top) — public domain',
			label: 'The country around Mahābodhi'
		}
	},
	{
		id: 'mucilinda',
		kicker: 'seven coils',
		title: 'Mucilinda’s lake',
		badge: 'Week six — the seven-week numbering is later tradition',
		body: 'East of Indra’s pool, in a wood, lies the pond of the dragon king Mucilinda, its water "clear, dark, and sweet-tasting". When unseasonal storms broke in the sixth week, the nāga rose from this pool and wound his body seven times round the meditating Buddha, spreading his hoods above him as a roof. A small shrine keeps the west bank; the dragon king’s chamber is on the east. The lotus pond shown south of the temple today carries the same story; Cunningham looked for the original towards Urel, the old Uruvilvā.',
		quote: {
			text: 'The dragon king protected the Tathāgata by surrounding him with his body in seven coils, while its many heads reached over him to serve as a canopy.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'austerities',
		kicker: 'the wood towards Urel',
		title: 'The six years’ austerities',
		body: 'In a wood east of Mucilinda’s pool a shrine holds an image of the Buddha in an emaciated state, with a promenade seventy paces long beside it and a pipal tree at each end. This was the place of the six years’ fasting — one grain of sesame and one of rice a day — before he gave it up and took the gruel. Local people still anoint the gaunt image with fragrant oil when they are ill. Nearby is the stupa of Ājñāta-Kauṇḍinya and his four companions, the men King Śuddhodana sent to serve the prince, who fasted alongside him and became, at Sarnath, the first to hear the Dharma.',
		quote: {
			text: 'he practiced asceticism for six years, eating only one grain of sesame and one grain of rice each day, reducing himself to a mere skeleton and becoming so feeble that he had to hold onto the branch of a tree to stand up to take a walk.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'merchants',
		kicker: 'the first almsfood',
		title: 'The merchants’ offering',
		badge: 'Week seven — the seven-week numbering is later tradition',
		body: 'Near the road by the river the stupas mark the end of the forty-nine days: two passing merchants (tradition names them Trapuṣa and Bhallika, the first lay disciples) were told by the god of the wood that the new Buddha sat fasting in the trees, and offered baked barley and honey from their ration bags. The four devarājas came from the four quarters with golden bowls, then silver, crystal, lapis lazuli, agate, coral and pearl; he refused each in turn, and accepted four plain bowls of dark violet stone.',
		quote: {
			text: 'In order to avoid showing partiality the World-honored One accepted all four bowls, which he stacked and pressed together into one bowl. That is why his almsbowl has four rims on the outside.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'sangharama',
		kicker: 'outside the north gate',
		title: 'The Mahābodhi Saṅghārāma',
		badge: 'Moat and outer square: satellite-inferred — not yet excavated',
		body: 'North of the north gate stands the great monastery a king of Siṃhala (Ceylon) built after his cousin, a monk, was turned away from every lodging in India as a frontiersman. Faxian saw "three monasteries, in all of which there are monks residing"; by Xuanzang’s day they had grown into one establishment of six courtyards holding fewer than a thousand monks, students of both the Mahāyāna and the Sthavira school, with a gold-and-silver Buddha and relic stupas shown to the public once a year. Cunningham dug its central block on the mound called Amar Sinh’s Fort (thirty-six squares to the plan, nine-foot walls, sixteen towers on the enclosure), and recent satellite survey reads a still larger walled square with a moat around it, drawn here sand-pale.',
		quote: {
			text: 'The buildings consist of six courtyards and three-storied pavilions, surrounded by walls thirty or forty feet high.',
			cite: 'Xuanzang, Record, Fascicle VIII'
		}
	},
	{
		id: 'legacy',
		kicker: '404 — 637 — 674 — today',
		title: 'What remains',
		body: 'Faxian found the four great topes "handed down without break" since the nirvāṇa; Xuanzang measured the tower; Yijing, arriving with the silk of Shandong believers, cut it into a robe the size of the Tathāgata and laid it on the statue himself. The Great Temple still stands — patched by Burmese missions, buried, dug out, restored — the oldest great temple of the Buddhist world still on its feet, with the descendant of the tree behind it and the throne of polished sandstone in its old place beneath. Of the seven stations, the walk, the pool and the gazing shrine are still shown to pilgrims; the monastery of the Sinhalese kings waits under its mound.',
		quote: {
			text: 'we came to the Mahābodhi Vihāra, and worshipped the image of the real face (of the Buddha).',
			cite: 'Yijing, Record of the Buddhist Religion (tr. Takakusu)'
		}
	}
];
