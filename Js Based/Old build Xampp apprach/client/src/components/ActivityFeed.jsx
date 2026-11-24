import { formatRelativeTime } from "../utils";

const STATUS_META = {
  good: { icon: "●", label: "Success", className: "status--good" },
  warning: { icon: "▲", label: "Warning", className: "status--warning" },
  critical: { icon: "✕", label: "Critical", className: "status--critical" },
};

export default function ActivityFeed({ items }) {
  return (
    <div className="chart activity">
      <div className="chart__header">
        <h3>Recent activity</h3>
      </div>
      <ul className="activity__list">
        {items.map((item) => {
          const meta = STATUS_META[item.status] ?? STATUS_META.good;
          return (
            <li key={item.id} className="activity__item">
              <span className={`status-dot ${meta.className}`} aria-hidden="true">
                {meta.icon}
              </span>
              <div className="activity__body">
                <p className="activity__label">{item.label}</p>
                <p className="activity__meta">
                  {meta.label} · {formatRelativeTime(item.timestamp)}
                  {item.amount != null ? ` · $${item.amount}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
