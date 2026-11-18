import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer({ workMinutes = 25, shortBreak = 5, longBreak = 15, cycles = 4, onComplete } = {}) {
  const [mode, setMode] = useState('focus'); // 'focus' | 'short_break' | 'long_break'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);

  const totalSeconds = mode === 'focus' ? workMinutes * 60 : mode === 'short_break' ? shortBreak * 60 : longBreak * 60;

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(totalSeconds);
  }, [totalSeconds]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const skip = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    if (mode === 'focus') {
      const next = cycleCount + 1;
      setCycleCount(next);
      if (next % cycles === 0) { setMode('long_break'); setTimeLeft(longBreak * 60); }
      else { setMode('short_break'); setTimeLeft(shortBreak * 60); }
    } else {
      setMode('focus'); setTimeLeft(workMinutes * 60);
    }
  }, [mode, cycleCount, cycles, workMinutes, shortBreak, longBreak]);

  const changeMode = useCallback((m) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setMode(m);
    setTimeLeft(m === 'focus' ? workMinutes * 60 : m === 'short_break' ? shortBreak * 60 : longBreak * 60);
  }, [workMinutes, shortBreak, longBreak]);

  useEffect(() => {
    if (!isRunning) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onComplete?.(mode);
          skip();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, onComplete, skip]);

  useEffect(() => { reset(); }, [mode]); // eslint-disable-line

  return { mode, isRunning, timeLeft, totalSeconds, cycleCount, start, pause, reset, skip, changeMode };
}
