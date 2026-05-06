// ─────────────────────────────────────────────────────────────
//  Content config — the only file you need to edit to add tracks
//
//  1. Upload your audio files and images/videos to R2
//  2. Set R2 below to your bucket's public URL
//  3. Add categories and tracks
//  4. Save — the player picks it up automatically
// ─────────────────────────────────────────────────────────────

const R2 = 'https://your-bucket.r2.dev'; // ← replace with your R2 public URL
const proxy = (file: string) =>
  `/api/proxy?url=${encodeURIComponent(`${R2}/${file}`)}`;

const audioMime = (f: string): string =>
  f.endsWith('.mp3') ? 'audio/mpeg' : f.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';
const isVideoFile = (f: string) => /\.(mp4|webm|mov)/i.test(f);

export type Track = {
  title: string;
  duration?: string;   // optional display duration e.g. '22:00'
  src: string;
  audioType: string;
  visual: string;
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
  visualFile: string,
  duration?: string
): Track {
  return {
    title,
    duration,
    src:       proxy(audioFile),
    audioType: audioMime(audioFile),
    visual:    proxy(visualFile),
    isVideo:   isVideoFile(visualFile),
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
      // makeTrack('Session Title', 'relaxation/track-01.mp3', 'relaxation/cover.jpg', '22:00'),
    ],
  },
  {
    name: 'Grounding',
    description: `Earth-frequency sessions to anchor awareness in the body. These tracks use lower frequencies to promote stability, presence, and physical calm.`,
    tracks: [
      // makeTrack('Session Title', 'grounding/track-01.mp3', 'grounding/cover.jpg'),
    ],
  },
  {
    name: 'Focus',
    description: `Sustained attention and mental clarity sessions. Tuned to support deep work, creative flow, and alert presence without overstimulation.`,
    tracks: [
      // makeTrack('Session Title', 'focus/track-01.mp3', 'focus/cover.jpg'),
    ],
  },
  {
    name: 'Sleep',
    description: `Slow, deeply restorative frequencies for sleep onset and overnight use. Designed to gently guide brainwave activity toward delta states.`,
    tracks: [
      // makeTrack('Session Title', 'sleep/track-01.mp3', 'sleep/cover.jpg', '45:00'),
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
