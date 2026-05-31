import { useEffect, useRef } from 'react';

const BLOB_COUNT = 25;
const MIN_VISIBLE = 6;

interface BlobState {
  cx: number;
  cy: number;
  ax: number;
  ay: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  diameter: number;
  morphDuration: number;
  morphDelay: number;
  morphDirection: 'normal' | 'reverse' | 'alternate';
}

interface LavaLampProps {
  progress: number; // 0 = phase start (full time), 1 = phase end (no time left)
}

const DIRECTIONS: BlobState['morphDirection'][] = ['normal', 'reverse', 'alternate'];

function createBlobs(): BlobState[] {
  return Array.from({ length: BLOB_COUNT }, (_, i) => ({
    cx: 0.08 + Math.random() * 0.84,
    cy: 0.08 + Math.random() * 0.84,
    ax: 0.06 + Math.random() * 0.24,
    ay: 0.04 + Math.random() * 0.20,
    speedX: (0.14 + Math.random() * 0.36) * (Math.random() > 0.5 ? 1 : -1),
    speedY: (0.10 + Math.random() * 0.30) * (Math.random() > 0.5 ? 1 : -1),
    phaseX: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    diameter: 50 + Math.random() * 185,   // 50 – 235 px
    morphDuration: 5 + Math.random() * 10, // 5 – 15 s per shape cycle
    morphDelay: -(Math.random() * 15),     // stagger start phase
    morphDirection: DIRECTIONS[i % 3],
  }));
}

// Dark green → bright yellow → rich red as p goes 0 → 1
function getBlobColor(p: number): string {
  let hue: number, sat: number, lit: number;
  if (p <= 0.5) {
    const t = p * 2;
    hue = 130 - 70 * t;   // 130° (cool green) → 60° (yellow)
    sat = 72 + 15 * t;    // 72 % → 87 %
    lit = 30 + 26 * t;    // 30 % → 56 %   (starts dark, brightens)
  } else {
    const t = (p - 0.5) * 2;
    hue = 60 - 60 * t;    // 60° (yellow) → 0° (red)
    sat = 87 - 5 * t;     // 87 % → 82 %
    lit = 56 - 8 * t;     // 56 % → 48 %
  }
  return `hsl(${hue.toFixed(1)},${sat.toFixed(1)}%,${lit.toFixed(1)}%)`;
}

export default function LavaLamp({ progress }: LavaLampProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<BlobState[]>(createBlobs());
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // One-time: stamp each blob element with its base size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    blobsRef.current.forEach((blob, i) => {
      const el = container.children[i] as HTMLElement | undefined;
      if (el) {
        el.style.width = `${blob.diameter}px`;
        el.style.height = `${blob.diameter}px`;
      }
    });
  }, []);

  // Animation loop — only updates transform, opacity, and the shared --blob-color variable
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const tick = (time: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const p = progressRef.current;
      container.style.setProperty('--blob-color', getBlobColor(p));

      const visibleCount = Math.max(MIN_VISIBLE, Math.round(BLOB_COUNT * (1 - p * 0.72)));
      const sizeScale = (1 - p * 0.50).toFixed(4);

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      blobsRef.current.forEach((blob, i) => {
        blob.phaseX += blob.speedX * dt;
        blob.phaseY += blob.speedY * dt;

        const el = container.children[i] as HTMLElement | undefined;
        if (!el) return;

        if (i >= visibleCount) {
          el.style.opacity = '0';
          return;
        }

        const x = blob.cx + blob.ax * Math.sin(blob.phaseX);
        const y = blob.cy + blob.ay * Math.sin(blob.phaseY);
        const px = (x * w - blob.diameter / 2).toFixed(1);
        const py = (y * h - blob.diameter / 2).toFixed(1);

        el.style.opacity = '1';
        el.style.transform = `translate(${px}px, ${py}px) scale(${sizeScale})`;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="lava-lamp" ref={containerRef} aria-hidden="true">
      {blobsRef.current.map((blob, i) => (
        <div
          key={i}
          className="lava-blob"
          style={{
            animationDuration: `${blob.morphDuration}s`,
            animationDelay: `${blob.morphDelay}s`,
            animationDirection: blob.morphDirection,
          }}
        />
      ))}
    </div>
  );
}
