import { useEffect, useState } from "react";
import "./App.css";
import { fetchDashboardData } from "./api";
import { formatCurrency, formatCompactNumber } from "./utils";
import StatTile from "./components/StatTile";
import RevenueTrendChart from "./components/RevenueTrendChart";
import CategoryBarChart from "./components/CategoryBarChart";
import ActivityFeed from "./components/ActivityFeed";

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  function loadDashboard() {
    setLoading(true);
    setError(null);
    fetchDashboardData()
      .then(setDashboard)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1>Dashboard</h1>
          <p className="app__subtitle">An overview of store performance</p>
        </div>
        <button className="app__refresh" onClick={loadDashboard} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div className="app__error">
          Couldn't load dashboard data: {error}. Is the backend running on port 5000?
        </div>
      )}

      {!error && !dashboard && <div className="app__loading">Loading dashboard…</div>}

      {dashboard && (
        <>
          <section className="stat-grid">
            <StatTile
              label="Total revenue"
              value={formatCurrency(dashboard.stats.totalRevenue)}
              deltaPct={dashboard.stats.revenueDeltaPct}
              deltaGoodDirection="up"
            />
            <StatTile
              label="Total orders"
              value={formatCompactNumber(dashboard.stats.totalOrders)}
              deltaPct={dashboard.stats.ordersDeltaPct}
              deltaGoodDirection="up"
            />
            <StatTile
              label="Active users"
              value={formatCompactNumber(dashboard.stats.activeUsers)}
              deltaPct={dashboard.stats.usersDeltaPct}
              deltaGoodDirection="up"
            />
            <StatTile
              label="Conversion rate"
              value={`${dashboard.stats.conversionRate}%`}
              deltaPct={dashboard.stats.conversionDeltaPct}
              deltaGoodDirection="up"
            />
          </section>

          <section className="chart-grid">
            <RevenueTrendChart data={dashboard.revenueTrend} />
            <CategoryBarChart data={dashboard.salesByCategory} />
          </section>

          <section>
            <ActivityFeed items={dashboard.activity} />
          </section>
        </>
      )}
    </div>
  );
}
