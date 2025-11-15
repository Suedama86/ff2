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
      getUser: () => Promise<any>;
      auth: {
        signIn: (options?: { returnUrl?: string }) => Promise<any>;
      };
    };
  }
}

/**
 * Ensures the user is authenticated with Puter before making API calls.
 * 
 * This function:
 * 1. Checks if the current token is valid by calling window.puter.getUser()
 * 2. If the token is invalid/expired, opens a login popup to authenticate
 * 3. Waits for successful authentication before returning
 * 
 * @throws {Error} If authentication fails or is cancelled
 * @returns {Promise<void>} Resolves when user is authenticated
 */
export async function ensurePuterAuth(): Promise<void> {
  try {
    // Try to get the current user to verify the token is valid
    await window.puter.getUser();
    // Token is valid, user is authenticated
    return;
  } catch (error) {
    // Token is invalid or expired, need to authenticate
    console.log("Puter token invalid or expired, opening login popup...");
    
    try {
      // Open login popup and wait for authentication
      // The return URL will be the current page so the popup can close after auth
      const returnUrl = window.location.href;
      await window.puter.auth.signIn({ returnUrl });
      
      // Verify authentication was successful
      await window.puter.getUser();
      console.log("Puter authentication successful");
    } catch (authError) {
      console.error("Puter authentication failed:", authError);
      throw new Error("Authentication failed. Please try again.");
    }
  }
}
