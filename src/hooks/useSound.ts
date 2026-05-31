import { useRef, useCallback } from 'react';

export function useSound(): () => void {
  const ctxRef = useRef<AudioContext | null>(null);

  return useCallback(() => {
    try {
      if (!ctxRef.current || ctxRef.current.state === 'closed') {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') void ctx.resume();

      const now = ctx.currentTime;
      [0, 0.28, 0.56].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0, now + offset);
        gain.gain.linearRampToValueAtTime(0.35, now + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.2);
        osc.start(now + offset);
        osc.stop(now + offset + 0.22);
      });
    } catch {
      // AudioContext unavailable
    }
  }, []);
}
