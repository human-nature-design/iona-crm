/**
 * Unit Tests: Embedding Text Combiner Functions
 *
 * Tests combineBlockText from lib/ai/embeddings.ts.
 *
 * Run with: pnpm test __tests__/unit/ai/embedding-text.test.ts
 */

// Mock ai SDK (can't run in jsdom environment)
jest.mock('ai', () => ({
  embed: jest.fn(),
}));

jest.mock('@ai-sdk/openai', () => ({
  openai: { embedding: jest.fn() },
}));

import { combineBlockText } from '@/lib/ai/embeddings';

describe('combineBlockText', () => {
  it('should return empty string when all fields are null/undefined', () => {
    expect(combineBlockText({})).toBe('');
    expect(combineBlockText({ category: null, blockNumber: null, title: null, description: null })).toBe('');
  });

  it('should include category with correct prefix', () => {
    expect(combineBlockText({ category: 'Security' })).toBe('Category: Security');
  });

  it('should include block number with correct prefix', () => {
    expect(combineBlockText({ blockNumber: 'B-001' })).toBe('Block Number: B-001');
  });

  it('should include title with correct prefix', () => {
    expect(combineBlockText({ title: 'SSO Login' })).toBe('Title: SSO Login');
  });

  it('should include description with correct prefix', () => {
    expect(combineBlockText({ description: 'Supports SAML 2.0' })).toBe('Description: Supports SAML 2.0');
  });

  it('should join multiple fields with ". " delimiter', () => {
    const result = combineBlockText({
      category: 'Security',
      title: 'SSO Login',
    });
    expect(result).toBe('Category: Security. Title: SSO Login');
  });

  it('should include all four fields in order', () => {
    const result = combineBlockText({
      category: 'Security',
      blockNumber: 'B-001',
      title: 'SSO Login',
      description: 'Supports SAML 2.0',
    });
    expect(result).toBe(
      'Category: Security. Block Number: B-001. Title: SSO Login. Description: Supports SAML 2.0'
    );
  });

  it('should skip null fields', () => {
    const result = combineBlockText({
      category: 'Security',
      blockNumber: null,
      title: 'SSO Login',
      description: null,
    });
    expect(result).toBe('Category: Security. Title: SSO Login');
  });

  it('should skip undefined fields', () => {
    const result = combineBlockText({
      category: undefined,
      title: 'SSO Login',
    });
    expect(result).toBe('Title: SSO Login');
  });
});
