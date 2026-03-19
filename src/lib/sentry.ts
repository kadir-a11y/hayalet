import * as Sentry from "@sentry/node";

let initialized = false;

export function initSentryForWorkers(): void {
  if (initialized) return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: process.env.NODE_ENV === "production",
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV || "development",
  });

  initialized = true;
}

export function captureWorkerError(error: unknown, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext("worker", context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}
