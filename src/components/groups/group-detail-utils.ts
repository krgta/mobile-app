export const COLORS = [
  { bg: '#EEEDFE', text: '#534AB7' },
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FAECE7', text: '#993C1D' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
];

export function formatAmount(n: string | number) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function splitEvenly(total: number, count: number) {
  if (count <= 0) return [];
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;
  return Array.from({ length: count }, (_, i) =>
    ((base + (i < remainder ? 1 : 0)) / 100).toFixed(2),
  );
}
