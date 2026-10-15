// Original 8-bit style sound effects, synthesized in the browser (no audio files needed).
// If a file named victory.mp3 (or ko.mp3) is placed next to index.html, that file plays instead.

let ctx = null;
export function unlockAudio() {
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return true;
  } catch { return false; }
}
export const audioReady = () => !!ctx && ctx.state === "running";

const NOTE = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI note → Hz
function tone(midi, start, dur, { type = "square", vol = 0.12, slideTo = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(NOTE(midi), start);
  if (slideTo != null) o.frequency.exponentialRampToValueAtTime(NOTE(slideTo), start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
  g.gain.setValueAtTime(vol, start + Math.max(0.02, dur - 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(start); o.stop(start + dur + 0.02);
}

async function tryFile(name) {
  try {
    const a = new Audio(name);
    await a.play();
    return true;
  } catch { return false; }
}

// An original, upbeat chiptune fanfare (about 3 seconds)
export async function playVictory() {
  if (await tryFile("victory.mp3")) return;
  if (!unlockAudio()) return;
  const t = ctx.currentTime + 0.05, s = 0.11; // one step = 110 ms
  // lead: rising arpeggio, a held high note, then a bouncing tag and a final chord
  const lead = [[67, 0, 1], [72, 1, 1], [76, 2, 1], [79, 3, 3], [76, 6, 1], [79, 7, 4],
    [81, 12, 1], [79, 13, 1], [77, 14, 1], [76, 15, 1], [74, 16, 2], [76, 18, 2], [84, 20, 8]];
  lead.forEach(([n, at, len]) => tone(n, t + at * s, len * s, { type: "square", vol: 0.1 }));
  // harmony a sixth below on the long notes
  [[72, 3, 3], [72, 7, 4], [67, 16, 2], [72, 20, 8]].forEach(([n, at, len]) => tone(n, t + at * s, len * s, { type: "square", vol: 0.05 }));
  // bass
  [[48, 0, 3], [48, 3, 3], [53, 6, 6], [55, 12, 4], [55, 16, 4], [48, 20, 8]].forEach(([n, at, len]) => tone(n, t + at * s, len * s, { type: "triangle", vol: 0.18 }));
}

// A descending "you're out" buzz
export async function playKO() {
  if (await tryFile("ko.mp3")) return;
  if (!unlockAudio()) return;
  const t = ctx.currentTime + 0.05;
  tone(64, t, 0.18, { type: "square", vol: 0.12 });
  tone(60, t + 0.2, 0.18, { type: "square", vol: 0.12 });
  tone(55, t + 0.4, 0.7, { type: "sawtooth", vol: 0.1, slideTo: 40 });
  tone(31, t + 0.4, 0.7, { type: "triangle", vol: 0.2, slideTo: 24 });
}

// Short two-note chime for "it's your turn"
export function playTurnChime() {
  if (!unlockAudio() || !ctx) return;
  const t = ctx.currentTime + 0.02;
  tone(76, t, 0.16, { type: "triangle", vol: 0.14 });
  tone(83, t + 0.17, 0.28, { type: "triangle", vol: 0.14 });
}
