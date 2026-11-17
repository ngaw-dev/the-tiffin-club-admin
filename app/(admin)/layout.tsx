// All admin pages are Client Components that fetch data in the browser, so
// navigations into them block on the API by design. Opt the whole admin
// tree out of instant-navigation validation (see instant-navigation guide,
// "Opting out"). `instant` must be set on a server segment, not the pages.
export const instant = false;

import { AdminShell } from "@/components/layout/app-sidebar";
import { AuthGuard } from "./auth-guard";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
