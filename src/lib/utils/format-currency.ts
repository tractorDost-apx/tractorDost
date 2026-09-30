const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** ₹5,80,000 */
export function formatINR(amount: number | string | null | undefined): string {
  const value = Number(amount);
  return Number.isFinite(value) ? inrFormatter.format(value) : '—';
}
