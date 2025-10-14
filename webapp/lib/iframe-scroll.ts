/**
 * Utility function to request the parent window to scroll the iframe into view
 * This should be called when user interacts with map components
 */
export function scrollIframeToFullscreen() {
  // Check if we're in an iframe
  if (window.self !== window.top) {
    // Send message to parent window to scroll this iframe into view
    window.parent.postMessage({ type: 'scrollToIframe' }, '*');
  }
}
