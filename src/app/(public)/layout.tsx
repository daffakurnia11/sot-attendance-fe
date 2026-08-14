import { AuthLayout } from "@/components/templates";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return <AuthLayout>{children}</AuthLayout>;
}
