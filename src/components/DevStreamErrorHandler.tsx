'use client';

import { useEffect } from 'react';

/**
 * Suppresses harmless HMR stream closure errors that occur during fast refresh
 * and hot reload over local network connections (e.g. TypeError: Cannot write to a CLOSED writable stream).
 */
export function DevStreamErrorHandler() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleRejection = (event: PromiseRejectionEvent) => {
        const msg = event.reason?.message || String(event.reason || '');
        if (
          msg.includes('CLOSED writable stream') ||
          msg.includes('closed stream') ||
          msg.includes('writable stream')
        ) {
          event.preventDefault();
        }
      };

      const handleError = (event: ErrorEvent) => {
        const msg = event.message || '';
        if (
          msg.includes('CLOSED writable stream') ||
          msg.includes('closed stream') ||
          msg.includes('writable stream')
        ) {
          event.preventDefault();
        }
      };

      window.addEventListener('unhandledrejection', handleRejection);
      window.addEventListener('error', handleError);

      return () => {
        window.removeEventListener('unhandledrejection', handleRejection);
        window.removeEventListener('error', handleError);
      };
    }
  }, []);

  return null;
}
