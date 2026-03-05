/**
 * Unit Tests: CSV Export Utilities
 *
 * Tests escapeCSV and getEvaluationText functions extracted from
 * the export route into lib/csv-utils.ts.
 *
 * Run with: pnpm test __tests__/unit/export/csv-export.test.ts
 */

import { escapeCSV, getEvaluationText } from '@/lib/csv-utils';

describe('escapeCSV', () => {
  it('should return empty string for null', () => {
    expect(escapeCSV(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(escapeCSV(undefined)).toBe('');
  });

  it('should return empty string for empty string input', () => {
    expect(escapeCSV('')).toBe('');
  });

  it('should return plain string unchanged when no special chars', () => {
    expect(escapeCSV('hello world')).toBe('hello world');
  });

  it('should wrap in quotes when value contains commas', () => {
    expect(escapeCSV('hello, world')).toBe('"hello, world"');
  });

  it('should wrap in quotes when value contains newlines', () => {
    expect(escapeCSV('hello\nworld')).toBe('"hello\nworld"');
  });

  it('should wrap in quotes and double internal quotes', () => {
    expect(escapeCSV('say "hello"')).toBe('"say ""hello"""');
  });

  it('should handle combined special characters', () => {
    expect(escapeCSV('a "b", c\nd')).toBe('"a ""b"", c\nd"');
  });

  it('should handle numeric values via String coercion', () => {
    expect(escapeCSV('42')).toBe('42');
  });

  it('should handle string with only a comma', () => {
    expect(escapeCSV(',')).toBe('","');
  });

  it('should handle string with only a double quote', () => {
    expect(escapeCSV('"')).toBe('""""');
  });
});

describe('getEvaluationText', () => {
  it('should return empty string for null', () => {
    expect(getEvaluationText(null)).toBe('');
  });

  it('should return empty string for 0', () => {
    expect(getEvaluationText(0)).toBe('');
  });

  it('should map 1 to "1-Poor"', () => {
    expect(getEvaluationText(1)).toBe('1-Poor');
  });

  it('should map 2 to "2-Fair"', () => {
    expect(getEvaluationText(2)).toBe('2-Fair');
  });

  it('should map 3 to "3-Good"', () => {
    expect(getEvaluationText(3)).toBe('3-Good');
  });

  it('should map 4 to "4-Very Good"', () => {
    expect(getEvaluationText(4)).toBe('4-Very Good');
  });

  it('should map 5 to "5-Excellent"', () => {
    expect(getEvaluationText(5)).toBe('5-Excellent');
  });

  it('should return empty string for out-of-range value 6', () => {
    expect(getEvaluationText(6)).toBe('');
  });

  it('should return empty string for negative value -1', () => {
    expect(getEvaluationText(-1)).toBe('');
  });
});
