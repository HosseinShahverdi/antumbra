import type { ImageSlug } from "./images.generated";

export type Family = "Rings" | "Crowns" | "Discs" | "Veils";

export type Product = {
  id: string;
  index: string;
  name: string;
  family: Family;
  price: number;
  remaining: number;
  image: ImageSlug;
  alt: string;
  line: string;
  description: string;
  materials: string[];
  weight: string;
  hours: number;
};

export const EDITION = 9;

export const PRODUCTS: Product[] = [
  {
    id: "annulus",
    index: "01",
    name: "Annulus",
    family: "Rings",
    price: 1480,
    remaining: 4,
    image: "annulus",
    alt: "Profile of a shaved-head model wearing a single thin black ring halo tilted around the head.",
    line: "A single ring, tilted eleven degrees off the horizon.",
    description:
      "One ring of blackened brass, 0.8 mm thin, held at the nape by a single rod. It is the first thing we teach every new hand at the bench, and the last thing we would ever stop making.",
    materials: ["Blackened brass, 0.8 mm", "Hand-bent nape rod", "Calf-lined comb"],
    weight: "96 g",
    hours: 38,
  },
  {
    id: "corona",
    index: "02",
    name: "Corona",
    family: "Crowns",
    price: 2950,
    remaining: 2,
    image: "corona",
    alt: "Model with a sleek bun wearing a crown of hundreds of fine black filaments radiating from behind the head.",
    line: "214 filaments, each one filed by hand.",
    description:
      "Two hundred and fourteen filaments radiate from an obsidian-lacquered disc. Each is cut, filed and blackened separately, then set by eye — no two Coronas throw the same shadow.",
    materials: ["Blackened brass filaments, 0.6 mm", "Obsidian lacquer disc, 11 coats", "Vegetable-tanned calf band"],
    weight: "312 g",
    hours: 146,
  },
  {
    id: "bailys-beads",
    index: "03",
    name: "Baily’s Beads",
    family: "Crowns",
    price: 1920,
    remaining: 5,
    image: "bailys-beads",
    alt: "Model with closed eyes and dark lips wearing an arc of graduated black and silver beads over the crown.",
    line: "The last light, breaking through the valleys of the moon.",
    description:
      "Thirty-one polished beads, graduated from 3 to 9 mm, strung over the crown from temple to temple — each one catching a single point of light, the way the sun does in the seconds before totality.",
    materials: ["Polished haematite and silver beads", "Braided steel core", "Silk-wrapped temple clips"],
    weight: "74 g",
    hours: 52,
  },
  {
    id: "diamond-ring",
    index: "04",
    name: "Diamond Ring",
    family: "Rings",
    price: 1260,
    remaining: 6,
    image: "diamond-ring",
    alt: "Model looking down wearing a thin black band across the forehead holding one bright crystal.",
    line: "One flash of light, set at the brow.",
    description:
      "A matte band carries a single cut crystal at the centre of the brow — the flare that appears a breath before the light goes out, kept for as long as you wear it.",
    materials: ["Matte black grosgrain over brass", "Hand-set cut crystal", "Elastic silk nape"],
    weight: "58 g",
    hours: 24,
  },
  {
    id: "penumbra",
    index: "05",
    name: "Penumbra",
    family: "Veils",
    price: 1640,
    remaining: 3,
    image: "penumbra",
    alt: "Model in a black coat under a flat black halo brim with a sheer veil fading over the eyes.",
    line: "Nine dye passes, from opaque to air.",
    description:
      "A flat halo brim with a tulle veil dyed in nine passes, so it falls from full black at the crown to nothing at the chin. The eyes stay in half-shadow; the mouth is left to speak.",
    materials: ["Lacquered sinamay brim", "Hand-graded silk tulle", "Hidden comb fastening"],
    weight: "120 g",
    hours: 61,
  },
  {
    id: "umbra",
    index: "06",
    name: "Umbra",
    family: "Discs",
    price: 980,
    remaining: 7,
    image: "umbra",
    alt: "Model with center-parted black hair, a small black disc suspended on a wire covering one eye.",
    line: "It hides one eye and nothing else.",
    description:
      "A 38 mm occulting disc on a hand-bent wire. It throws a perfect round shadow across the cheek and leaves the other eye to do all of the looking.",
    materials: ["Obsidian lacquer disc, 38 mm", "Hand-bent spring-steel wire", "Fine brass headband"],
    weight: "31 g",
    hours: 18,
  },
  {
    id: "second-contact",
    index: "07",
    name: "Second Contact",
    family: "Crowns",
    price: 2180,
    remaining: 1,
    image: "second-contact",
    alt: "Profile of a model wearing a thick black crescent-shaped headpiece curving over the skull.",
    line: "Cast in one piece. Shaped like the moment the sun is lost.",
    description:
      "A crescent cast in a single pour, cupping the skull the way the moon cups the sun at second contact. The outer edge is hand-polished so a single sliver of light travels along it as you turn.",
    materials: ["Lost-wax cast brass, blackened", "Hand-polished outer edge", "Moulded calf inner shell"],
    weight: "268 g",
    hours: 92,
  },
  {
    id: "chromosphere",
    index: "08",
    name: "Chromosphere",
    family: "Discs",
    price: 2400,
    remaining: 2,
    image: "chromosphere",
    alt: "Model framed by an enormous pleated black organza disc, like a dark sun around the face.",
    line: "Six metres of organza, pleated into a dark sun.",
    description:
      "Six metres of black silk organza, knife-pleated by hand into a 640 mm disc that frames the face entirely. It weighs almost nothing and changes the room completely.",
    materials: ["Silk organza, knife-pleated", "Steel-wire armature", "Organza-bound collar fastening"],
    weight: "140 g",
    hours: 110,
  },
];

