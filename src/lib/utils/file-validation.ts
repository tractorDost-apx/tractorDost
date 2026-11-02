/**
 * TractorDost File Upload Validation Utility
 *
 * Rules:
 * - Images (Tractor photos, brand logos, dealer avatars, etc.): Maximum 5MB.
 * - Allowed image types: JPEG, JPG, PNG, WEBP (and SVG for logos).
 * - Documents & PDFs (Brochures, RC book, KYC, inspection reports, loans): Maximum 10MB.
 * - Allowed document types: PDF (and JPEG/PNG/WEBP for scanned identity documents).
 * - NOTE: Banners and Excel/CSV spreadsheets are EXEMPT from these restrictions.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_LOGO_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
];

export const ALLOWED_KYC_DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Validates an image file against the 5MB size limit and allowed image extensions.
 */
export function validateImageFile(
  file: File,
  options?: { isLogo?: boolean; maxSizeMB?: number }
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  const maxBytes = (options?.maxSizeMB ?? 5) * 1024 * 1024;
  const allowed = options?.isLogo ? ALLOWED_LOGO_TYPES : ALLOWED_IMAGE_TYPES;

  const fileType = file.type ? file.type.toLowerCase() : '';
  const extension = file.name ? file.name.split('.').pop()?.toLowerCase() : '';

  const isTypeAllowed =
    allowed.includes(fileType) ||
    (options?.isLogo
      ? ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(extension || '')
      : ['jpg', 'jpeg', 'png', 'webp'].includes(extension || ''));

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `Invalid format for "${file.name}". Only ${
        options?.isLogo ? 'PNG, JPEG, WebP, and SVG' : 'JPEG, PNG, and WebP'
      } images are allowed.`,
    };
  }

  if (file.size > maxBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeInMB}MB. Image file size must not exceed 5MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates a document / PDF file against the 10MB size limit and allowed MIME types.
 */
export function validateDocumentFile(
  file: File,
  options?: { allowImages?: boolean; maxSizeMB?: number }
): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No document file provided.' };
  }

  const maxBytes = (options?.maxSizeMB ?? 10) * 1024 * 1024;
  const allowed = options?.allowImages ? ALLOWED_KYC_DOC_TYPES : ALLOWED_DOCUMENT_TYPES;

  const fileType = file.type ? file.type.toLowerCase() : '';
  const extension = file.name ? file.name.split('.').pop()?.toLowerCase() : '';

  const isTypeAllowed =
    allowed.includes(fileType) ||
    (options?.allowImages
      ? ['pdf', 'jpg', 'jpeg', 'png', 'webp'].includes(extension || '')
      : extension === 'pdf');

  if (!isTypeAllowed) {
    return {
      valid: false,
      error: `Invalid format for "${file.name}". ${
        options?.allowImages ? 'Only PDF, JPEG, and PNG documents' : 'Only PDF documents'
      } are allowed.`,
    };
  }

  if (file.size > maxBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `"${file.name}" is ${sizeInMB}MB. Document size must not exceed 10MB.`,
    };
  }

  return { valid: true };
}

