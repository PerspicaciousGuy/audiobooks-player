import AppShell from "@/components/application/AppShell";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
