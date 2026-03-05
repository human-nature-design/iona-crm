import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/supabase-queries';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CreateOrganizationForm } from './create-organization-form';

export default async function NewOrganizationPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const team = await getTeamForUser();
  if (!team) {
    redirect('/login');
  }

  const breadcrumbItems = [
    { label: 'All organizations', href: '/app/organizations' },
    { label: 'New organization', isCurrentPage: true },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        <Breadcrumb items={breadcrumbItems} />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create new organization</h1>
          <p className="text-muted-foreground">
            Add a new organization to track opportunities and manage relationships
          </p>
        </div>

        <CreateOrganizationForm />
      </div>
    </div>
  );
}
