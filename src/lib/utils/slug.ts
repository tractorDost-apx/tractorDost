/**
 * Generates URL-friendly slugs identical to backend tractor.service.ts slugify implementation.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a hyphenated slug back into readable Title Case words.
 */
export function unslugify(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
