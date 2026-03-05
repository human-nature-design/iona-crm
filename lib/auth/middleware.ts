import { z } from 'zod';
import { TeamDataWithMembers } from '@/lib/db/schema';
import { getTeamForUser, getUser, User } from '@/lib/db/supabase-queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message };
    }

    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    try {
      console.log('🔍 Middleware: Starting validation');
      
      const user = await getUser();
      if (!user) {
        console.error('❌ Middleware: No user found');
        throw new Error('User is not authenticated');
      }

      console.log('✅ Middleware: User authenticated, parsing FormData');
      const formEntries = Object.fromEntries(formData);
      console.log('📋 Middleware: FormData keys:', Object.keys(formEntries));

      const result = schema.safeParse(formEntries);
      if (!result.success) {
        console.error('❌ Middleware: Schema validation failed:', result.error.errors);
        return { error: result.error.errors[0].message };
      }

      console.log('✅ Middleware: Schema valid, calling action');
      return await action(result.data, formData, user);
    } catch (error) {
      console.error('❌ Middleware: Unexpected error:', error);
      throw error;
    }
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;

export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      redirect('/sign-in');
    }

    const team = await getTeamForUser();
    if (!team) {
      throw new Error('Team not found');
    }

    return action(formData, team);
  };
}
