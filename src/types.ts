export type Phase = 'session' | 'break' | 'longBreak';

export interface Settings {
  sessionLength: number;
  breakLength: number;
  longBreakLength: number;
  sessionsUntilLongBreak: number;
}

export interface TimerState {
  phase: Phase;
  secondsLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  settings: Settings;
  justCompleted: boolean;
}

export type TimerAction =
  | { type: 'TICK' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SET_SESSION_LENGTH'; payload: number }
  | { type: 'SET_BREAK_LENGTH'; payload: number };
