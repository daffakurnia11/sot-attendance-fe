import { PageHeader } from "@/components/atoms";

type DashboardPageProps = Readonly<{
  children?: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}>;

export function DashboardPage({ children, description, eyebrow, title }: DashboardPageProps) {
  return (
    <div className="w-full px-3.5 pt-6 pb-9 sm:px-6 sm:pt-[30px] sm:pb-11">
      <PageHeader description={description} eyebrow={eyebrow} title={title} />
      {children}
    </div>
  );
}
