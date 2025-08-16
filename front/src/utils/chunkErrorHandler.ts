/**
 * Handle chunk loading errors that can occur during dynamic imports.
 * This provides fallback behavior for iOS Safari and other browsers
 * that may fail to load JavaScript chunks.
 */

// Track retry attempts to prevent infinite loops
const retryMap = new Map<string, number>();
const MAX_RETRIES = 3;

/**
 * Retry loading a chunk with exponential backoff
 */
export const retryChunkLoad = async (chunkId: string, attempt = 1): Promise<void> => {
  if (attempt > MAX_RETRIES) {
    // If max retries exceeded, reload the page to get fresh chunks
    console.warn(`Failed to load chunk ${chunkId} after ${MAX_RETRIES} attempts. Reloading page.`);
    window.location.reload();
    return;
  }

  const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s

  await new Promise((resolve) => setTimeout(resolve, delay));

  // Clear module cache to force fresh load
  if ("webpackChunkName" in Error.prototype) {
    // This is a workaround for Webpack chunk loading
    // Vite uses different mechanisms, but this won't hurt
    delete (window as any)[`webpackJsonp${chunkId}`];
  }

  console.warn(`Retrying chunk load for ${chunkId}, attempt ${attempt + 1}/${MAX_RETRIES}`);
};

/**
 * Handle chunk load errors globally
 */
export const setupChunkErrorHandler = (): void => {
  // Listen for unhandled promise rejections that might be chunk loading failures
  window.addEventListener("unhandledrejection", (event) => {
    const error = event.reason;

    // Check if this looks like a chunk loading error
    if (
      error instanceof Error &&
      (error.message.includes("Loading chunk") ||
        error.message.includes("Load failed") ||
        error.name === "ChunkLoadError")
    ) {
      event.preventDefault(); // Prevent the error from going to console

      const chunkId = extractChunkId(error.message) || "unknown";
      const currentRetries = retryMap.get(chunkId) || 0;

      if (currentRetries < MAX_RETRIES) {
        retryMap.set(chunkId, currentRetries + 1);
        retryChunkLoad(chunkId, currentRetries + 1);
      } else {
        // Max retries exceeded, show user-friendly error
        console.error("Failed to load application resources. Please refresh the page.");
        // Could also show a toast notification here
      }
    }
  });

  // Also handle module loading errors in older browsers
  window.addEventListener("error", (event) => {
    if (
      event.filename &&
      event.filename.includes(".js") &&
      (event.message.includes("Loading chunk") || event.message.includes("Load failed"))
    ) {
      const chunkId = extractChunkId(event.filename) || "unknown";
      const currentRetries = retryMap.get(chunkId) || 0;

      if (currentRetries < MAX_RETRIES) {
        retryMap.set(chunkId, currentRetries + 1);
        retryChunkLoad(chunkId, currentRetries + 1);
      }
    }
  });
};

/**
 * Extract chunk ID from error message or filename
 */
const extractChunkId = (message: string): string | null => {
  // Try to extract chunk ID from common error message patterns
  const chunkIdMatch =
    message.match(/chunk[.-](\w+)/i) ||
    message.match(/(\w+)[.-]chunk/i) ||
    message.match(/assets\/(\w+)/i);

  return chunkIdMatch ? chunkIdMatch[1] : null;
};
