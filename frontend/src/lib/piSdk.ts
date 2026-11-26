// Type-safe wrapper for the official Pi Network Browser SDK v2.0

export interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

interface PiSDK {
  init: (config: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: unknown) => void
  ) => Promise<PiAuthResult>;
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
 * Authenticates strictly via Pi SDK requesting minimal scope ('username').
 * Complies with Pi Mainnet Listing Guidelines (Use Only Pi Authentication & Limit Data Collection).
 */
export async function authenticateWithPi(): Promise<PiAuthResult> {
  if (!initPiSdk() || !window.Pi) {
    throw new Error(
      'Pi Browser is required to sign in. Please open starfieldcosmicchess.com inside the Pi Browser app.'
    );
  }

  return window.Pi.authenticate(['username'], (incompletePayment) => {
    // MVP uses zero payments; callback stub retained for Pi SDK contract compliance.
    console.info('[Starfield] Incomplete payment callback:', incompletePayment);
  });
}
