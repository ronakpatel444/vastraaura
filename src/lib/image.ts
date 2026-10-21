/**
 * Utility functions for safely handling image URLs across CSS and HTML contexts.
 */

export function safeImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    return encodeURI(decodeURI(trimmed));
  } catch {
    return encodeURI(trimmed);
  }
}

export function formatCssUrl(url?: string | null): string {
  return safeImageUrl(url);
}
