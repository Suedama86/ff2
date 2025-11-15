/**
 * Puter Authentication Helper
 * 
 * This module provides authentication utilities for Puter.js API calls.
 * It ensures users are authenticated before making API calls to prevent
 * automatic full-page redirects when tokens are invalid or expired.
 */

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            temperature?: number;
            stream?: boolean;
          }
        ) => Promise<any>;
      };
      auth: {
        isSignedIn: () => boolean;
        getUser: () => Promise<any>;
        signIn: (options?: { returnUrl?: string }) => Promise<any>;
      };
    };
  }
}

/**
 * Ensures the user is authenticated with Puter before making API calls.
 * 
 * This function:
 * 1. Checks if the user is already signed in
 * 2. If not signed in or token is invalid, opens a login popup to authenticate
 * 3. Waits for successful authentication before returning
 * 
 * @throws {Error} If authentication fails or is cancelled
 * @returns {Promise<void>} Resolves when user is authenticated
 */
export async function ensurePuterAuth(): Promise<void> {
  try {
    // First check if user is already signed in
    if (window.puter.auth.isSignedIn()) {
      // Verify the token is still valid by getting user info
      await window.puter.auth.getUser();
      // Token is valid, user is authenticated
      return;
    }
  } catch (error) {
    // Token is invalid or expired, continue to sign-in flow
    console.log("Puter token invalid or expired, need to authenticate...");
  }

  // User is not signed in or token is invalid, need to authenticate
  try {
    console.log("Opening Puter login popup...");
    
    // Open login popup and wait for authentication
    // Note: This must be triggered by user interaction (e.g., button click)
    await window.puter.auth.signIn();
    
    // Verify authentication was successful
    await window.puter.auth.getUser();
    console.log("Puter authentication successful");
  } catch (authError) {
    console.error("Puter authentication failed:", authError);
    throw new Error("Authentication failed. Please try again.");
  }
}
