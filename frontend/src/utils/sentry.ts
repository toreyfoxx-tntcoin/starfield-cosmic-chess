import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const ENV = import.meta.env.MODE || 'development';

export const initSentry = () => {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENV,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      tracesSampleRate: ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event) {
        if (event.level === 'info' || event.level === 'debug') {
          return null;
        }
        return event;
      },
    });
  }
};


export const captureError = (error: Error, context?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[Sentry]', error, context);
  }
};

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  if (SENTRY_DSN) {
    Sentry.addBreadcrumb({ message, category, data, level: 'info' });
  }
};

export const startTransaction = (name: string, op: string) => {
  if (SENTRY_DSN) {
    return Sentry.startTransaction({ name, op });
  }
  return null;
};

export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (SENTRY_DSN) {
    Sentry.setUser(user);
  }
};

export default Sentry;
