import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatPercent,
  formatWithUnit,
  formatCropName,
  formatDate,
  formatTitleCase,
} from '../utils/formatters';

describe('Data Formatting Utilities (Section 17)', () => {
  it('formats large numbers correctly with decimals and fallback', () => {
    expect(formatNumber(1250000)).toContain('12,50,000');
    expect(formatNumber(null)).toBe('—');
    expect(formatNumber(undefined)).toBe('—');
    expect(formatNumber(0)).toBe('0');
  });

  it('formats compact numbers when requested', () => {
    const compact = formatNumber(1500000, { compact: true });
    expect(compact).toMatch(/[0-9.]+[M|L]/i);
  });

  it('formats percentage with sign', () => {
    expect(formatPercent(12.5, { showSign: true })).toBe('+12.5%');
    expect(formatPercent(-8.3, { showSign: true })).toBe('-8.3%');
    expect(formatPercent(0, { showSign: true })).toBe('0.0%');
    expect(formatPercent(null)).toBe('—');
  });

  it('formats values strictly with units', () => {
    expect(formatWithUnit(500, 'ha')).toBe('500 ha');
    expect(formatWithUnit(null, 'm³')).toBe('—');
  });

  it('capitalizes crop names cleanly', () => {
    expect(formatCropName('rice')).toBe('Rice');
    expect(formatCropName('sugarcane_irrigated')).toBe('Sugarcane Irrigated');
    expect(formatCropName(null)).toBe('—');
  });

  it('formats timestamps safely', () => {
    expect(formatDate(null)).toBe('—');
    const formatted = formatDate('2026-10-10T12:00:00Z');
    expect(formatted).toContain('2026');
  });

  it('formats snake_case strings to Title Case', () => {
    expect(formatTitleCase('minimize_blue_water')).toBe('Minimize Blue Water');
  });
});
