const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE_URL}/api/dashboard`);
  if (!res.ok) {
    throw new Error(`Dashboard API request failed with status ${res.status}`);
  }
  return res.json();
}
