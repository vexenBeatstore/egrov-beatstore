export type Beat = {
  slug: string;
  title: string;
  producer: string;
  genre: string;
  mood: string;
  bpm: number;
  key: string;
  price: number;
  cover: string;
  mark: string;
  description: string;
};

export const beats: Beat[] = [
  {
    slug: 'after-hours',
    title: 'After Hours',
    producer: 'VEXEN',
    genre: 'Trap',
    mood: 'Nocturnal',
    bpm: 142,
    key: 'F minor',
    price: 29,
    cover: 'linear-gradient(135deg, #4a374e, #211c2b 52%, #14141a)',
    mark: 'V / 01',
    description: 'A shadowy, spacious trap palette built around soft keys and a low, deliberate knock. Example listing for the VEXEN storefront preview.',
  },
  {
    slug: 'glass-city',
    title: 'Glass City',
    producer: 'VEXEN',
    genre: 'R&B',
    mood: 'Reflective',
    bpm: 96,
    key: 'C# minor',
    price: 25,
    cover: 'linear-gradient(135deg, #38485a, #202633 52%, #17171d)',
    mark: 'V / 02',
    description: 'Airy textures, warm low end and a patient pocket for melodic writing. Example listing for the VEXEN storefront preview.',
  },
  {
    slug: 'no-signal',
    title: 'No Signal',
    producer: 'VEXEN',
    genre: 'Drill',
    mood: 'Tense',
    bpm: 140,
    key: 'G minor',
    price: 32,
    cover: 'linear-gradient(135deg, #55403c, #282027 55%, #151419)',
    mark: 'V / 03',
    description: 'Sparse bells and clipped percussion leave room for a direct, focused vocal. Example listing for the VEXEN storefront preview.',
  },
  {
    slug: 'soft-focus',
    title: 'Soft Focus',
    producer: 'VEXEN',
    genre: 'Lo-fi',
    mood: 'Warm',
    bpm: 84,
    key: 'A minor',
    price: 22,
    cover: 'linear-gradient(135deg, #645140, #332b29 50%, #19181c)',
    mark: 'V / 04',
    description: 'Dusty chords and an unhurried swing for intimate verses and late-night demos. Example listing for the VEXEN storefront preview.',
  },
  {
    slug: 'pressure-room',
    title: 'Pressure Room',
    producer: 'VEXEN',
    genre: 'Trap',
    mood: 'Focused',
    bpm: 150,
    key: 'D minor',
    price: 29,
    cover: 'linear-gradient(135deg, #3b4951, #25252e 52%, #17171d)',
    mark: 'V / 05',
    description: 'A tight drum framework and restrained atmosphere designed to keep the vocal in front. Example listing for the VEXEN storefront preview.',
  },
  {
    slug: 'blue-hour',
    title: 'Blue Hour',
    producer: 'VEXEN',
    genre: 'R&B',
    mood: 'Dreamlike',
    bpm: 102,
    key: 'E major',
    price: 25,
    cover: 'linear-gradient(135deg, #3f4b63, #242638 52%, #17171d)',
    mark: 'V / 06',
    description: 'A soft-edged melodic backdrop with room to stretch a hook. Example listing for the VEXEN storefront preview.',
  },
];

export type License = {
  id: string;
  name: string;
  price: number;
  summary: string;
  features: string[];
};

export const licenses: License[] = [
  {
    id: 'basic',
    name: 'Basic lease',
    price: 29,
    summary: 'A starting point for independent releases and demos.',
    features: ['MP3 file delivery (not available in this preview)', 'Non-exclusive example terms', 'Up to 5,000 audio streams (example term)', 'Credit producer as VEXEN'],
  },
  {
    id: 'premium',
    name: 'Premium lease',
    price: 79,
    summary: 'More flexibility for a growing release.',
    features: ['WAV + MP3 file delivery (not available in this preview)', 'Non-exclusive example terms', 'Up to 50,000 audio streams (example term)', 'Credit producer as VEXEN'],
  },
  {
    id: 'unlimited',
    name: 'Unlimited lease',
    price: 149,
    summary: 'Expanded usage for a wider rollout.',
    features: ['Track stems (not available in this preview)', 'Non-exclusive example terms', 'Unlimited audio streams (example term)', 'Credit producer as VEXEN'],
  },
  {
    id: 'exclusive',
    name: 'Exclusive',
    price: 299,
    summary: 'Example exclusive license tier. Final availability and terms must be agreed separately.',
    features: ['Example exclusive terms', 'Availability must be confirmed', 'File delivery is not available in this preview', 'Final terms require a written agreement'],
  },
];
