import { useEffect, useState, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';

export const usePerformance = () => {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.67);
  const [lowFxMode, setLowFxMode] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let lastSampleTime = performance.now();
    const fpsHistory: number[] = [];

    const measurePerformance = () => {
      const now = performance.now();
      const delta = now - lastTime;
      
      frameCount++;
      setFrameTime(delta);

      // Sample FPS every second
      if (now - lastSampleTime >= 1000) {
        const currentFps = Math.round(frameCount * 1000 / (now - lastSampleTime));
        setFps(currentFps);
        fpsHistory.push(currentFps);
        
        // Keep last 10 samples
        if (fpsHistory.length > 10) fpsHistory.shift();
        
        // Auto-throttle if avg FPS < 45 for 10s
        if (fpsHistory.length === 10) {
          const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / 10;
          if (avgFps < 45 && !lowFxMode) {
            setLowFxMode(true);
            trackEvent('auto_throttle_enabled', { avgFps });
          }
        }
        
        // Sample performance metrics
        if (Math.random() < 0.1) {
          trackEvent('performance_sample', {
            fps: currentFps,
            frameTime: delta,
            lowFxMode,
            timestamp: Date.now()
          });
        }
        
        frameCount = 0;
        lastSampleTime = now;
      }

      lastTime = now;
      requestAnimationFrame(measurePerformance);
    };

    const rafId = requestAnimationFrame(measurePerformance);
    return () => cancelAnimationFrame(rafId);
  }, [trackEvent, lowFxMode]);

  const toggleLowFx = useCallback((enabled: boolean) => {
    setLowFxMode(enabled);
    trackEvent('low_fx_toggled', { enabled });
  }, [trackEvent]);

  return { fps, frameTime, lowFxMode, toggleLowFx };
};
