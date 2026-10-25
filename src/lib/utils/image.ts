const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:8080';

/**
 * Normalizes an image or asset URL. If relative, prefixes with backend server host.
 */
export function getMediaUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl || !pathOrUrl.trim()) {
    return '/TD%20White.png';
  }
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/')) {
    // If it's a client public asset
    if (trimmed.startsWith('/TD') || trimmed.startsWith('/images/')) {
      return trimmed;
    }
    return `${BACKEND_BASE}${trimmed}`;
  }
  return `${BACKEND_BASE}/${trimmed}`;
}

/**
 * Formats byte size to human-readable string (e.g. 2.4 MB).
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
