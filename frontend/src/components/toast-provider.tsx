'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Don't set default duration here - let individual toasts control it
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          // Error toasts will use duration from individual toast calls
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}
