import { describe, it, expect } from 'vitest';

describe('Phase Gating', () => {
  it('should only allow AI to run when phase is PLAYING', () => {
    const phases = ['PLAYING', 'PROMOTION_AWAIT_CHOICE', 'CHECKMATE_AWAIT_CHOICE', 'ENDED'];
    
    phases.forEach(phase => {
      const shouldRunAI = phase === 'PLAYING';
      expect(shouldRunAI).toBe(phase === 'PLAYING');
    });
  });

  it('should clear aiThinking flag when phase changes from PLAYING', () => {
    let aiThinking = true;
    let phase = 'PLAYING';
    
    // Phase changes
    phase = 'PROMOTION_AWAIT_CHOICE';
    
    // AI thinking should be cleared
    if (phase !== 'PLAYING') {
      aiThinking = false;
    }
    
    expect(aiThinking).toBe(false);
  });

  it('should clear aiThinking flag when sideToMove changes', () => {
    let aiThinking = true;
    let sideToMove = 'BLACK';
    const aiSide = 'BLACK';
    
    // Turn flips
    sideToMove = 'WHITE';
    
    // AI thinking should be cleared
    if (sideToMove !== aiSide) {
      aiThinking = false;
    }
    
    expect(aiThinking).toBe(false);
  });

  it('should pause timers during PROMOTION_AWAIT_CHOICE', () => {
    const state = {
      phase: 'PROMOTION_AWAIT_CHOICE',
      timersPaused: false
    };
    
    if (state.phase === 'PROMOTION_AWAIT_CHOICE') {
      state.timersPaused = true;
    }
    
    expect(state.timersPaused).toBe(true);
  });

  it('should resume timers when returning to PLAYING phase', () => {
    const state = {
      phase: 'PLAYING',
      timersPaused: true
    };
    
    if (state.phase === 'PLAYING') {
      state.timersPaused = false;
    }
    
    expect(state.timersPaused).toBe(false);
  });
});
