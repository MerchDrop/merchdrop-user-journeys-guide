/**
 * Utility function to sanitize image URLs and prevent loading invalid local blob: URLs
 * which cause browser security errors ("Not allowed to load local resource: blob:...").
 */
export const sanitizeImageUrl = (url?: string | null, fallback = '/placeholder.svg'): string => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('blob:')) return fallback;
  return trimmed;
};
