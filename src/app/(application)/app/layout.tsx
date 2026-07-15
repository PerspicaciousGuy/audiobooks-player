import AppShell from "@/components/application/AppShell";
import { requireAuthenticatedIdentity } from "@/features/auth/session";
import { getUserPreferences } from "@/features/preferences/repository";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const identity = await requireAuthenticatedIdentity("/app");
  const preferences = await getUserPreferences();

  return (
    <AppShell identity={identity} preferences={preferences}>
      {children}
    </AppShell>
  );
}