export const FAMILIES: ("All" | Family)[] = ["All", "Rings", "Crowns", "Discs", "Veils"];

export const SIZES = [
  { id: "s", label: "54 cm" },
  { id: "m", label: "56 cm" },
  { id: "l", label: "58 cm" },
] as const;

export const FINISHES = [
  { id: "blackened", label: "Blackened brass", swatch: "#1b1b1c" },
  { id: "obsidian", label: "Obsidian lacquer", swatch: "#050505" },
  { id: "bone", label: "Bone patina", swatch: "#d9d3c7" },
] as const;

export type CampaignFrame = {
  numeral: string;
  title: string;
  time: string;
  caption: string;
  image: ImageSlug;
  alt: string;
  origin: string;
};

export const CAMPAIGN: CampaignFrame[] = [
  {
    numeral: "I",
    title: "First contact",
    time: "21:04:11",
    caption: "The edge of the moon touches the sun. Nobody in the hall has noticed yet.",
    image: "contact-hall",
    alt: "A lone figure in a long black coat and ring halo stands in a vast dark concrete hall beside a shaft of light.",
    origin: "30% 70%",
  },
  {
    numeral: "II",
    title: "Second contact",
    time: "22:17:40",
    caption: "The crown is lowered. The last of the light becomes something you wear.",
    image: "contact-hands",
    alt: "Gloved hands lower a crown of fine black filaments onto a model whose eyes are closed.",
    origin: "40% 35%",
  },
  {
    numeral: "◯",
    title: "Totality",
    time: "22:19:52",
    caption: "For four minutes the room has no shadows, because everything in it is one.",
    image: "totality",
    alt: "A silhouetted figure stands before a huge glowing disc, the black headpiece aligned at its centre like an eclipse.",
    origin: "50% 36%",
  },
  {
    numeral: "III",
    title: "Third contact",
    time: "22:24:03",
    caption: "We let them leave before the light returns. That is the whole point.",
    image: "contact-corridor",
    alt: "A figure in a long black gown walks down a dark stone corridor towards a doorway of light.",
    origin: "50% 30%",
  },
];

export type AnatomyPoint = {
  x: number;
  y: number;
  title: string;
  body: string;
};

export const ANATOMY: AnatomyPoint[] = [
  { x: 31, y: 21, title: "214 filaments", body: "Blackened brass, 0.6 mm. Cut, filed and set one at a time, by eye." },
  { x: 70, y: 54, title: "Occulting disc", body: "280 mm across. Obsidian lacquer, eleven coats, each hand-rubbed flat." },
  { x: 52, y: 38, title: "Inner band", body: "Vegetable-tanned calf, moulded on a cast of one head — yours." },
  { x: 59, y: 49, title: "Nine rivets", body: "One for each owner of the edition. The tenth hole is never drilled." },
  { x: 44, y: 62, title: "312 g", body: "Balanced over the crown, never the brow. Worn for a night without noticing." },
];

export const LEDGER = [
  {
    value: 9,
    pad: 2,
    title: "Editions per piece",
    body: "The mould is broken in front of the ninth owner. There is no tenth, no restock, no waitlist that turns into one.",
  },
  {
    value: 146,
    pad: 3,
    title: "Hours at the bench",
    body: "For a single Corona. Filaments are filed by hand because a machine makes them identical, and identical throws a dull shadow.",
  },
  {
    value: 0,
    pad: 2,
    title: "Seasons",
    body: "We release a piece when it is finished, not when a calendar asks. Some years that is three pieces. Some years it is one.",
  },
  {
    value: 1,
    pad: 2,
    title: "Fitting, always",
    body: "Every crown is fitted in person or over video before it leaves the atelier. Nothing we make is shipped blind.",
  },
];

export const NAV_LINKS = [
  { href: "#collection", label: "Collection", n: "02" },
  { href: "#anatomy", label: "Anatomy", n: "03" },
  { href: "#instrument", label: "Instrument", n: "05" },
  { href: "#night", label: "Night Nº 07", n: "06" },
  { href: "#fittings", label: "Fittings", n: "07" },
] as const;

/** Next total solar eclipse visible from the Iberian Peninsula: 2 August 2027. */
export const NEXT_TOTALITY = new Date("2027-08-02T08:45:00Z");

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
