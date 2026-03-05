// Re-export Supabase types as the source of truth
import { Database } from './database.types';

// Helper types for cleaner imports
type Tables = Database['public']['Tables'];

// Row types (snake_case - matches database)
export type User = Tables['users']['Row'];
export type Team = Tables['teams']['Row'];
export type TeamMember = Tables['team_members']['Row'];
export type ActivityLog = Tables['activity_logs']['Row'];
export type Invitation = Tables['invitations']['Row'];
export type Organization = Tables['organizations']['Row'];
export type Contact = Tables['contacts']['Row'];
export type Collection = Tables['collections']['Row'];
export type ContentBlock = Tables['content_blocks']['Row'];
export type Chat = Tables['chats']['Row'];
export type Message = Tables['messages']['Row'];
export type SystemPrompt = Tables['system_prompts']['Row'];

// Insert types
export type NewUser = Tables['users']['Insert'];
export type NewTeam = Tables['teams']['Insert'];
export type NewTeamMember = Tables['team_members']['Insert'];
export type NewActivityLog = Tables['activity_logs']['Insert'];
export type NewInvitation = Tables['invitations']['Insert'];
export type NewOrganization = Tables['organizations']['Insert'];
export type NewContact = Tables['contacts']['Insert'];
export type NewCollection = Tables['collections']['Insert'];
export type NewContentBlock = Tables['content_blocks']['Insert'];
export type NewChat = Tables['chats']['Insert'];
export type NewMessage = Tables['messages']['Insert'];
export type NewSystemPrompt = Tables['system_prompts']['Insert'];

// Complex composite types
export type TeamDataWithMembers = Team & {
  team_members: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// Activity type enum (keep as-is, not database-related)
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_FEATURE = 'CREATE_FEATURE',
  UPDATE_FEATURE = 'UPDATE_FEATURE',
  DELETE_FEATURE = 'DELETE_FEATURE',
  BULK_IMPORT_FEATURES = 'BULK_IMPORT_FEATURES',
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
  UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  CREATE_CONTACT = 'CREATE_CONTACT',
  UPDATE_CONTACT = 'UPDATE_CONTACT',
  DELETE_CONTACT = 'DELETE_CONTACT',
}

// Re-export Database type
export type { Database };
