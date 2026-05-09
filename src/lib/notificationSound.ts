// Reliable notification "ping" using WebAudio — no base64, no decoding races.
let _ctx: AudioContext | null = null;
let _unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!_ctx) _ctx = new AC();
  return _ctx;
}

/** Play a soft two-tone ding. Safe to call from event handlers. */
export function playPing(volume = 0.18) {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
      if (!_unlocked) return;
    }

    const now = ctx.currentTime;
    // Soft modern "pop" notification — three quick descending bell-like tones
    const tones = [
      { freq: 1568, start: 0, dur: 0.14 },     // G6
      { freq: 1318, start: 0.08, dur: 0.18 },  // E6
      { freq: 987, start: 0.18, dur: 0.28 },   // B5 (resolves softly)
    ];

    for (const t of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(t.freq, now + t.start);
      gain.gain.setValueAtTime(0.0001, now + t.start);
      gain.gain.exponentialRampToValueAtTime(volume, now + t.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + t.start + t.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + t.start);
      osc.stop(now + t.start + t.dur + 0.02);
    }
  } catch {
    /* no-op */
  }
}

/** Unlock the audio context after a user gesture (call once on first interaction). */
export async function unlockAudio() {
  try {
    const ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") await ctx.resume().catch(() => {});
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    source.start(0);
    _unlocked = true;
  } catch { /* no-op */ }
}
