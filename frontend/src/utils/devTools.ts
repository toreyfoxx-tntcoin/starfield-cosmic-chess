import { submitActionWithAck, GameAction } from '../net/submitActionWithAck';
import posthog from 'posthog-js';

// Dev-only tools (gated by import.meta.env.DEV)
export function initDevTools() {
  if (!import.meta.env.DEV) return;

  // Force PASS action
  (window as any).__forcePass = (matchId: string, playerId: string) => {
    const action: GameAction = { type: 'PASS' };
    submitActionWithAck({
      matchId,
      action,
      playerId,
      ruleset: 'DEV_FORCE'
    }).then(() => {
      console.log('✓ PASS action submitted');
      posthog.capture('dev_force_pass', { matchId });
    }).catch(console.error);
  };

  // Skip AI thinking delay
  (window as any).__skipAIThinking = false;

  // Show state debug modal
  (window as any).__showStateDebug = (state: any) => {
    const debugWindow = window.open('', 'State Debug', 'width=800,height=600');
    if (debugWindow) {
      debugWindow.document.write(`
        <html>
          <head><title>Game State Debug</title></head>
          <body style="font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0;">
            <h2>Current Match State</h2>
            <pre>${JSON.stringify(state, null, 2)}</pre>
          </body>
        </html>
      `);
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey) {
      if (e.key === 'P') {
        e.preventDefault();
        console.log('Use __forcePass(matchId, playerId) to force a PASS');
      } else if (e.key === 'D') {
        e.preventDefault();
        console.log('Use __showStateDebug(state) to view state');
      } else if (e.key === 'K') {
        e.preventDefault();
        (window as any).__skipAIThinking = !(window as any).__skipAIThinking;
        console.log(`AI skip: ${(window as any).__skipAIThinking}`);
      }
    }
  });

  console.log(`
🔧 Dev Tools Loaded:
  - window.__forcePass(matchId, playerId) - Force PASS action
  - window.__skipAIThinking = true/false - Skip AI delay
  - window.__showStateDebug(state) - Show state JSON
  
⌨️  Shortcuts:
  - Ctrl+Shift+P - Force PASS hint
  - Ctrl+Shift+D - State debug hint
  - Ctrl+Shift+K - Toggle AI skip
  `);
}
