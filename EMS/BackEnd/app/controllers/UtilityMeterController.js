
require('dotenv').config();
const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const TZ = 'Asia/Kolkata';

// ── Derive monthly table name (mirrors Cronjob monthly_table_creator) ─────────
const getUtilityTableName = (dateString) => {
    const ym = dateString.substring(0, 7).replace('-', '_');
    return `utility_meter_data_${ym}`;
};

exports.store = async (req, res) => {
  try {
    const c = req.body;

    // Scoped to (deviceId, slaveId, meterType, meterName) — not just
    // (deviceId, slaveId, meterType) — because a single combo sensor commonly
    // reports more than one reading (e.g. Temperature + Humidity) on the same
    // slave address, each needing its own utility_meters row. A second meter
    // of the SAME type on the same device+slave is only a genuine duplicate
    // if it also shares the same meterName.
    const [dup] = await connection.execute(
      `SELECT id FROM utility_meters WHERE deviceId = ? AND slaveId = ? AND meterType = ? AND meterName = ?`,
      [c.deviceId, c.slaveId, c.meterType, c.meterName]
    );
    if (dup.length > 0) {
      throw new Error(`Duplicate entry: a ${c.meterType} meter named "${c.meterName}" is already allocated on this device and slave Id`);
    }

    const [result] = await connection.execute(
      `INSERT INTO utility_meters (plantId, buildingId, meterName, meterType, meterTypeId, category, deviceId, slaveId, uamSet, threshold, minLimit, maxLimit, alertEnabled, alertCount, alertResetCount, emailAlert, smsAlert, latchAlert, displayMeter, counter_value)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.plantId, c.buildingId || null, c.meterName, c.meterType, c.meterTypeId || null, c.category || null, c.deviceId, c.slaveId, c.uamSet, c.threshold, c.minLimit === '' || c.minLimit == null ? null : c.minLimit, c.maxLimit === '' || c.maxLimit == null ? null : c.maxLimit, c.alertEnabled ? 1 : 0, c.alertCount || 5, c.alertResetCount === '' || c.alertResetCount == null ? null : c.alertResetCount, c.emailAlert ? 1 : 0, c.smsAlert ? 1 : 0, c.latchAlert ? 1 : 0, c.displayMeter === false || c.displayMeter === 0 ? 0 : 1, c.counterValue ?? null]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Utility meter added successfully' });
    }
    throw new Error('Something went wrong');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.show = async (req, res) => {
  try {
    // liveMeterType is read via meterTypeId -> meter_type_master so a rename in the
    // Meter Type CRUD shows up immediately wherever it's used for display. um.meterType
    // (the raw copied string) is left untouched — Water.js / PlantOverviewConsumptionPanel.js /
    // MeterBindingDialog.js hardcode-match that exact string, so it can't be changed here.
    const [rows] = await connection.execute(
      `SELECT
          um.*,
          COALESCE(mtm.meterType, um.meterType) AS liveMeterType,
          pm.plantName,
          b.buildingName,
          ed.edgeDeviceName
       FROM utility_meters um
       LEFT JOIN meter_type_master mtm ON mtm.id = um.meterTypeId
       LEFT JOIN plant_master pm ON pm.id = um.plantId
       LEFT JOIN buildings b ON b.id = um.buildingId
       LEFT JOIN edge_devices ed ON ed.id = um.deviceId`
    );

    if (rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Utility Meter List', data: rows });
    }
    return res.status(404).json({ success: false, message: 'No utility meters found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

// ── dropdown — lightweight {id, displayName} list for filter selects ──────────
exports.dropdown = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      `SELECT id, meterName AS displayName FROM utility_meters ORDER BY meterName`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.update = async (req, res) => {
  try {
    const c = req.body;
    const { id } = req.params;

    // Same (deviceId, slaveId, meterType, meterName) scoping as store() — see comment there.
    const [existing] = await connection.execute(
      `SELECT id FROM utility_meters WHERE deviceId = ? AND slaveId = ? AND meterType = ? AND meterName = ? AND id <> ?`,
      [c.deviceId, c.slaveId, c.meterType, c.meterName, id]
    );
    if (existing.length > 0) {
      throw new Error(`A ${c.meterType} meter named "${c.meterName}" is already allocated to another utility meter on this device and slave Id`);
    }

    const [result] = await connection.execute(
      `UPDATE utility_meters
       SET plantId = ?, buildingId = ?, meterName = ?, meterType = ?, meterTypeId = ?, category = ?,
           deviceId = ?, slaveId = ?, uamSet = ?, threshold = ?, minLimit = ?, maxLimit = ?,
           alertEnabled = ?, alertCount = ?, alertResetCount = ?, emailAlert = ?, smsAlert = ?, latchAlert = ?,
           displayMeter = ?, counter_value = ?
       WHERE id = ?`,
      [c.plantId, c.buildingId || null, c.meterName, c.meterType, c.meterTypeId || null, c.category || null, c.deviceId, c.slaveId, c.uamSet, c.threshold, c.minLimit === '' || c.minLimit == null ? null : c.minLimit, c.maxLimit === '' || c.maxLimit == null ? null : c.maxLimit, c.alertEnabled ? 1 : 0, c.alertCount || 5, c.alertResetCount === '' || c.alertResetCount == null ? null : c.alertResetCount, c.emailAlert ? 1 : 0, c.smsAlert ? 1 : 0, c.latchAlert ? 1 : 0, c.displayMeter === false || c.displayMeter === 0 ? 0 : 1, c.counterValue ?? null, id]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Utility meter updated successfully' });
    }
    throw new Error('Update failed, no rows affected');
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute(`DELETE FROM utility_meters WHERE id = ?`, [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    }
    return res.status(404).json({ success: false, message: 'Utility meter not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

// utility_meter_live_data + utility_meter_data_YYYY_MM are populated by the
// counter-type meter pipeline (Water/Gas/Fuel/... open-close readings) — they
// never get a row for the calibrated instantaneous "environmental" sensor
// types (Temperature/Humidity/CO2/Pressure), so those meters always showed
// "actual: null" on the Utility Dashboard even though the sensor is live.
// Mirrors SensorNodeDetail.js's SENSOR_META/pickTag keyword matching, and
// reads the same live_tag_snapshot table dashboardController.getTagLiveValue
// uses — the canonical "latest value" source for these sensors.
const ENV_SENSOR_TYPES = ['Temperature', 'Humidity', 'CO2', 'Pressure'];
const ENV_TAG_KEYWORDS = {
  Temperature: ['temp'],
  Humidity:    ['humid'],
  CO2:         ['co2', 'carbon'],
  Pressure:    ['pressure', 'press'],
};
// A meter type renamed/created in the Meter Type master (e.g. "Air pressure") still belongs to
// its sensor type ("Pressure") — resolve by keyword instead of exact string equality.
const canonicalEnvType = (meterType) => {
  const name = String(meterType || '').toLowerCase();
  return ENV_SENSOR_TYPES.find(t => ENV_TAG_KEYWORDS[t].some(k => name.includes(k))) || null;
};
const pickEnvTagRow = (rowsForSlave, meterType) => {
  const keywords = ENV_TAG_KEYWORDS[canonicalEnvType(meterType)] || [];
  return rowsForSlave.find(r => keywords.some(k => (r.tag_name || '').toLowerCase().includes(k)))
      || rowsForSlave[0] // single-sensor slave with a non-matching tag name — still the best guess
      || null;
};

// ── sensorStats — kept for backward compatibility; now reads new tables ───────
// Returns per-meter: actual (live), today/week/month consumption.
// Queries utility_meter_live_data (live) + utility_meter_data_YYYY_MM (hourly),
// falling back to live_tag_snapshot for the environmental sensor types above.
exports.sensorStats = async (req, res) => {
  try {
    const now        = moment.tz(TZ);
    const todayStr   = now.format('YYYY-MM-DD');
    const weekAgo    = now.clone().subtract(6, 'days').format('YYYY-MM-DD');
    const monthStart = now.clone().startOf('month').format('YYYY-MM-DD');
    const curTable   = getUtilityTableName(todayStr);

    // 1. Live current readings
    const [liveRows] = await connection.query(
      `SELECT utilityMeterId, currentReading, preReading, flowRate, meterType, tagName, unit, updatedAt
       FROM utility_meter_live_data`
    );
    const liveMap = new Map(liveRows.map(r => [r.utilityMeterId, r]));

    // 2. Today's total consumption from current month table
    // For months that span two tables (e.g., week spans month boundary) we union.
    const prevMonthTable = getUtilityTableName(
      now.clone().subtract(1, 'month').format('YYYY-MM-DD')
    );

    const [consumRows] = await connection.query(
      `SELECT
           umd.utilityMeterId,
           SUM(CASE WHEN umd.date = ? THEN umd.consumption ELSE 0 END)   AS consumptionToday,
           SUM(CASE WHEN umd.date >= ? THEN umd.consumption ELSE 0 END)  AS consumptionWeek,
           SUM(CASE WHEN umd.date >= ? THEN umd.consumption ELSE 0 END)  AS consumptionMonth,
           MIN(CASE WHEN umd.date = ? THEN umd.openReading  END)          AS todayOpen,
           MAX(CASE WHEN umd.date = ? THEN umd.closeReading END)          AS todayClose
       FROM (
           SELECT utilityMeterId, date, consumption, openReading, closeReading
           FROM \`${curTable}\`
           WHERE date >= ?
           UNION ALL
           SELECT utilityMeterId, date, consumption, openReading, closeReading
           FROM \`${prevMonthTable}\`
           WHERE date >= ? AND date < ?
       ) umd
       GROUP BY umd.utilityMeterId`,
      [
        todayStr,                   // consumptionToday
        weekAgo,                    // consumptionWeek
        monthStart,                 // consumptionMonth
        todayStr, todayStr,         // todayOpen, todayClose
        monthStart,                 // cur table filter
        weekAgo, monthStart,        // prev table filter (only if week spans boundary)
      ]
    ).catch(() => [[]]); // gracefully handle missing prev-month table

    const consumMap = new Map(consumRows.map(r => [r.utilityMeterId, r]));

    // 3. Fetch meter list to populate full response
    const [meters] = await connection.execute(
      `SELECT id, meterName, meterType, deviceId, slaveId FROM utility_meters`
    );

    // 4. Live tag values for environmental sensor meters (see ENV_SENSOR_TYPES above)
    const envMeters = meters.filter(m => canonicalEnvType(m.meterType) && m.deviceId != null && m.slaveId != null);
    const envTagMap = new Map(); // `${deviceId}_${slaveId}` -> live_tag_snapshot rows
    if (envMeters.length > 0) {
      const deviceIds = [...new Set(envMeters.map(m => m.deviceId))];
      const [tagRows] = await connection.query(
        `SELECT deviceId, slaveId, tag_name, value, unit, min_value, max_value, avg_value, updated_at
         FROM live_tag_snapshot
         WHERE deviceId IN (${deviceIds.map(() => '?').join(',')})`,
        deviceIds
      );
      for (const r of tagRows) {
        const key = `${r.deviceId}_${r.slaveId}`;
        if (!envTagMap.has(key)) envTagMap.set(key, []);
        envTagMap.get(key).push(r);
      }
    }

    const fmt = v => (v != null ? parseFloat(parseFloat(v).toFixed(4)) : null);
    // Per-day averages over the same windows as consumptionWeek (7 calendar days
    // incl. today) and consumptionMonth (1st of month .. today).
    const daysInMonthSoFar = now.date();
    const perDay = (total, days) => (total != null ? fmt(parseFloat(total) / days) : null);

    const statsMap = {};
    for (const m of meters) {
      const live   = liveMap.get(m.id) || {};
      const consum = consumMap.get(m.id) || {};

      let actual = fmt(live.currentReading);
      let unit   = live.unit || 'L';
      let lastUpdated = live.updatedAt || null;
      let min = null, max = null, avg = null;

      if (canonicalEnvType(m.meterType)) {
        const tag = pickEnvTagRow(envTagMap.get(`${m.deviceId}_${m.slaveId}`) || [], m.meterType);
        if (tag) {
          actual = fmt(tag.value);
          unit   = tag.unit || unit;
          lastUpdated = tag.updated_at || lastUpdated;
          min = fmt(tag.min_value);
          max = fmt(tag.max_value);
          avg = fmt(tag.avg_value);
        }
      }

      statsMap[m.id] = {
        meterName:          m.meterName,
        meterType:          m.meterType,
        unit,
        actual,
        min,
        max,
        avg,
        previousReading:    fmt(live.preReading),
        flowRate:           fmt(live.flowRate),
        lastUpdated,
        consumptionToday:   fmt(consum.consumptionToday),
        consumptionLastWeek: fmt(consum.consumptionWeek),
        consumptionMonth:   fmt(consum.consumptionMonth),
        avgLastWeek:        perDay(consum.consumptionWeek, 7),
        avgMonth:           perDay(consum.consumptionMonth, daysInMonthSoFar),
        todayMin:          fmt(consum.todayOpen),
        todayMax:           fmt(consum.todayClose),
      };
    }

    return res.status(200).json({ success: true, data: statsMap });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

// A "shift" report day runs 8 PM the previous calendar day through 8 PM the
// current day (industrial shift-change convention), instead of midnight-to-
// midnight. Shifting every timestamp forward by (24 - 20) = 4 hours before
// truncating to a date reproduces that boundary. "dayShift" and "nightShift"
// split that same 24-hour cycle into its two 12-hour halves — day shift
// (8AM-8PM) stays within one calendar day so needs no date shift; night shift
// (8PM-8AM) reuses the same +4h bucket formula so an overnight reading is
// labeled by the morning it ends. "hour" bypasses day-bucketing entirely and
// filters created_at directly against the exact from/to instants supplied.
// Mirrors the same convention used for the Energy report (ReportsEnergyConsumReport.js).
const SHIFT_CYCLE_START_HOUR = 20; // 8 PM
const SHIFT_HOUR_OFFSET = 24 - SHIFT_CYCLE_START_HOUR;
const DAY_SHIFT_START_HOUR = 8;  // 8 AM
const DAY_SHIFT_END_HOUR   = SHIFT_CYCLE_START_HOUR; // 8 PM
const VALID_CYCLE_TYPES = ['calendar', 'shift', 'dayShift', 'nightShift', 'hour'];

// ── dashboard — optimized for utility dashboard display ───────────────────────
// GET /UtilityMeter/dashboard?meterId=&range=today|week|month|custom&from=&to=&cycleType=calendar|shift|dayShift|nightShift|hour
// For cycleType=hour, from/to are full datetime strings (not just dates).
// Returns: hourly consumption breakdown + totals for charting and KPI widgets.
exports.dashboard = async (req, res) => {
  try {
    const now       = moment.tz(TZ);
    const { meterId, range = 'today', from, to, cycleType: cycleTypeParam } = req.query;
    const cycleType = VALID_CYCLE_TYPES.includes(cycleTypeParam) ? cycleTypeParam : 'calendar';

    if (!meterId) {
      return res.status(400).json({ success: false, message: 'meterId is required' });
    }

    // Resolve date range
    let fromDate, toDate;
    switch (range) {
      case 'week':
        fromDate = now.clone().subtract(6, 'days').format('YYYY-MM-DD');
        toDate   = now.format('YYYY-MM-DD');
        break;
      case 'month':
        fromDate = now.clone().startOf('month').format('YYYY-MM-DD');
        toDate   = now.format('YYYY-MM-DD');
        break;
      case 'custom':
        if (!from || !to) {
          return res.status(400).json({ success: false, message: 'from and to are required for custom range' });
        }
        fromDate = from;
        toDate   = to;
        break;
      default: // today
        fromDate = now.format('YYYY-MM-DD');
        toDate   = now.format('YYYY-MM-DD');
    }

    // Bucket expression + WHERE bounds depend on cycleType. In 'shift'/'nightShift'
    // mode we query by created_at across a 20:00-to-20:00 window and re-derive the
    // report date per row instead of using the stored `date` column. 'dayShift'
    // stays within the stored `date` column but restricts to the 8AM-8PM hours.
    // 'hour' filters created_at directly against the exact from/to instants.
    let dateExpr        = 'date';
    let dateWhere       = 'date BETWEEN ? AND ?';
    let dateParams       = [fromDate, toDate];
    let monthRangeStart = fromDate;

    if (cycleType === 'shift' || cycleType === 'nightShift') {
      const endHour = cycleType === 'nightShift' ? DAY_SHIFT_START_HOUR : SHIFT_CYCLE_START_HOUR;
      const startDT = moment(fromDate).subtract(1, 'day').format('YYYY-MM-DD') + ` ${SHIFT_CYCLE_START_HOUR}:00:00`;
      const endDT   = moment(toDate).format('YYYY-MM-DD') + ` ${endHour}:00:00`;
      dateExpr        = `DATE_FORMAT(created_at + INTERVAL ${SHIFT_HOUR_OFFSET} HOUR, '%Y-%m-%d')`;
      dateWhere       = 'created_at >= ? AND created_at < ?';
      dateParams       = [startDT, endDT];
      monthRangeStart = startDT.substring(0, 10);

      // night-only: exclude the daytime hours of each intermediate day
      if (cycleType === 'nightShift') {
        dateWhere += ` AND (HOUR(created_at) >= ${SHIFT_CYCLE_START_HOUR} OR HOUR(created_at) < ${DAY_SHIFT_START_HOUR})`;
      }
    } else if (cycleType === 'dayShift') {
      dateWhere = `date BETWEEN ? AND ? AND HOUR(created_at) >= ${DAY_SHIFT_START_HOUR} AND HOUR(created_at) < ${DAY_SHIFT_END_HOUR}`;
      dateParams = [fromDate, toDate];
    } else if (cycleType === 'hour') {
      const startDT = moment(from).format('YYYY-MM-DD HH:mm:ss');
      const endDT   = moment(to).format('YYYY-MM-DD HH:mm:ss');
      dateWhere       = 'created_at >= ? AND created_at <= ?';
      dateParams       = [startDT, endDT];
      monthRangeStart = startDT.substring(0, 10);
      toDate          = endDT.substring(0, 10);
    }

    // Collect all monthly tables that overlap [monthRangeStart, toDate]
    const tables = [];
    let cur = moment(monthRangeStart).startOf('month');
    const end = moment(toDate).startOf('month');
    while (cur.isSameOrBefore(end)) {
      tables.push(getUtilityTableName(cur.format('YYYY-MM-DD')));
      cur.add(1, 'month');
    }

    // UNION across tables — filters by meterId and date range
    const unionParts = tables.map(t =>
      `SELECT ${dateExpr} as date, HR, consumption, openReading, closeReading, dateTime
       FROM \`${t}\`
       WHERE utilityMeterId = ? AND ${dateWhere}`
    );
    const unionParams = tables.flatMap(() => [meterId, ...dateParams]);

    const [hourlyRows] = await connection.query(
      `${unionParts.join(' UNION ALL ')}
       ORDER BY date ASC, FIELD(HR,
         '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
         '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM'
       )`,
      unionParams
    ).catch(() => [[]]); // graceful fallback if table missing

    // Aggregate totals
    let totalConsumption = 0;
    let peakHour = null, peakValue = 0;
    const dailyMap = new Map();

    for (const row of hourlyRows) {
      const c = parseFloat(row.consumption || 0);
      totalConsumption += c;

      if (c > peakValue) {
        peakValue = c;
        peakHour  = { date: row.date, hr: row.HR, consumption: c };
      }

      // row.date comes back from mysql2 as a Date object (no dateStrings option
      // on the pool), so grouping directly on it would key the Map by object
      // identity — every row would land in its own bucket instead of merging
      // by calendar day. Normalize to 'YYYY-MM-DD' first.
      const d = row.date instanceof Date ? moment(row.date).format('YYYY-MM-DD') : row.date;
      if (!dailyMap.has(d)) dailyMap.set(d, 0);
      dailyMap.set(d, dailyMap.get(d) + c);
    }

    const dailyTotals = [...dailyMap.entries()].map(([date, consumption]) => ({
      date,
      consumption: parseFloat(consumption.toFixed(4)),
    }));

    // Live current reading
    const [liveRows] = await connection.execute(
      `SELECT currentReading, preReading, flowRate, unit, updatedAt
       FROM utility_meter_live_data WHERE utilityMeterId = ?`,
      [meterId]
    );
    const live = liveRows[0] || {};

    const fmt = v => (v != null ? parseFloat(parseFloat(v).toFixed(4)) : null);

    return res.status(200).json({
      success: true,
      data: {
        meterId:         parseInt(meterId, 10),
        range:           { from: fromDate, to: toDate, cycleType },
        unit:            live.unit || 'L',
        currentReading:  fmt(live.currentReading),
        flowRate:        fmt(live.flowRate),
        lastUpdated:     live.updatedAt || null,
        totalConsumption: parseFloat(totalConsumption.toFixed(4)),
        peakHour,
        dailyTotals,
        hourlyData: hourlyRows.map(r => ({
          date:         r.date,
          hr:           r.HR,
          consumption:  fmt(r.consumption),
          openReading:  fmt(r.openReading),
          closeReading: fmt(r.closeReading),
        })),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'An error occurred' });
  }
};
