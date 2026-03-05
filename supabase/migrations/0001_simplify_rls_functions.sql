-- =============================================================================
-- Simplify RLS Helper Functions
-- Remove direct Postgres connection fallback (request.jwt.claim.sub).
-- All database access now goes through the Supabase Data API only.
-- =============================================================================

-- =============================================================================
-- 1. Simplify helper functions (remove request.jwt.claim.sub fallback)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_user_id()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_user_id integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT id INTO app_user_id FROM users WHERE supabase_auth_id = auth.uid() LIMIT 1;
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
  member_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
  SELECT COUNT(*) INTO member_count
  FROM team_members tm
  JOIN users u ON tm.user_id = u.id
  WHERE tm.team_id = check_team_id AND u.supabase_auth_id = auth.uid();
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
  active_team_id integer;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  SELECT tm.team_id INTO active_team_id
  FROM team_members tm
  JOIN users u ON tm.user_id = u.id
  WHERE u.supabase_auth_id = auth.uid()
  ORDER BY tm.joined_at ASC
  LIMIT 1;
  RETURN active_team_id;
END;
$$;

-- =============================================================================
-- 2. Revoke grants from app_authenticated
-- =============================================================================

-- Revoke function execution
REVOKE EXECUTE ON FUNCTION public.get_auth_user_id() FROM app_authenticated;
REVOKE EXECUTE ON FUNCTION public.get_app_user_id() FROM app_authenticated;
REVOKE EXECUTE ON FUNCTION public.is_team_member(integer) FROM app_authenticated;
REVOKE EXECUTE ON FUNCTION public.get_active_team_id() FROM app_authenticated;

-- Revoke table and sequence access
REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM app_authenticated;
REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM app_authenticated;

-- Revoke schema access
REVOKE USAGE ON SCHEMA public FROM app_authenticated;
REVOKE USAGE ON SCHEMA extensions FROM app_authenticated;
REVOKE USAGE ON SCHEMA auth FROM app_authenticated;
REVOKE EXECUTE ON FUNCTION auth.uid() FROM app_authenticated;
REVOKE EXECUTE ON FUNCTION auth.jwt() FROM app_authenticated;

-- Revoke default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM app_authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM app_authenticated;

-- =============================================================================
-- 3. Drop roles (order matters: app_user inherits from app_authenticated)
-- =============================================================================

-- Reassign owned objects before dropping (required by PostgreSQL)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    REVOKE app_authenticated FROM app_user;
    DROP ROLE app_user;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_authenticated') THEN
    DROP ROLE app_authenticated;
  END IF;
END
$$;

