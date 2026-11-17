import { AdminShell } from "@/components/layout/app-sidebar";
import { AuthGuard } from "./auth-guard";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
