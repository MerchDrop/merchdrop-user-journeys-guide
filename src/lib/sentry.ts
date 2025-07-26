import * as Sentry from '@sentry/react';

export const initSentry = () => {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
    beforeSend(event) {
      // Filter out development errors
      if (import.meta.env.MODE === 'development') {
        return null;
      }
      return event;
    },
    beforeBreadcrumb(breadcrumb) {
      // Filter out console logs in production
      if (breadcrumb.category === 'console' && import.meta.env.MODE === 'production') {
        return null;
      }
      return breadcrumb;
    },
  });
};

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;