/**
 * Formatting utilities for Water Shadow
 * Strictly adheres to Section 17 of the Frontend Specification
 */

/**
 * Format large numbers with comma separators or optional compact notation
 */
export function formatNumber(
  value: number | null | undefined,
  options?: {
    decimals?: number;
    compact?: boolean;
    fallback?: string;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? '—';
  }

  const decimals = options?.decimals ?? 2;

  if (options?.compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-IN', {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  }

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format percentage with optional sign (+/-)
 */
export function formatPercent(
  value: number | null | undefined,
  options?: {
    showSign?: boolean;
    decimals?: number;
    fallback?: string;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options?.fallback ?? '—';
  }

  const decimals = options?.decimals ?? 1;
  const formatted = Math.abs(value).toFixed(decimals);
  
  if (options?.showSign) {
    if (value > 0) return `+${formatted}%`;
    if (value < 0) return `-${formatted}%`;
    return `0.0%`;
  }

  return `${value.toFixed(decimals)}%`;
}

/**
 * Format value with unit, strictly displaying the unit
 */
export function formatWithUnit(
  value: number | null | undefined,
  unit: string | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const formatted = formatNumber(value, { decimals });
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Format timestamp or date string to readable format
 */
export function formatDate(
  dateStr: string | null | undefined,
  includeTime = true
): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}),
    });
  } catch {
    return dateStr;
  }
}

/**
 * Capitalize crop name cleanly
 */
export function formatCropName(crop: string | null | undefined): string {
  if (!crop) return '—';
  return crop
    .split(/[-_ ]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format geographic name (State / District)
 */
export function formatRegionName(region: string | null | undefined): string {
  if (!region) return '—';
  return region.trim();
}

/**
 * Convert snake_case or slug to Title Case
 */
export function formatTitleCase(str: string | null | undefined): string {
  if (!str) return '—';
  return str
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
