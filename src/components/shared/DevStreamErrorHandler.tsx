'use client';

/**
 * Suppresses harmless Turbopack HMR stream closure errors that occur during fast refresh,
 * route redirection, and hot reload over local network connections:
 * - "Cannot write to a CLOSED writable stream"
 * - "Cannot close a CLOSED writable stream"
 */
if (typeof window !== 'undefined') {
  const isIgnoredMessage = (msg: string) =>
    msg.includes('CLOSED writable stream') ||
    msg.includes('closed stream') ||
    msg.includes('writable stream') ||
    msg.includes('Cannot close a CLOSED') ||
    msg.includes('Cannot write to a CLOSED');

  // 1. Intercept console.error to prevent Next.js Turbopack dev overlay from triggering
  const origConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const fullText = args
      .map((a) => (a instanceof Error ? `${a.message} ${a.stack || ''}` : String(a || '')))
      .join(' ');
    if (isIgnoredMessage(fullText)) {
      return;
    }
    origConsoleError.apply(console, args);
  };

  // 2. Intercept unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason || '');
    if (isIgnoredMessage(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // 3. Intercept global window errors
  window.addEventListener('error', (event: ErrorEvent) => {
    const msg = event.message || (event.error instanceof Error ? event.error.message : '');
    if (isIgnoredMessage(msg)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

export function DevStreamErrorHandler() {
  return null;
}
