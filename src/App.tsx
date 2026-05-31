import { useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Bell, BellOff } from 'lucide-react';
import { useTimer } from './hooks/useTimer';
import { useSound } from './hooks/useSound';
import { useNotifications } from './hooks/useNotifications';
import { useTheme } from './hooks/useTheme';
import { Phase } from './types';
import TimerRing from './components/TimerRing';
import SessionDots from './components/SessionDots';
import LengthControl from './components/LengthControl';
import ThemeToggle from './components/ThemeToggle';
import LavaLamp from './components/LavaLamp';

const PHASE_COLORS: Record<Phase, { light: string; dark: string }> = {
  session: { light: '#e53e3e', dark: '#fc8181' },
  break: { light: '#38a169', dark: '#68d391' },
  longBreak: { light: '#3182ce', dark: '#63b3ed' },
};

const COMPLETE_MESSAGES: Record<Phase, { title: string; body: string }> = {
  session: { title: 'Session complete!', body: 'Time for a break.' },
  break: { title: 'Break over!', body: 'Back to work.' },
  longBreak: { title: 'Long break over!', body: 'Back to work.' },
};

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const playSound = useSound();
  const {
    isEnabled: notificationsEnabled,
    isDenied,
    toggle: toggleNotifications,
    notify,
  } = useNotifications();

  const handlePhaseComplete = useCallback(
    (completing: Phase) => {
      playSound();
      const { title, body } = COMPLETE_MESSAGES[completing];
      notify(title, body);
    },
    [playSound, notify],
  );

  const { state, toggle, reset, setSessionLength, setBreakLength, phaseDurationSecs } =
    useTimer(handlePhaseComplete);

  useEffect(() => {
    const { light, dark } = PHASE_COLORS[state.phase];
    document.documentElement.style.setProperty('--phase-color', theme === 'dark' ? dark : light);
  }, [state.phase, theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLButtonElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      }
      if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) reset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, reset]);

  const { phase, secondsLeft, isRunning, sessionsCompleted, settings } = state;
  const sessionsDoneInCycle = sessionsCompleted % settings.sessionsUntilLongBreak;
  const progress = phaseDurationSecs > 0 ? 1 - secondsLeft / phaseDurationSecs : 0;

  return (
    <div className="app-shell">
      <LavaLamp progress={progress} />
      <div className="app-center">
      <div className="card">
        <header className="card-header">
          <h1 className="app-title">Pomodoro</h1>
          <div className="header-actions">
            <button
              className={[
                'icon-btn',
                notificationsEnabled ? 'icon-btn--active' : '',
                isDenied ? 'icon-btn--muted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={toggleNotifications}
              aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              title={isDenied ? 'Notifications blocked in browser settings' : undefined}
            >
              {notificationsEnabled ? <Bell size={17} /> : <BellOff size={17} />}
            </button>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        <main className="card-body">
          <SessionDots
            completed={sessionsDoneInCycle}
            total={settings.sessionsUntilLongBreak}
          />

          <TimerRing
            secondsLeft={secondsLeft}
            totalSeconds={phaseDurationSecs}
            phase={phase}
            isRunning={isRunning}
          />

          <div className="controls">
            <button
              className="btn btn--primary"
              onClick={toggle}
              aria-label={isRunning ? 'Pause timer' : 'Start timer'}
            >
              {isRunning ? (
                <>
                  <Pause size={15} /> Pause
                </>
              ) : (
                <>
                  <Play size={15} /> Start
                </>
              )}
            </button>
            <button className="btn btn--ghost" onClick={reset} aria-label="Reset timer">
              <RotateCcw size={15} /> Reset
            </button>
          </div>

          <div className="length-controls">
            <LengthControl
              id="break-length"
              label="Break"
              value={settings.breakLength}
              min={1}
              max={60}
              onChange={setBreakLength}
              disabled={isRunning}
            />
            <div className="length-divider" />
            <LengthControl
              id="session-length"
              label="Session"
              value={settings.sessionLength}
              min={1}
              max={60}
              onChange={setSessionLength}
              disabled={isRunning}
            />
          </div>
        </main>

        <footer className="card-footer">
          <p className="shortcut-hint">Space to start / pause · R to reset</p>
        </footer>
      </div>
      </div>
    </div>
  );
}
