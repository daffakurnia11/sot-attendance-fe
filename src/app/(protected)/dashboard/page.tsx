const stats = [
  { label: "Attendance rate", value: "—", note: "No attendance data yet" },
  { label: "Active hours", value: "—", note: "Activity sync pending" },
  { label: "Current streak", value: "—", note: "Complete first attendance" },
];

export default function DashboardPage() {
  return (
    <div className="dashboard-content">
      <div className="dashboard-heading">
        <p className="dashboard-eyebrow">Member overview</p>
        <h1>Dashboard</h1>
        <p>Attendance and FiveM activity summary.</p>
      </div>

      <section className="dashboard-stats" aria-label="Attendance summary">
        {stats.map((stat) => (
          <article className="dashboard-card" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.note}</span>
          </article>
        ))}
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="dashboard-eyebrow">Recent activity</p>
          <h2>No activity recorded</h2>
          <p>Your FiveM activity will appear here after backend sync.</p>
        </div>
        <span className="dashboard-panel-mark" aria-hidden="true">SOT</span>
      </section>
    </div>
  );
}
