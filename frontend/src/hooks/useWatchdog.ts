import { useEffect, useRef } from 'react';

interface WatchdogOptions {
  timeout: number;
  onTimeout: () => void;
}

export const useWatchdog = ({ timeout, onTimeout }: WatchdogOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    clear();
    timeoutRef.current = setTimeout(() => {
      console.warn('Watchdog timeout triggered');
      onTimeout();
    }, timeout);
  };

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => clear();
  }, []);

  return { start, clear };
};
