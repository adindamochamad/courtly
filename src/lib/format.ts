/**
 * Formatting helpers — Indonesian locale conventions.
 */

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

/** 155000 → "Rp155.000" */
export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}

/** "2026-09-06" → Date at local midnight (avoids UTC-shift bugs). */
export function parseApiDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Date → "2026-09-06" (local, API format). */
export function toApiDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** "2026-09-06" → "Sat, 6 Sep 2026" */
export function formatDateLong(date: string): string {
  return parseApiDate(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
