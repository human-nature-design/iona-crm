-- =============================================================================
-- Initial Schema
-- Consolidated clean schema for the CRM boilerplate.
-- =============================================================================

-- =============================================================================
-- Extensions
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated, anon, service_role;

-- =============================================================================
-- Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100),
  "email" varchar(255) NOT NULL,
  "password_hash" text,
  "role" varchar(20) DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp,
  "supabase_auth_id" UUID UNIQUE,
  "theme" varchar(20),
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE INDEX IF NOT EXISTS idx_users_supabase_auth_id ON users(supabase_auth_id);

CREATE TABLE IF NOT EXISTS "teams" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(100) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "stripe_product_id" text,
  "plan_name" varchar(50),
  "subscription_status" varchar(20),
  "min_historical_similarity" varchar(10) DEFAULT '0.5',
  "min_historical_evaluation_rank" integer DEFAULT 4,
  "include_unrated_historical" boolean DEFAULT true,
  "ai_provider" varchar(50) DEFAULT 'anthropic' NOT NULL,
  "ai_model" varchar(100) DEFAULT 'claude-sonnet-4-5-20250929' NOT NULL,
  "onboarding_completed" boolean DEFAULT false NOT NULL,
  "onboarding_step" integer DEFAULT 0 NOT NULL,
  "used_example_data" boolean DEFAULT false,
  "example_data_industry" varchar(50),
  CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
  CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id"),
  CONSTRAINT valid_onboarding_step CHECK (onboarding_step >= 0 AND onboarding_step <= 4)
);

CREATE TABLE IF NOT EXISTS "team_members" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "role" varchar(50) NOT NULL,
  "joined_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "user_id" integer REFERENCES "users"("id") ON DELETE NO ACTION,
  "action" text NOT NULL,
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "ip_address" varchar(45)
);

CREATE TABLE IF NOT EXISTS "invitations" (
  "id" serial PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "email" varchar(255) NOT NULL,
  "role" varchar(50) NOT NULL,
  "invited_by" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "invited_at" timestamp DEFAULT now() NOT NULL,
  "status" varchar(20) DEFAULT 'pending' NOT NULL,
  "supabase_user_id" uuid
);

CREATE TABLE IF NOT EXISTS "organizations" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "description" text,
  "location" varchar(255),
  "website" varchar(255),
  "industry" varchar(100),
  "size" varchar(50),
  "status" varchar(20) DEFAULT 'Lead' NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "contacts" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer REFERENCES "organizations"("id") ON DELETE SET NULL,
  "name" varchar(255) NOT NULL,
  "email" varchar(255),
  "phone" varchar(50),
  "street" varchar(255),
  "city" varchar(100),
  "state" varchar(100),
  "zip" varchar(20),
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "collections" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "owner" varchar(255) NOT NULL,
  "product_features" jsonb DEFAULT '[]'::jsonb,
  "description" text,
  "icon" text,
  "urls" jsonb DEFAULT '[]'::jsonb,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

COMMENT ON COLUMN collections.urls IS 'Array of URL objects: [{ "label": string, "url": string, "type": "marketing" | "docs" | "support" | "other" }]';
COMMENT ON COLUMN collections.description IS 'Collection description for AI chat context';

