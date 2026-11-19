/**
 * LO-FI PLAYLIST CONFIG — swap the music in one place.
 *
 * Two kinds of tracks are supported:
 *
 * 1. 'generated' — instrumental lo-fi hip hop synthesized in the browser
 *    (self-generated audio: no licensing, no attribution, no downloads,
 *    never audibly loops). Four characters are built in:
 *      'midnight' — dusty Rhodes, soft rim, laid back
 *      'rainfall' — mellow piano-ish keys, brushed feel, extra crackle
 *      'study'    — brighter tape keys, swung hats
 *      'tape'     — deep bass, half-time rim, warmest filter
 *
 * 2. 'file' — a real royalty-free audio file (Pixabay Music, Free Music
 *    Archive, etc.), streamed via an HTML <audio> element routed through
 *    Web Audio (MediaElementSource) so filters/gain still apply.
 *    Drop one in like this:
 *
 *      {
 *        kind: 'file',
 *        url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_xxxx.mp3',
 *        title: 'Late Night Tape',
 *        artist: 'Some Artist',
 *        license: 'Pixabay Content License',
 *        credit: 'Music: Some Artist — Late Night Tape (Pixabay)',
 *      },
 *
 * Whatever is in PLAYLIST below is what the mini player shuffles through
 * with 4–6 s crossfades. Attribution for file tracks is required in the
 * footer credits — the footer renders it from `musicCredit()` automatically.
 */

export type GeneratedPreset = 'midnight' | 'rainfall' | 'study' | 'tape'

export type PlaylistTrack =
  | {
      kind: 'generated'
      preset: GeneratedPreset
      title: string
      artist: string
    }
  | {
      kind: 'file'
      url: string
      title: string
      artist: string
      license: string
      credit: string
    }

export const PLAYLIST: PlaylistTrack[] = [
  {
    kind: 'generated',
    preset: 'midnight',
    title: 'Late Night Commits',
    artist: 'In-browser synth',
  },
  {
    kind: 'generated',
    preset: 'rainfall',
    title: 'Rainfall Tape',
    artist: 'In-browser synth',
  },
  {
    kind: 'generated',
    preset: 'study',
    title: '640K Memories',
    artist: 'In-browser synth',
  },
  {
    kind: 'generated',
    preset: 'tape',
    title: 'Disk 0 Dreams',
    artist: 'In-browser synth',
  },
]

/** Footer credit line for whatever the playlist contains. */
export function musicCredit(): string {
  const fileTracks = PLAYLIST.filter((t) => t.kind === 'file')
  if (fileTracks.length === 0) {
    return 'MUSIC: GENERATED IN-BROWSER // NO ATTRIBUTION REQUIRED'
  }
  return 'MUSIC: ' + fileTracks.map((t) => (t as { credit: string }).credit).join(' // ')
}
