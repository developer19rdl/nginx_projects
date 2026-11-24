import { formatDelta } from "../utils";

// `deltaGoodDirection`: "up" if a rising number is good (revenue, users),
// "down" if a rising number is bad. Drives the delta's color.
export default function StatTile({ label, value, deltaPct, deltaGoodDirection = "up" }) {
  const hasDelta = typeof deltaPct === "number" && !Number.isNaN(deltaPct);
  const isUp = deltaPct > 0;
  const isGood = hasDelta && (deltaGoodDirection === "up" ? isUp : !isUp) && deltaPct !== 0;
  const isBad = hasDelta && (deltaGoodDirection === "up" ? !isUp : isUp) && deltaPct !== 0;

  return (
    <div className="stat-tile">
      <p className="stat-tile__label">{label}</p>
      <p className="stat-tile__value">{value}</p>
      {hasDelta && (
        <p
          className={
            "stat-tile__delta" +
            (isGood ? " stat-tile__delta--good" : isBad ? " stat-tile__delta--bad" : "")
          }
        >
          <span aria-hidden="true">{isUp ? "▲" : deltaPct < 0 ? "▼" : "–"}</span>
          {formatDelta(deltaPct)}
          <span className="stat-tile__delta-label">vs last period</span>
        </p>
      )}
    </div>
  );
}
