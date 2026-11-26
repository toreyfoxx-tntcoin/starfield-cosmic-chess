import { useEffect, useCallback } from 'react';
import posthog from 'posthog-js';

// Initialize PostHog
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_API_KEY;
const POSTHOG_HOST = 'https://app.posthog.com';

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true
  });
}

export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.capture(eventName, properties);
    } else {
      console.log('[Analytics]', eventName, properties);
    }
  }, []);

  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    if (POSTHOG_KEY) {
      posthog.identify(userId, traits);
    }
  }, []);

  const trackGameStart = useCallback((mode: 'ai' | 'multiplayer', difficulty?: string) => {
    trackEvent('game_start', { mode, difficulty, timestamp: Date.now() });
  }, [trackEvent]);

  const trackGameEnd = useCallback((result: string, duration: number, mode: string) => {
    trackEvent('game_end', { result, duration, mode, timestamp: Date.now() });
  }, [trackEvent]);

  const trackMove = useCallback((from: string, to: string, piece: string, ply: number) => {
    trackEvent('move_made', { from, to, piece, ply });
  }, [trackEvent]);

  const trackAbilityUsed = useCallback((ability: string, piece: string, target?: string) => {
    trackEvent('ability_used', { ability, piece, target });
  }, [trackEvent]);

  const trackPurchase = useCallback((sku: string, amount: number, currency: string) => {
    trackEvent('purchase', { sku, amount, currency, timestamp: Date.now() });
  }, [trackEvent]);

  const trackMatchmaking = useCallback((action: 'join' | 'leave' | 'matched', elo?: number) => {
    trackEvent('matchmaking', { action, elo, timestamp: Date.now() });
  }, [trackEvent]);

  return {
    trackEvent,
    identify,
    trackGameStart,
    trackGameEnd,
    trackMove,
    trackAbilityUsed,
    trackPurchase,
    trackMatchmaking
  };
};
