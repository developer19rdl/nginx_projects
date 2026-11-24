import React, { useEffect, useMemo, useState } from "react";
import "./Water.css";
import {
  FormControl,
  Typography,
  Button,
  Grid,
  LinearProgress,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  UtilityMeterView,
  MeterPlantShow,
  MeterBuildingShowList,
  GetUtilityMeterReport,
} from "../../../../Services/NodeJsApiServices";

// ─── Helpers ──────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split("T")[0];
const daysAgoStr = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const calculateOneMonthFrom = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
};

// String comparison is safe here — both args are 'YYYY-MM-DD'.
const minDateStr = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
};

// mysql2 rows come back with `date` as a Date object pre-serialization, but by
// the time it reaches the browser (after res.json()) it's already an ISO
// string — handle both so this stays correct if the API layer changes.
const rowDateStr = (date) =>
  date instanceof Date ? date.toISOString().split("T")[0] : String(date).split("T")[0];

// Groups the hourly rows returned by the API (already ordered date ASC, hour
// ASC) into one row per calendar day — opening reading = first hour seen that
// day, closing reading = last hour seen that day. This mirrors how a facility
// team reads a physical meter once and diffs it against the prior reading,
// so the report is directly comparable to a manual log.
const buildDailyRows = (hourlyData) => {
  const order = [];
  const map = new Map();
  for (const row of hourlyData || []) {
    const dateKey = rowDateStr(row.date);
    if (!map.has(dateKey)) {
      map.set(dateKey, {
        date: dateKey,
        openReading: row.openReading,
        closeReading: row.closeReading,
        consumption: 0,
      });
      order.push(dateKey);
    }
    const entry = map.get(dateKey);
    entry.closeReading = row.closeReading;
    entry.consumption += parseFloat(row.consumption || 0);
  }
  return order.map((d) => {
    const r = map.get(d);
    return { ...r, consumption: parseFloat(r.consumption.toFixed(4)) };
  });
};

