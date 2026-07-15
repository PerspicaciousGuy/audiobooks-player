import AppShell from "@/components/application/AppShell";
import { requireAuthenticatedIdentity } from "@/features/auth/session";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

export default async function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  const identity = await requireAuthenticatedIdentity("/app");

  return <AppShell identity={identity}>{children}</AppShell>;
}
