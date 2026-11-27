import { apiClient } from './apiClient';

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
}

interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: any) => void
  ) => Promise<PiAuthResult>;
  createPayment: (
    paymentData: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: PiPaymentCallbacks
  ) => void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

let initialized = false;

export function isPiBrowserAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.Pi !== 'undefined';
}

export function initPiSdk(): boolean {
  if (!isPiBrowserAvailable() || !window.Pi) {
    return false;
  }
  if (!initialized) {
    const sandbox = import.meta.env.VITE_PI_SANDBOX === 'true';
    window.Pi.init({ version: '2.0', sandbox });
    initialized = true;
  }
  return true;
}

/**
 * Authenticates via Pi SDK requesting 'username' and 'payments' (for optional supporter tips).
 */
export async function authenticateWithPi(): Promise<PiAuthResult> {
  if (!initPiSdk() || !window.Pi) {
    throw new Error(
      'Pi Browser is required to sign in. Please open starfieldcosmicchess.com inside the Pi Browser app.'
    );
  }

  return window.Pi.authenticate(['username', 'payments'], async (incompletePayment) => {
    try {
      const paymentId = incompletePayment?.identifier;
      const txid = incompletePayment?.transaction?.txid;
      if (paymentId && txid) {
        await apiClient.post('/api/v1/payments/complete', { payment_id: paymentId, txid });
      }
    } catch (err) {
      console.warn('[Starfield] Incomplete payment recovery note:', err);
    }
  });
}

/**
 * Initiates a 100% voluntary, non-pay-to-win Pi supporter tip via Pi.createPayment.
 */
export function createPiSupporterTip(
  amount: number,
  onStatus: (status: string, isError?: boolean) => void
): void {
  if (!initPiSdk() || !window.Pi) {
    onStatus('Open starfieldcosmicchess.com inside Pi Browser to send a Pi tip.', true);
    return;
  }

  onStatus(`Opening Pi Wallet for ${amount} Pi supporter tip...`);

  window.Pi.createPayment(
    {
      amount,
      memo: `Starfield Cosmic Chess — Community Supporter Tip (${amount} Pi)`,
      metadata: { purpose: 'community_tip_jar', cosmetic_badge: 'galactic_supporter' },
    },
    {
      onReadyForServerApproval: async (paymentId) => {
        try {
          onStatus('Approving tip with Starfield server...');
          await apiClient.post('/api/v1/payments/approve', { payment_id: paymentId });
        } catch (err: unknown) {
          onStatus(err instanceof Error ? err.message : 'Approval failed.', true);
        }
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        try {
          onStatus('Completing on-chain Pi tip...');
          await apiClient.post('/api/v1/payments/complete', {
            payment_id: paymentId,
            txid,
            amount,
          });
          onStatus('Thank you, Pioneer! Your Galactic Supporter badge is now unlocked.');
        } catch (err: unknown) {
          onStatus(err instanceof Error ? err.message : 'Completion failed.', true);
        }
      },
      onCancel: () => {
        onStatus('Tip cancelled—no Pi was spent.');
      },
      onError: (err) => {
        onStatus(err?.message || 'Pi payment could not be completed.', true);
      },
    }
  );
}
