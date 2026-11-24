// Mock data for the dashboard. In a real app this would come from a database.

const CATEGORIES = ["Electronics", "Apparel", "Home & Living", "Sports", "Books"];

const ACTIVITY_TEMPLATES = [
  { type: "order", label: "New order placed", status: "good" },
  { type: "signup", label: "New user signed up", status: "good" },
  { type: "refund", label: "Refund issued", status: "warning" },
  { type: "payment", label: "Payment failed", status: "critical" },
  { type: "review", label: "New product review", status: "good" },
];

function randomBetween(min, max) {
  return Math.round(min + Math.random() * (max - min));
}

// Deterministic-ish seeded trend so the dashboard doesn't jump around wildly
// on every refresh, while still feeling "live".
function buildRevenueTrend(days = 14) {
  const points = [];
  let base = 4200;
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    base += randomBetween(-350, 500);
    base = Math.max(base, 1500);
    points.push({
      date: date.toISOString().slice(0, 10),
      value: Math.round(base),
    });
  }
  return points;
}

function buildSalesByCategory() {
  return CATEGORIES.map((name) => ({
    category: name,
    value: randomBetween(1200, 9800),
  }));
}

function buildActivity(count = 6) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const template = ACTIVITY_TEMPLATES[randomBetween(0, ACTIVITY_TEMPLATES.length - 1)];
    return {
      id: now - i * 1000 * 60 * randomBetween(3, 40),
      ...template,
      timestamp: new Date(now - i * 1000 * 60 * randomBetween(3, 40)).toISOString(),
      amount: template.type === "order" || template.type === "refund"
        ? randomBetween(20, 480)
        : null,
    };
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function getDashboardData() {
  const trend = buildRevenueTrend();
  const totalRevenue = trend.reduce((sum, p) => sum + p.value, 0);
  const previousPeriodRevenue = Math.round(totalRevenue * (0.85 + Math.random() * 0.1));

  return {
    stats: {
      totalRevenue,
      revenueDeltaPct: Number(
        (((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100).toFixed(1)
      ),
      totalOrders: randomBetween(320, 890),
      ordersDeltaPct: Number((randomBetween(-80, 220) / 10).toFixed(1)),
      activeUsers: randomBetween(1800, 5400),
      usersDeltaPct: Number((randomBetween(-40, 180) / 10).toFixed(1)),
      conversionRate: Number((1.5 + Math.random() * 3).toFixed(2)),
      conversionDeltaPct: Number((randomBetween(-60, 90) / 10).toFixed(1)),
    },
    revenueTrend: trend,
    salesByCategory: buildSalesByCategory(),
    activity: buildActivity(),
  };
}
