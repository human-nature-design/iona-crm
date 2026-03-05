import { getUser } from '@/lib/db/supabase-queries';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
