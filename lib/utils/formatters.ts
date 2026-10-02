export function formatCurrency(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "฿0.00";
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0";
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0.0%";
  return `${value.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return "0";
  if (value >= 1_000_000) return `฿${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `฿${(value / 1_000).toFixed(1)}k`;
  return `฿${value.toFixed(0)}`;
}
