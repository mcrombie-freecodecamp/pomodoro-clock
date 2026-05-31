import { Phase } from '../types';

const RADIUS = 96;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const PHASE_LABELS: Record<Phase, string> = {
  session: 'Session',
  break: 'Break',
  longBreak: 'Long Break',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface TimerRingProps {
  secondsLeft: number;
  totalSeconds: number;
  phase: Phase;
  isRunning: boolean;
}

export default function TimerRing({ secondsLeft, totalSeconds, phase, isRunning }: TimerRingProps) {
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 1;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className={`timer-ring-wrapper${isRunning ? ' running' : ''}`}>
      <svg viewBox="0 0 220 220" className="timer-ring-svg" aria-hidden="true">
        <circle cx="110" cy="110" r={RADIUS} strokeWidth="12" className="ring-track" />
        <circle
          cx="110"
          cy="110"
          r={RADIUS}
          strokeWidth="12"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 110 110)"
          className="ring-progress"
          style={{
            transition: isRunning
              ? 'stroke-dashoffset 0.9s linear, stroke 0.5s ease'
              : 'stroke 0.5s ease',
          }}
        />
      </svg>
      <div className="timer-ring-content">
        <span className="timer-phase-label">{PHASE_LABELS[phase]}</span>
        <time
          className="timer-time"
          aria-live="polite"
          aria-label={`${formatTime(secondsLeft)} remaining`}
        >
          {formatTime(secondsLeft)}
        </time>
      </div>
    </div>
  );
}
