/**
 * Format a number into Indian currency representation (e.g. ₹ 6,45,000)
 */
export function formatCurrencyINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹ 0';
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

/**
 * Format large prices into compact Lakhs / Crores string (e.g. ₹ 5.75 Lakh)
 */
export function formatPriceLakh(amount: number | null | undefined): string {
  if (!amount || isNaN(amount)) return 'Price on Request';
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

/**
 * Format compact views/count numbers (e.g. 1.2k, 4.5 Lakh)
 */
export function formatCompactNumber(num: number | null | undefined): string {
  if (!num) return '0';
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} Lakh`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}
