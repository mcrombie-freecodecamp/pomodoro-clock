import { useReducer, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerAction, Phase, Settings } from '../types';

const DEFAULT_SETTINGS: Settings = {
  sessionLength: 25,
  breakLength: 5,
  longBreakLength: 15,
  sessionsUntilLongBreak: 4,
};

function phaseDuration(phase: Phase, settings: Settings): number {
  switch (phase) {
    case 'session':
      return settings.sessionLength * 60;
    case 'break':
      return settings.breakLength * 60;
    case 'longBreak':
      return settings.longBreakLength * 60;
  }
}

function nextPhase(current: Phase, newCount: number, settings: Settings): Phase {
  if (current !== 'session') return 'session';
  return newCount % settings.sessionsUntilLongBreak === 0 ? 'longBreak' : 'break';
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('pomodoro-settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
  } catch {}
}

function buildInitialState(): TimerState {
  const settings = loadSettings();
  return {
    phase: 'session',
    secondsLeft: settings.sessionLength * 60,
    isRunning: false,
    sessionsCompleted: 0,
    settings,
    justCompleted: false,
  };
}

function reducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'TICK': {
      if (!state.isRunning || state.secondsLeft === 0) return state;
      const next = state.secondsLeft - 1;
      return { ...state, secondsLeft: next, justCompleted: next === 0 };
    }
    case 'ADVANCE_PHASE': {
      const newCount =
        state.phase === 'session' ? state.sessionsCompleted + 1 : state.sessionsCompleted;
      const phase = nextPhase(state.phase, newCount, state.settings);
      return {
        ...state,
        phase,
        secondsLeft: phaseDuration(phase, state.settings),
        sessionsCompleted: newCount,
        justCompleted: false,
      };
    }
    case 'START':
      return { ...state, isRunning: true };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESET':
      return buildInitialState();
    case 'SET_SESSION_LENGTH': {
      if (state.isRunning) return state;
      const settings = { ...state.settings, sessionLength: action.payload };
      saveSettings(settings);
      return {
        ...state,
        settings,
        secondsLeft: state.phase === 'session' ? action.payload * 60 : state.secondsLeft,
      };
    }
    case 'SET_BREAK_LENGTH': {
      if (state.isRunning) return state;
      const settings = { ...state.settings, breakLength: action.payload };
      saveSettings(settings);
      return {
        ...state,
        settings,
        secondsLeft: state.phase === 'break' ? action.payload * 60 : state.secondsLeft,
      };
    }
  }
}

export interface UseTimerResult {
  state: TimerState;
  toggle: () => void;
  reset: () => void;
  setSessionLength: (n: number) => void;
  setBreakLength: (n: number) => void;
  phaseDurationSecs: number;
}

export function useTimer(onPhaseComplete: (completing: Phase) => void): UseTimerResult {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const onCompleteRef = useRef(onPhaseComplete);
  const handledRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onPhaseComplete;
  });

  useEffect(() => {
    if (!state.isRunning) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [state.isRunning]);

  // Guard with handledRef so React strict-mode double-invocation doesn't fire twice
  useEffect(() => {
    if (!state.justCompleted) {
      handledRef.current = false;
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;
    onCompleteRef.current(state.phase);
    dispatch({ type: 'ADVANCE_PHASE' });
  }, [state.justCompleted, state.phase]);

  const toggle = useCallback(
    () => dispatch({ type: state.isRunning ? 'PAUSE' : 'START' }),
    [state.isRunning],
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setSessionLength = useCallback(
    (n: number) => dispatch({ type: 'SET_SESSION_LENGTH', payload: n }),
    [],
  );
  const setBreakLength = useCallback(
    (n: number) => dispatch({ type: 'SET_BREAK_LENGTH', payload: n }),
    [],
  );

  return {
    state,
    toggle,
    reset,
    setSessionLength,
    setBreakLength,
    phaseDurationSecs: phaseDuration(state.phase, state.settings),
  };
}
