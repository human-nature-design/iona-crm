'use client';

import { Lock, Trash2, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { updatePassword, deleteAccount } from '@/app/(login)/actions';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityForm({ hasPassword }: { hasPassword: boolean }) {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<
    PasswordState,
    FormData
  >(updatePassword, {});

  const [deleteState, deleteAction, isDeletePending] = useActionState<
    DeleteState,
    FormData
  >(deleteAccount, {});

  return (
    <section className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-10 text-foreground">
        Security Settings
      </h1>
      {hasPassword && (
        <div className="mb-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-5 text-foreground">Password</h2>
          <form className="space-y-6" action={passwordAction}>
            <div>
              <label htmlFor="current-password" className="block mb-2 text-sm font-medium text-foreground">
                Current Password
              </label>
              <input
                id="current-password"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.currentPassword}
                className="w-full px-3 py-2 border border-border bg-background rounded text-sm transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block mb-2 text-sm font-medium text-foreground">
                New Password
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.newPassword}
                className="w-full px-3 py-2 border border-border bg-background rounded text-sm transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-foreground">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={passwordState.confirmPassword}
                className="w-full px-3 py-2 border border-border bg-background rounded text-sm transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            {passwordState.error && (
              <p className="text-destructive text-sm">{passwordState.error}</p>
            )}
            {passwordState.success && (
              <p className="text-green-600 text-sm">{passwordState.success}</p>
            )}
            <button
              type="submit"
              className="bg-primary text-primary-foreground border-none px-6 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isPasswordPending}
            >
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-5 text-foreground">Delete Account</h2>
        <p className="text-sm text-muted-foreground mb-2">
          This will permanently delete your account, your team, and all associated data including products, features, organizations, contacts, chats, and messages.
        </p>
        <p className="text-sm font-medium text-destructive mb-6">
          This action cannot be undone.
        </p>
        <form action={deleteAction} className="space-y-6">
          {hasPassword ? (
            <div>
              <label htmlFor="delete-password" className="block mb-2 text-sm font-medium text-foreground">
                Confirm password
              </label>
              <input
                id="delete-password"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={100}
                defaultValue={deleteState.password}
                className="w-full px-3 py-2 border border-border bg-background rounded text-sm transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          ) : (
            <div>
              <label htmlFor="delete-confirmation" className="block mb-2 text-sm font-medium text-foreground">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                id="delete-confirmation"
                name="confirmation"
                type="text"
                required
                autoComplete="off"
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-border bg-background rounded text-sm transition-colors duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          )}
          {deleteState.error && (
            <p className="text-destructive text-sm">{deleteState.error}</p>
          )}
          <button
            type="submit"
            className="bg-destructive text-destructive-foreground border-none px-6 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors duration-200 hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isDeletePending}
          >
            {isDeletePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
