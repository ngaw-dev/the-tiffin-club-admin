import { AdminShell } from "@/components/layout/app-sidebar";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return <AdminShell>{children}</AdminShell>;
}
