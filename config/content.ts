// ─────────────────────────────────────────────────────────────
//  Content config — the only file you need to edit to add tracks
//
//  1. Upload your audio files and images/videos to R2
//  2. Set R2 below to your bucket's public URL
//  3. Add categories and tracks
//  4. Save — the player picks it up automatically
// ─────────────────────────────────────────────────────────────

const R2 = 'https://pub-f41beccd0d7d4160947b60e1d23f53c0.r2.dev';
const proxy = (file: string) =>
  `/api/proxy?url=${encodeURIComponent(`${R2}/${file}`)}`;

const audioMime = (f: string): string =>
  f.endsWith('.mp3')  ? 'audio/mpeg' :
  f.endsWith('.wav')  ? 'audio/wav'  :
  f.endsWith('.m4a')  ? 'audio/mp4'  :
  f.endsWith('.aac')  ? 'audio/aac'  :
  'audio/mpeg';
const isVideoFile = (f: string) => /\.(mp4|webm|mov)/i.test(f);

export type Track = {
  title: string;
  duration?: string;   // optional display duration e.g. '22:00'
  src: string;
  audioType: string;
  thumbnail: string;   // static jpg shown in artwork panel
  visual: string;      // looping video (or same jpg) for background
  isVideo: boolean;
};

export type Category = {
  name: string;
  description?: string; // shown in the left sidebar panel on desktop
  tracks: Track[];
};

function makeTrack(
  title: string,
  audioFile: string,
  thumbFile: string,    // jpg shown in artwork panel
  visualFile?: string,  // optional looping video for background (defaults to thumbFile)
  duration?: string
): Track {
  const vis = visualFile ?? thumbFile;
  return {
    title,
    duration,
    src:       proxy(audioFile),
    audioType: audioMime(audioFile),
    thumbnail: proxy(thumbFile),
    visual:    proxy(vis),
    isVideo:   isVideoFile(vis),
  };
}

// ─────────────────────────────────────────────────────────────
//  Categories — add/remove/reorder freely
//
//  Each category has:
//    name        — displayed as the section heading
//    description — optional text in the left panel (desktop)
//    tracks      — list of makeTrack() calls
//
//  makeTrack(title, audioFile, visualFile, optionalDuration)
// ─────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    name: 'Relaxation',
    description: `Deep relaxation sessions designed to ease tension and bring the nervous system into a state of calm. Ideal for unwinding after a long day or preparing for sleep.`,
    tracks: [
      makeTrack('Winds of Change', 'winds-of-change/winds-of-change.m4a', 'winds-of-change/winds-of-change-thumb.jpg', 'winds-of-change/winds-of-change-loop.mp4', '7:54'),
      makeTrack('Sleepy Stream', 'sleepy-stream/sleepy-stream.m4a', 'sleepy-stream/sleepy-stream-thumb.jpg', 'sleepy-stream/sleepy-stream-loop.mp4', '8:32'),
      makeTrack('Daytime Dream', 'daytime-dream/daytime-dream.m4a', 'daytime-dream/daytime-dream-thumb.jpg', 'daytime-dream/daytime-dream-loop.mp4', '5:23'),
      // makeTrack('Session Title', 'track-01.mp3', 'cover.jpg', 'loop.mp4', '22:00'),
    ],
  },
  {
    name: 'Grounding',
    description: `Earth-frequency sessions to anchor awareness in the body. These tracks use lower frequencies to promote stability, presence, and physical calm.`,
    tracks: [
      // makeTrack('Session Title', 'track-01.mp3', 'cover.jpg'),
    ],
  },
  {
    name: 'Focus',
    description: `Sustained attention and mental clarity sessions. Tuned to support deep work, creative flow, and alert presence without overstimulation.`,
    tracks: [
      // makeTrack('Session Title', 'track-01.mp3', 'cover.jpg'),
    ],
  },
  {
    name: 'Sleep',
    description: `Slow, deeply restorative frequencies for sleep onset and overnight use. Designed to gently guide brainwave activity toward delta states.`,
    tracks: [
      // makeTrack('Session Title', 'track-01.mp3', 'cover.jpg', undefined, '45:00'),
    ],
  },
  // Add more categories below ↓
  // {
  //   name: 'Category Name',
  //   description: 'Optional description...',
  //   tracks: [
  //     makeTrack('Session Title', 'folder/filename.mp3', 'folder/cover.jpg'),
  //   ],
  // },
];