const downloadCsv = (rows, unit, labelHeader, fileName) => {
  const header = [labelHeader, `Opening Reading [${unit}]`, `Closing Reading [${unit}]`, `Consumption [${unit}]`];
  const lines = [header.join(",")];
  rows.forEach((r) => {
    lines.push([r.label, r.openReading ?? "", r.closeReading ?? "", r.consumption].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

// "Cycle" reports each full day as 8 PM (previous day) → 8 PM (24h).
// "DayShift"/"NightShift" split that same cycle into its two 12-hour halves.
// "Hour" bypasses day-bucketing entirely — exact datetime range, per-hour rows.
const CYCLE_TYPE_BY_WATER_TYPE = {
  Cycle:      "shift",
  DayShift:   "dayShift",
  NightShift: "nightShift",
};

// ─── Component ──────────────────────────────────────────────────────────────

const Water = () => {
  const [plantList, setPlantList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [allWaterMeters, setAllWaterMeters] = useState([]);

  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [selectedMeter, setSelectedMeter] = useState("");

  // Filter state
  const [waterType, setWaterType] = useState("Day");
  const [fromDay, setFromDay]     = useState(daysAgoStr(6));
  const [toDay, setToDay]         = useState(todayStr());
  const [fromHour, setFromHour]   = useState("");
  const [toHour, setToHour]       = useState("");

  const [reportData, setReportData] = useState(null);
  const [loader, setLoader] = useState(false);
  const [searched, setSearched] = useState(false);

  // "Day", "Cycle", "DayShift" and "NightShift" all use date-only inputs and
  // day-bucketed rows; only "Hour" uses date-time inputs and raw per-hour rows.
  const isDayFamily = waterType !== "Hour";
  const cycleType = waterType === "Hour" ? "hour" : (CYCLE_TYPE_BY_WATER_TYPE[waterType] || "calendar");

  useEffect(() => {
    MeterPlantShow((d) => setPlantList(d?.data || []), () => {});
    MeterBuildingShowList((d) => setBuildingList(d?.data || []), () => {});
    UtilityMeterView(
      (d) => setAllWaterMeters((d?.data || []).filter((m) => m.meterType === "Water")),
      () => {}
    );
  }, []);

  // Reset results when switching Day / Hour / Cycle / Shift
  useEffect(() => {
    setReportData(null);
    setSearched(false);
  }, [waterType]);

  const meterList = useMemo(() => allWaterMeters.filter((m) => {
    if (selectedPlant && String(m.plantId) !== String(selectedPlant)) return false;
    if (selectedBuilding && String(m.buildingId) !== String(selectedBuilding)) return false;
    return true;
  }), [allWaterMeters, selectedPlant, selectedBuilding]);

  const handlePlantChange = (plantId) => {
    setSelectedPlant(plantId);
    setSelectedBuilding("");
    setSelectedMeter("");
  };

  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedMeter("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const from = isDayFamily ? fromDay : fromHour;
    const to   = isDayFamily ? toDay   : toHour;
    if (!selectedMeter || !from || !to) return;
    setLoader(true);
    setSearched(true);
    GetUtilityMeterReport(
      selectedMeter, from, to, cycleType,
      (d) => { setReportData(d?.data || null); setLoader(false); },
      () => { setReportData(null); setLoader(false); }
    );
  };

  const dailyRows = useMemo(() => buildDailyRows(reportData?.hourlyData), [reportData]);

  // "Hour" mode shows the raw per-hour rows returned by the API instead of
  // rolling them up into one row per day.
  const hourRows = useMemo(() => (reportData?.hourlyData || []).map((r) => ({
    label: `${rowDateStr(r.date)} ${r.hr}`,
    openReading: r.openReading,
    closeReading: r.closeReading,
    consumption: r.consumption,
  })), [reportData]);

  const displayRows = isDayFamily
    ? dailyRows.map((r) => ({ ...r, label: r.date }))
    : hourRows;

  const unit = reportData?.unit || "KL";
  const meterName = allWaterMeters.find((m) => String(m.id) === String(selectedMeter))?.meterName || "";

  const peakRow = displayRows.reduce(
    (peak, r) => (r.consumption > (peak?.consumption ?? -1) ? r : peak), null
  );
  const peakLabel = isDayFamily ? "Peak Day" : "Peak Hour";
  const dateColumnLabel = isDayFamily ? "Date" : "Date & Hour";

  const handleCsvDownload = () => {
    if (!displayRows.length) return;
    downloadCsv(
      displayRows, unit, dateColumnLabel,
      `WaterConsumptionReport_${isDayFamily ? fromDay : fromHour}_to_${isDayFamily ? toDay : toHour}.csv`
    );
  };

  const handlePdfDownload = () => {
    if (!displayRows.length) return;
    const doc = new jsPDF();
    const text = `Water Consumption Report - ${meterName}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const xCoordinate = (pageWidth - doc.getTextWidth(text)) / 2;
    doc.text(text, xCoordinate, 10);
    const body = displayRows.map((r) => [r.label, r.openReading, r.closeReading, r.consumption]);
    body.push(["TOTAL", "", "", reportData?.totalConsumption ?? ""]);
    doc.autoTable({
      theme: "striped",
      head: [[dateColumnLabel, `Opening Reading [${unit}]`, `Closing Reading [${unit}]`, `Consumption [${unit}]`]],
      body,
      headStyles: { fillColor: [21, 101, 192], textColor: [255, 255, 255] },
    });
    doc.save(`WaterConsumptionReport_${isDayFamily ? fromDay : fromHour}_to_${isDayFamily ? toDay : toHour}.pdf`);
  };

  return (
    <>
      <div className="water_bottomContainer">
        <div className="water_headerContainer">
          <span style={{ fontWeight: "bold", color: "#000000", fontFamily: "Roboto Slab" }}>
            WATER CONSUMPTION REPORT
          </span>
        </div>

        {/* ── FILTERS ── */}
        <div className="water_filters_container">
          <Grid container spacing={2} alignItems="center">

            {/* Water Type (Day / Hour / Report Cycle) */}
            <Grid item xs={12} sm={6} md={1.6} lg={1.6}>
              <FormControl fullWidth size="small">
                <InputLabel>Water Type</InputLabel>
                <Select
                  label="Water Type"
                  value={waterType}
                  onChange={(e) => setWaterType(e.target.value)}
                >
                  {[
                    { value: "Day", label: "Day" },
                    { value: "Hour", label: "Hour" },
                    { value: "Cycle", label: "24 Hrs (8PM - Next Day 8PM)" },
                    { value: "DayShift", label: "Day Shift (8AM-8PM)" },
                    { value: "NightShift", label: "Night Shift (8PM-8AM)" },
                  ].map(({ value, label }) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={1.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Plant</InputLabel>
                <Select label="Plant" value={selectedPlant} onChange={(e) => handlePlantChange(e.target.value)}>
                  <MenuItem value="">All Plants</MenuItem>
                  {plantList.map((p) => <MenuItem key={p.id} value={p.id}>{p.plantName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Building</InputLabel>
                <Select label="Building" value={selectedBuilding} onChange={(e) => handleBuildingChange(e.target.value)}>
                  <MenuItem value="">All Buildings</MenuItem>
                  {buildingList.map((b) => <MenuItem key={b.id} value={b.id}>{b.buildingName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={1.8}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Water Meter</InputLabel>
                <Select label="Water Meter" value={selectedMeter} onChange={(e) => setSelectedMeter(e.target.value)}>
                  {meterList.map((m) => <MenuItem key={m.id} value={m.id}>{m.meterName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* From Date / DateTime */}
            <Grid item xs={12} sm={6} md={1.6}>
              <TextField
                fullWidth
                size="small"
                label={isDayFamily ? "From Date" : "From Date Time"}
                type={isDayFamily ? "date" : "datetime-local"}
                value={isDayFamily ? fromDay : fromHour}
                required
                onChange={(e) =>
                  isDayFamily ? setFromDay(e.target.value) : setFromHour(e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: isDayFamily
                    ? minDateStr(calculateOneMonthFrom(toDay), todayStr())
                    : calculateOneMonthFrom(fromHour),
                }}
              />
            </Grid>

            {/* To Date / DateTime */}
            <Grid item xs={12} sm={6} md={1.6}>
              <TextField
                fullWidth
                size="small"
                label={isDayFamily ? "To Date" : "To Date Time"}
                type={isDayFamily ? "date" : "datetime-local"}
                value={isDayFamily ? toDay : toHour}
                required
                onChange={(e) =>
                  isDayFamily ? setToDay(e.target.value) : setToHour(e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: isDayFamily ? fromDay : fromHour,
                  max: isDayFamily
                    ? minDateStr(calculateOneMonthFrom(fromDay), todayStr())
                    : calculateOneMonthFrom(fromHour),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={0.6}>
              <Button variant="contained" size="small" fullWidth onClick={handleSubmit} disabled={!selectedMeter}>
                Search
              </Button>
            </Grid>
          </Grid>
          {meterList.length === 0 && (
            <Typography variant="caption" sx={{ color: "#c62828", mt: 1, display: "block" }}>
              No water meters configured for the selected plant/building.
            </Typography>
          )}
        </div>

        {loader && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}

        {/* ── KPI ROW ── */}
        {reportData && (
          <div className="water_kpi_row">
            <div className="water_kpi_card">
              <div className="water_kpi_label">Current Reading</div>
              <div className="water_kpi_value">{reportData.currentReading ?? "—"} {unit}</div>
            </div>
            <div className="water_kpi_card">
              <div className="water_kpi_label">
                Total Consumption ({reportData.range?.from ?? (isDayFamily ? fromDay : fromHour)} to {reportData.range?.to ?? (isDayFamily ? toDay : toHour)})
              </div>
              <div className="water_kpi_value">{reportData.totalConsumption ?? "—"} {unit}</div>
            </div>
            <div className="water_kpi_card">
              <div className="water_kpi_label">{peakLabel}</div>
              <div className="water_kpi_value">
                {peakRow ? `${peakRow.consumption} ${unit}` : "—"}
              </div>
              <Typography variant="caption" sx={{ color: "#0d47a1" }}>{peakRow?.label || ""}</Typography>
            </div>
          </div>
        )}

        {/* ── TREND CHART ── */}
        {displayRows.length > 0 && (
          <div className="water_chartContainer">
            <Typography style={{ fontWeight: "bold", marginBottom: "8px" }}>
              {isDayFamily ? "Daily" : "Hourly"} Consumption Trend [{unit}]
            </Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={displayRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="consumption" name={`Consumption [${unit}]`} fill="#1565c0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── TABLE SECTION ── */}
      {searched && !loader && (
        <div className="energy_table_bottomContainer">
          <div className="energy_headerContainer">
            <span>Water Consumption Report [{meterName}]</span>
          </div>
          <div className="energy_table_sub_bottomContainer">
            {displayRows.length === 0 ? (
              <Typography sx={{ p: 3, textAlign: "center", color: "#90a4ae" }}>
                No consumption data recorded for the selected meter and date range.
              </Typography>
            ) : (
              <table id="customers">
                <thead>
                  <tr>
                    <th className="tableHeader">{dateColumnLabel}</th>
                    <th className="tableHeader">Opening Reading [{unit}]</th>
                    <th className="tableHeader">Closing Reading [{unit}]</th>
                    <th className="tableHeader">Consumption [{unit}]</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((r, i) => (
                    <tr key={i}>
                      <td className="tableData">{r.label}</td>
                      <td className="tableData">{r.openReading ?? "—"}</td>
                      <td className="tableData">{r.closeReading ?? "—"}</td>
                      <td className="tableData">{r.consumption}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ fontWeight: "bold", textAlign: "center", color: "#000000" }}>TOTAL</td>
                    <td style={{ fontWeight: "bold", textAlign: "center", color: "#000000" }}>{displayRows[0]?.openReading ?? "—"}</td>
                    <td style={{ fontWeight: "bold", textAlign: "center", color: "#000000" }}>{displayRows[displayRows.length - 1]?.closeReading ?? "—"}</td>
                    <td style={{ fontWeight: "bold", textAlign: "center", color: "#000000" }}>{reportData?.totalConsumption ?? "—"}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="bottomButtonContainer">
                      <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                          <Button variant="contained" onClick={handleCsvDownload}>Download CSV</Button>
                        </Grid>
                        <Grid item>
                          <Button variant="contained" onClick={handlePdfDownload}>Download PDF</Button>
                        </Grid>
                      </Grid>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Water;
