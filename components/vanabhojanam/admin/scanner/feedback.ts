let audioContext: AudioContext | undefined;

export type SignalKind = "success" | "warning" | "error";

const TONES: Record<SignalKind, [number, number][]> = {
  success: [[880, 0.09], [1320, 0.12]],
  warning: [[520, 0.16], [520, 0.16]],
  error: [[220, 0.3]],
};
const VIBRATION: Record<SignalKind, number | number[]> = { success: 80, warning: [60, 60, 60], error: 250 };

/** Short audible + haptic cue so volunteers do not have to look at the screen. */
export function signal(kind: SignalKind) {
  try {
    if (typeof window === "undefined") return;
    navigator.vibrate?.(VIBRATION[kind]);
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    audioContext ||= new Ctx() as AudioContext;
    const ctx = audioContext;
    let t = ctx.currentTime;
    TONES[kind].forEach(([freq, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += dur + 0.04;
    });
  } catch {
    // Audio/vibration are best-effort only.
  }
}