CREATE TABLE IF NOT EXISTS "content_blocks" (
  "id" serial PRIMARY KEY NOT NULL,
  "block_number" varchar(50),
  "category" varchar(255),
  "title" text,
  "description" text,
  "last_updated" timestamp DEFAULT now() NOT NULL,
  "updated_by" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "vector" extensions.vector(1536),
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "collection_id" integer NOT NULL REFERENCES "collections"("id") ON DELETE NO ACTION,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "system_prompts" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "prompt" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chats" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "title" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "chat_id" integer NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE NO ACTION,
  "team_id" integer NOT NULL REFERENCES "teams"("id") ON DELETE NO ACTION,
  "role" varchar(50) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- activity_logs
CREATE INDEX idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- chats
CREATE INDEX idx_chats_team_id ON chats(team_id);

-- contacts
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_team_id ON contacts(team_id);

-- organizations
CREATE INDEX idx_organizations_team_id ON organizations(team_id);
CREATE INDEX idx_organizations_user_id ON organizations(user_id);

-- content_blocks
CREATE INDEX idx_content_blocks_collection_id ON content_blocks(collection_id);
CREATE INDEX idx_content_blocks_team_id ON content_blocks(team_id);
CREATE INDEX idx_content_blocks_updated_by ON content_blocks(updated_by);

-- collections
CREATE INDEX idx_collections_team_id ON collections(team_id);

-- invitations
CREATE INDEX idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX idx_invitations_team_id ON invitations(team_id);

-- messages
CREATE INDEX idx_messages_team_id ON messages(team_id);

-- system_prompts
CREATE INDEX idx_system_prompts_team_id ON system_prompts(team_id);

-- team_members
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- =============================================================================
-- Roles
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_authenticated') THEN
    CREATE ROLE app_authenticated NOLOGIN;
  END IF;
END
$$;

ALTER ROLE app_authenticated NOBYPASSRLS;

GRANT USAGE ON SCHEMA public TO app_authenticated;
GRANT USAGE ON SCHEMA extensions TO app_authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_authenticated;

GRANT USAGE ON SCHEMA auth TO app_authenticated;
GRANT EXECUTE ON FUNCTION auth.uid() TO app_authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt() TO app_authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'CHANGE_ME_IN_SUPABASE_DASHBOARD';
  END IF;
END
$$;

GRANT app_authenticated TO app_user;
ALTER ROLE app_user NOBYPASSRLS;

COMMENT ON ROLE app_authenticated IS 'Application role that respects RLS. Use for all user-facing queries.';
COMMENT ON ROLE app_user IS 'Login role for application DATABASE_URL. Inherits from app_authenticated.';

-- =============================================================================
-- Helper Functions (RLS support)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    BEGIN
      user_uuid := current_setting('request.jwt.claim.sub', TRUE)::uuid;
    EXCEPTION WHEN OTHERS THEN
      user_uuid := NULL;
    END;
  END IF;
  RETURN user_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_user_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  app_user_id integer;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    BEGIN
      user_uuid := current_setting('request.jwt.claim.sub', TRUE)::uuid;
    EXCEPTION WHEN OTHERS THEN
      user_uuid := NULL;
    END;
  END IF;
  IF user_uuid IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO app_user_id FROM users WHERE supabase_auth_id = user_uuid LIMIT 1;
  RETURN app_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  member_count integer;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    BEGIN
      user_uuid := current_setting('request.jwt.claim.sub', TRUE)::uuid;
    EXCEPTION WHEN OTHERS THEN
      user_uuid := NULL;
    END;
  END IF;
  IF user_uuid IS NULL THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO member_count
  FROM team_members tm
  JOIN users u ON tm.user_id = u.id
  WHERE tm.team_id = check_team_id AND u.supabase_auth_id = user_uuid;
  RETURN member_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_active_team_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  active_team_id integer;
BEGIN
  user_uuid := auth.uid();
  IF user_uuid IS NULL THEN
    BEGIN
      user_uuid := current_setting('request.jwt.claim.sub', TRUE)::uuid;
    EXCEPTION WHEN OTHERS THEN
      user_uuid := NULL;
    END;
  END IF;
  IF user_uuid IS NULL THEN RETURN NULL; END IF;
  SELECT tm.team_id INTO active_team_id
  FROM team_members tm
  JOIN users u ON tm.user_id = u.id
  WHERE u.supabase_auth_id = user_uuid
  ORDER BY tm.joined_at ASC
  LIMIT 1;
  RETURN active_team_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_auth_user_id() TO authenticated, app_authenticated;
GRANT EXECUTE ON FUNCTION public.get_app_user_id() TO authenticated, app_authenticated;
GRANT EXECUTE ON FUNCTION public.is_team_member(integer) TO authenticated, app_authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_team_id() TO authenticated, app_authenticated;

-- =============================================================================
-- Auth Hook (JWT custom claims)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claims jsonb;
  app_user_id integer;
  team_ids integer[];
  active_team_id integer;
  user_role text;
BEGIN
  SELECT u.id, u.role INTO app_user_id, user_role
  FROM public.users u
  WHERE u.supabase_auth_id = (event->>'user_id')::uuid
  LIMIT 1;

  IF app_user_id IS NULL THEN
    RETURN event;
  END IF;

  SELECT ARRAY_AGG(tm.team_id) INTO team_ids
  FROM public.team_members tm
  WHERE tm.user_id = app_user_id;

  IF team_ids IS NOT NULL AND array_length(team_ids, 1) > 0 THEN
    active_team_id := team_ids[1];
  END IF;

  claims := coalesce(event->'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{app_user_id}', to_jsonb(app_user_id));
  claims := jsonb_set(claims, '{team_ids}', to_jsonb(team_ids));
  claims := jsonb_set(claims, '{active_team_id}', to_jsonb(active_team_id));
  claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
  event := jsonb_set(event, '{claims}', claims);

  RETURN event;
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM PUBLIC;

-- NOTE: After applying this migration, enable the hook in Supabase Dashboard:
-- Authentication > Hooks > "Customize Access Token" > public.custom_access_token_hook

-- =============================================================================
-- RPC Functions
-- =============================================================================

CREATE FUNCTION search_similar_blocks(
  p_query_vector text,
  p_team_id integer,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id integer,
  collection_id integer,
  block_number text,
  category text,
  title text,
  description text,
  similarity double precision
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  query_vec extensions.vector(1536);
BEGIN
  query_vec := p_query_vector::extensions.vector(1536);
  RETURN QUERY
  SELECT
    cb.id,
    cb.collection_id,
    cb.block_number::text,
    cb.category::text,
    cb.title::text,
    cb.description::text,
    1 - (cb.vector <=> query_vec) AS similarity
  FROM content_blocks cb
  WHERE cb.team_id = p_team_id AND cb.vector IS NOT NULL
  ORDER BY cb.vector <=> query_vec
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION search_similar_blocks(text, integer, integer) TO authenticated, anon;

CREATE FUNCTION update_block_embedding(
  p_block_id integer,
  p_vector extensions.vector
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  UPDATE content_blocks SET vector = p_vector, last_updated = NOW() WHERE id = p_block_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION update_block_embedding(integer, extensions.vector) TO authenticated, anon;

-- =============================================================================
-- Row Level Security
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "team_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "activity_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invitations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "collections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "system_prompts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- users: can see own record + teammates; modify only own record
CREATE POLICY "users_select_team_members" ON "users"
  FOR SELECT USING (
    supabase_auth_id = public.get_auth_user_id()
    OR id IN (
      SELECT tm2.user_id FROM team_members tm1
      JOIN team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.user_id = public.get_app_user_id()
    )
  );

CREATE POLICY "users_modify_own" ON "users"
  FOR INSERT WITH CHECK (supabase_auth_id = public.get_auth_user_id());

CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE
  USING (supabase_auth_id = public.get_auth_user_id())
  WITH CHECK (supabase_auth_id = public.get_auth_user_id());

CREATE POLICY "users_delete_own" ON "users"
  FOR DELETE USING (supabase_auth_id = public.get_auth_user_id());

-- teams
CREATE POLICY "teams_member_access" ON "teams"
  FOR ALL
  USING (public.is_team_member(id))
  WITH CHECK (public.is_team_member(id));

-- All other team-scoped tables use the same pattern
CREATE POLICY "team_members_team_isolation" ON "team_members"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "activity_logs_team_isolation" ON "activity_logs"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "invitations_team_isolation" ON "invitations"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "organizations_team_isolation" ON "organizations"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "contacts_team_isolation" ON "contacts"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "collections_team_isolation" ON "collections"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "content_blocks_team_isolation" ON "content_blocks"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "system_prompts_team_isolation" ON "system_prompts"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "chats_team_isolation" ON "chats"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

CREATE POLICY "messages_team_isolation" ON "messages"
  FOR ALL USING (public.is_team_member(team_id)) WITH CHECK (public.is_team_member(team_id));

-- Grant permissions to app_authenticated role for contacts
GRANT SELECT, INSERT, UPDATE, DELETE ON contacts TO app_authenticated;
GRANT USAGE, SELECT ON SEQUENCE contacts_id_seq TO app_authenticated;
