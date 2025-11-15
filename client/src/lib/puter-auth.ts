/**
 * Puter Authentication Guard
 * 
 * Ensures user is authenticated before calling Puter.ai.chat to prevent
 * unwanted full-page redirects when token is invalid/expired.
 */

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            temperature?: number;
            stream?: boolean;
          }
        ) => Promise<any>;
      };
      getUser?: () => Promise<any>;
      resetAuthToken?: () => void;
      auth?: {
        signIn?: (options?: any) => Promise<any>;
      };
    };
  }
}

export interface EnsurePuterAuthOptions {
  /** Whether to open a popup for authentication (default: true) */
  popup?: boolean;
  /** Timeout in milliseconds for popup authentication (default: 60000) */
  timeoutMs?: number;
  /** Custom login URL (default: https://puter.com/login?return_to=) */
  loginUrl?: string;
}

export class PuterAuthError extends Error {
  constructor(
    message: string,
    public readonly code: 'NOT_AVAILABLE' | 'AUTH_FAILED' | 'POPUP_BLOCKED' | 'TIMEOUT' | 'USER_CANCELLED'
  ) {
    super(message);
    this.name = 'PuterAuthError';
  }
}

/**
 * Ensures the user is authenticated with Puter before making API calls.
 * 
 * @param options - Configuration options for authentication
 * @returns Promise that resolves when authentication is verified
 * @throws {PuterAuthError} If authentication fails or Puter is not available
 * 
 * @example
 * ```typescript
 * try {
 *   await ensurePuterAuth({ popup: true, timeoutMs: 60000 });
 *   // Now safe to call window.puter.ai.chat()
 *   const response = await window.puter.ai.chat(messages);
 * } catch (error) {
 *   if (error instanceof PuterAuthError) {
 *     console.error('Auth error:', error.code, error.message);
 *   }
 * }
 * ```
 */
export async function ensurePuterAuth(options?: EnsurePuterAuthOptions): Promise<void> {
  const {
    popup = true,
    timeoutMs = 60000,
    loginUrl = 'https://puter.com/login?return_to='
  } = options || {};

  // Check if window.puter is available
  if (!window.puter) {
    throw new PuterAuthError(
      'Puter SDK is not available. Make sure the Puter script is loaded.',
      'NOT_AVAILABLE'
    );
  }

  // Try to get current user to verify authentication
  if (window.puter.getUser) {
    try {
      const user = await window.puter.getUser();
      if (user && user.username) {
        // User is authenticated
        return;
      }
    } catch (error) {
      // getUser failed, user is not authenticated or token is invalid
      console.warn('Puter getUser failed, attempting to clear token:', error);
      
      // Clear invalid token if resetAuthToken is available
      if (window.puter.resetAuthToken) {
        window.puter.resetAuthToken();
      }
    }
  }

  // User is not authenticated, try popup authentication if enabled
  if (popup) {
    try {
      await authenticateWithPopup(loginUrl, timeoutMs);
    } catch (error) {
      if (error instanceof PuterAuthError) {
        throw error;
      }
      throw new PuterAuthError(
        error instanceof Error ? error.message : 'Authentication failed',
        'AUTH_FAILED'
      );
    }
  } else {
    throw new PuterAuthError(
      'User is not authenticated and popup authentication is disabled',
      'AUTH_FAILED'
    );
  }
}

/**
 * Opens a popup window for authentication and waits for completion
 */
async function authenticateWithPopup(loginUrl: string, timeoutMs: number): Promise<void> {
  const returnUrl = encodeURIComponent(window.location.href);
  const fullLoginUrl = `${loginUrl}${returnUrl}`;
  
  // Open popup window
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    fullLoginUrl,
    'PuterLogin',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );

  if (!popup || popup.closed) {
    throw new PuterAuthError(
      'Failed to open login popup. Please allow popups for this site.',
      'POPUP_BLOCKED'
    );
  }

  // Wait for authentication to complete
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkInterval: NodeJS.Timeout;

    const cleanup = () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };

    // Check if popup was closed manually or if user is authenticated
    checkInterval = setInterval(async () => {
      // Check timeout
      if (Date.now() - startTime > timeoutMs) {
        cleanup();
        try {
          popup.close();
        } catch (e) {
          // Ignore errors when closing popup
        }
        reject(new PuterAuthError(
          `Authentication timeout after ${timeoutMs}ms`,
          'TIMEOUT'
        ));
        return;
      }

      // Check if popup was closed
      if (popup.closed) {
        cleanup();
        
        // Check if user is now authenticated
        if (window.puter && window.puter.getUser) {
          try {
            const user = await window.puter.getUser();
            if (user && user.username) {
              resolve();
              return;
            }
          } catch (error) {
            // Still not authenticated
          }
        }
        
        reject(new PuterAuthError(
          'Login popup was closed before authentication completed',
          'USER_CANCELLED'
        ));
        return;
      }

      // Try to check authentication status
      if (window.puter && window.puter.getUser) {
        try {
          const user = await window.puter.getUser();
          if (user && user.username) {
            cleanup();
            try {
              popup.close();
            } catch (e) {
              // Ignore errors when closing popup
            }
            resolve();
            return;
          }
        } catch (error) {
          // Not authenticated yet, continue polling
        }
      }
    }, 500); // Check every 500ms
  });
}
