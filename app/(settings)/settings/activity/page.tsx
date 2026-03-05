import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  Package,
  Edit,
  Trash2,
  Upload,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/supabase-queries';

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.CREATE_FEATURE]: Package,
  [ActivityType.UPDATE_FEATURE]: Edit,
  [ActivityType.DELETE_FEATURE]: Trash2,
  [ActivityType.BULK_IMPORT_FEATURES]: Upload,
  [ActivityType.CREATE_ORGANIZATION]: Building2,
  [ActivityType.UPDATE_ORGANIZATION]: Edit,
  [ActivityType.DELETE_ORGANIZATION]: Trash2,
  [ActivityType.CREATE_CONTACT]: UserPlus,
  [ActivityType.UPDATE_CONTACT]: Edit,
  [ActivityType.DELETE_CONTACT]: UserMinus,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    case ActivityType.CREATE_FEATURE:
      return 'You created a product feature';
    case ActivityType.UPDATE_FEATURE:
      return 'You updated a product feature';
    case ActivityType.DELETE_FEATURE:
      return 'You deleted a product feature';
    case ActivityType.BULK_IMPORT_FEATURES:
      return 'You imported product features';
    case ActivityType.CREATE_ORGANIZATION:
      return 'You created an organization';
    case ActivityType.UPDATE_ORGANIZATION:
      return 'You updated an organization';
    case ActivityType.DELETE_ORGANIZATION:
      return 'You deleted an organization';
    case ActivityType.CREATE_CONTACT:
      return 'You created a contact';
    case ActivityType.UPDATE_CONTACT:
      return 'You updated a contact';
    case ActivityType.DELETE_CONTACT:
      return 'You deleted a contact';
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-10 text-foreground">
        Activity Log
      </h1>
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-5 text-foreground">Recent Activity</h2>
        {logs.length > 0 ? (
          <ul className="space-y-4">
            {logs.map((log) => {
              const Icon = iconMap[log.action as ActivityType] || Settings;
              const formattedAction = formatAction(
                log.action as ActivityType
              );

              return (
                <li key={log.id} className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
                  <div className="bg-primary p-2 rounded">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base text-foreground">
                      {formattedAction}
                      {log.ip_address && ` from IP ${log.ip_address}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getRelativeTime(new Date(log.timestamp))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Activity Yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              When you perform actions like signing in or updating your
              account, they'll appear here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
