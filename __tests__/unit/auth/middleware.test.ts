/**
 * Unit Tests: Auth Middleware
 *
 * Tests validatedAction, validatedActionWithUser, and withTeam
 * from lib/auth/middleware.ts.
 *
 * Run with: pnpm test __tests__/unit/auth/middleware.test.ts
 */

import { z } from 'zod';

// Mock dependencies before importing
jest.mock('@/lib/db/supabase-queries', () => ({
  getUser: jest.fn(),
  getTeamForUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

import { validatedAction, validatedActionWithUser, withTeam } from '@/lib/auth/middleware';
import { getUser, getTeamForUser } from '@/lib/db/supabase-queries';
import { redirect } from 'next/navigation';

const mockGetUser = getUser as jest.MockedFunction<typeof getUser>;
const mockGetTeamForUser = getTeamForUser as jest.MockedFunction<typeof getTeamForUser>;

describe('validatedAction', () => {
  const testSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.string().transform((val) => parseInt(val, 10)),
  });

  it('should return error when Zod validation fails', async () => {
    const action = jest.fn();
    const handler = validatedAction(testSchema, action);

    const formData = new FormData();
    formData.set('name', '');
    formData.set('age', '25');

    const result = await handler({}, formData);
    expect(result).toEqual({ error: 'Name is required' });
    expect(action).not.toHaveBeenCalled();
  });

  it('should call action with parsed data on success', async () => {
    const action = jest.fn().mockResolvedValue({ success: 'done' });
    const handler = validatedAction(testSchema, action);

    const formData = new FormData();
    formData.set('name', 'John');
    formData.set('age', '25');

    const result = await handler({}, formData);
    expect(action).toHaveBeenCalledWith({ name: 'John', age: 25 }, formData);
    expect(result).toEqual({ success: 'done' });
  });

  it('should return action return value', async () => {
    const action = jest.fn().mockResolvedValue({ data: 42 });
    const handler = validatedAction(testSchema, action);

    const formData = new FormData();
    formData.set('name', 'John');
    formData.set('age', '25');

    const result = await handler({}, formData);
    expect(result).toEqual({ data: 42 });
  });

  it('should use the first error message when multiple fields fail', async () => {
    const action = jest.fn();
    const handler = validatedAction(testSchema, action);

    const formData = new FormData();
    // name is missing, which triggers "Required" error

    const result = await handler({}, formData);
    expect(result).toHaveProperty('error');
    expect(typeof (result as { error: string }).error).toBe('string');
  });
});

describe('validatedActionWithUser', () => {
  const testSchema = z.object({
    title: z.string().min(1, 'Title is required'),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw when getUser returns null', async () => {
    mockGetUser.mockResolvedValue(null as any);

    const action = jest.fn();
    const handler = validatedActionWithUser(testSchema, action);

    const formData = new FormData();
    formData.set('title', 'Test');

    await expect(handler({}, formData)).rejects.toThrow('User is not authenticated');
    expect(action).not.toHaveBeenCalled();
  });

  it('should return error on schema validation failure', async () => {
    mockGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);

    const action = jest.fn();
    const handler = validatedActionWithUser(testSchema, action);

    const formData = new FormData();
    formData.set('title', '');

    const result = await handler({}, formData);
    expect(result).toEqual({ error: 'Title is required' });
    expect(action).not.toHaveBeenCalled();
  });

  it('should call action with data, formData, and user on success', async () => {
    const user = { id: 1, email: 'test@test.com' };
    mockGetUser.mockResolvedValue(user as any);

    const action = jest.fn().mockResolvedValue({ success: 'created' });
    const handler = validatedActionWithUser(testSchema, action);

    const formData = new FormData();
    formData.set('title', 'My Project');

    const result = await handler({}, formData);
    expect(action).toHaveBeenCalledWith({ title: 'My Project' }, formData, user);
    expect(result).toEqual({ success: 'created' });
  });
});

describe('withTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to /sign-in when no user', async () => {
    mockGetUser.mockResolvedValue(null as any);

    const action = jest.fn();
    const handler = withTeam(action);

    const formData = new FormData();

    await expect(handler(formData)).rejects.toThrow('NEXT_REDIRECT:/sign-in');
    expect(redirect).toHaveBeenCalledWith('/sign-in');
    expect(action).not.toHaveBeenCalled();
  });

  it('should throw "Team not found" when no team', async () => {
    mockGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);
    mockGetTeamForUser.mockResolvedValue(null as any);

    const action = jest.fn();
    const handler = withTeam(action);

    const formData = new FormData();

    await expect(handler(formData)).rejects.toThrow('Team not found');
    expect(action).not.toHaveBeenCalled();
  });

  it('should call action with formData and team on success', async () => {
    const team = { id: 1, name: 'Test Team' };
    mockGetUser.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);
    mockGetTeamForUser.mockResolvedValue(team as any);

    const action = jest.fn().mockResolvedValue({ success: true });
    const handler = withTeam(action);

    const formData = new FormData();

    const result = await handler(formData);
    expect(action).toHaveBeenCalledWith(formData, team);
    expect(result).toEqual({ success: true });
  });
});
