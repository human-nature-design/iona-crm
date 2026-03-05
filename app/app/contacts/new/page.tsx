import { redirect } from 'next/navigation';
import { getUser, getTeamForUser, getOrganizationsForTeam } from '@/lib/db/supabase-queries';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CreateContactForm } from './create-contact-form';

export default async function NewContactPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  const team = await getTeamForUser();
  if (!team) {
    redirect('/login');
  }

  const organizations = await getOrganizationsForTeam(team.id);

  const breadcrumbItems = [
    { label: 'All contacts', href: '/app/contacts' },
    { label: 'New contact', isCurrentPage: true },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 w-full">
        <Breadcrumb items={breadcrumbItems} />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Add new contact</h1>
          <p className="text-muted-foreground">
            Add a new contact and optionally link them to an organization
          </p>
        </div>

        <CreateContactForm organizations={organizations} />
      </div>
    </div>
  );
}
