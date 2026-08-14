export default function ActivityPage() {
  return <EmptySection title="My Activity" description="FiveM activity history will appear here." />;
}

function EmptySection({ title, description }: { title: string; description: string }) {
  return <div className="dashboard-content"><div className="dashboard-heading"><p className="dashboard-eyebrow">Member records</p><h1>{title}</h1><p>{description}</p></div></div>;
}
