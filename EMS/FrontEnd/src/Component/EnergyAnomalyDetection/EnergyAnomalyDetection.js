import React, { useEffect, useState } from "react";
import "./EnergyAnomalyDetection.css";
import ReactApexChart from "react-apexcharts";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FactoryIcon from "@mui/icons-material/Factory";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  AddMaxEnergyView,
  BuildingEnergyHourReportService,
  DistributerShowDataFiltered,
  EnergyHourReportService,
  FeederShowDataFiltered,
  MachineListService,
  getBuildingDropDown,
  getCategoryDropDown,
  getCategoryMeterDropDown,
  getFloorDropDown,
  getIncomerDropDown,
  getPlantDistributorFeeder,
  getSubCategoryDropDown,
} from "../../Services/NodeJsApiServices";

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_COLORS = {
  critical: "#c62828",
  high:     "#bf360c",
  medium:   "#f57f17",
  drop:     "#6a1b9a",
};

const SeverityPill = ({ value }) => (
  <span className={`severity-pill sev-${value}`}>{value}</span>
);

// ─── Summary chip ─────────────────────────────────────────────────────────────

const SummaryChip = ({ count, label, chipClass }) => (
  <div className={`summary-chip ${chipClass}`}>
    <span className="summary-chip-count">{count}</span>
    <span className="summary-chip-label">{label}</span>
  </div>
);

// ─── Empty / Loading states ───────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <WarningAmberIcon className="empty-state-icon" />
    <p>{message}</p>
  </div>
);

const LoadingView = () => (
  <div className="loading-container">
    <CircularProgress size={38} style={{ color: "#051622" }} />
    <span>Running anomaly detection…</span>
  </div>
);

// ─── Data normalizer ──────────────────────────────────────────────────────────

const normalizeToTimeSeries = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((r) => ({
      dateStr: r.date || r.Date || "",
      value:   parseFloat(r.energyConsum ?? r.EnergyConsum ?? 0) || 0,
    }));
  }
  if (raw?.data?.data) {
    const consumCols = raw.data?.headers?.consumption || [];
    return raw.data.data.map((row) => ({
      dateStr: row.Date || row.date || "",
      value:   parseFloat(
        consumCols.reduce((acc, col) => acc + (parseFloat(row[col]) || 0), 0).toFixed(2)
      ),
    }));
  }
  return [];
};

// ─── Detection algorithms ─────────────────────────────────────────────────────

const SIGMA_MAP = { conservative: 2.5, moderate: 2.0, aggressive: 1.5 };

const runStatistical = (points, sensitivity, thresholds) => {
  if (!points.length) return [];
  const sigma  = SIGMA_MAP[sensitivity] || 2.0;
  const values = points.map((p) => p.value);
  const mean   = values.reduce((a, v) => a + v, 0) / values.length;
  const std    = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length) || 1;

  return points.flatMap((p, i) => {
    const z = (p.value - mean) / std;
    let severity = null;
    if (p.value > thresholds.HourMaxErgCon || z > 3) severity = "critical";
    else if (z > sigma)                               severity = "high";
    else if (z > sigma * 0.75)                        severity = "medium";
    else if (z < -sigma)                              severity = "drop";
    if (!severity) return [];
    return [{
      id:        i,
      dateStr:   p.dateStr,
      value:     p.value,
      expected:  parseFloat(mean.toFixed(2)),
      zScore:    parseFloat(z.toFixed(2)),
      deviation: parseFloat(((p.value - mean) / mean * 100).toFixed(1)),
      severity,
    }];
  });
};

const runThreshold = (points, thresholds) => {
  if (!points.length) return [];
  const max = thresholds.HourMaxErgCon;
  return points.flatMap((p, i) => {
    let severity = null;
    if (p.value > max)             severity = "critical";
    else if (p.value > max * 0.9)  severity = "high";
    else if (p.value > max * 0.75) severity = "medium";
    if (!severity) return [];
    return [{
      id:        i,
      dateStr:   p.dateStr,
      value:     p.value,
      expected:  max,
      zScore:    null,
      deviation: parseFloat(((p.value - max) / max * 100).toFixed(1)),
      severity,
    }];
  });
};

// ─── Chart builder ────────────────────────────────────────────────────────────

const buildChart = (points, detectedAnomalies, thresholds) => {
  const pointAnnotations = detectedAnomalies.map((a) => ({
    x: new Date(a.dateStr).getTime(),
    y: a.value,
    marker: {
      size:        7,
      fillColor:   SEVERITY_COLORS[a.severity],
      strokeColor: "#fff",
      radius:      3,
    },
    label: {
      text:  a.severity.toUpperCase(),
      style: {
        color:      "#fff",
        background: SEVERITY_COLORS[a.severity],
        fontSize:   "10px",
        padding:    { top: 3, bottom: 3, left: 5, right: 5 },
      },
      offsetY: -10,
    },
  }));

  const yAnnotations = thresholds.HourMaxErgCon > 0
    ? [{
        y:               thresholds.HourMaxErgCon,
        borderColor:     "#d32f2f",
        strokeDashArray: 6,
        label: {
          text:  `Max: ${thresholds.HourMaxErgCon} kWh`,
          style: { color: "#d32f2f", fontSize: "11px", fontWeight: 600 },
          position: "right",
        },
      }]
    : [];

  const series = [{
    name: "Energy (kWh)",
    data: points
      .filter((p) => p.dateStr)
      .map((p) => ({ x: new Date(p.dateStr).getTime(), y: p.value })),
  }];

  const options = {
    chart: {
      type:    "line",
      toolbar: { show: true },
      zoom:    { enabled: true },
      animations: { enabled: false },
    },
    stroke:  { curve: "smooth", width: 2 },
    colors:  ["#1565C0"],
    xaxis: {
      type:   "datetime",
      labels: { datetimeUTC: false, style: { fontSize: "11px" } },
    },
    yaxis: {
      title:  { text: "kWh", style: { fontSize: "12px" } },
      labels: { formatter: (v) => (v ?? 0).toFixed(1) },
    },
    annotations: { points: pointAnnotations, yaxis: yAnnotations },
    tooltip: {
      x: { format: "dd MMM yyyy HH:mm" },
      y: { formatter: (v) => `${(v ?? 0).toFixed(2)} kWh` },
    },
    markers: { size: 0 },
    grid:    { borderColor: "#e0e0e0", strokeDashArray: 3 },
    legend:  { show: false },
  };

  return { series, options };
};

// ─── DataGrid columns ─────────────────────────────────────────────────────────

const buildColumns = (detectionMode) => [
  {
    field:       "dateStr",
    headerName:  "Date / Time",
    width:       180,
    renderCell:  (p) => <span style={{ fontSize: 13 }}>{p.value}</span>,
  },
  { field: "value",    headerName: "Actual kWh",   width: 130, type: "number" },
  { field: "expected", headerName: detectionMode === "statistical" ? "Mean kWh" : "Max Threshold", width: 145, type: "number" },
  {
    field:      "deviation",
    headerName: "Deviation %",
    width:      120,
    type:       "number",
    renderCell: (p) => (
      <span style={{ color: p.value > 0 ? "#c62828" : "#6a1b9a", fontWeight: 600 }}>
        {p.value > 0 ? "+" : ""}{p.value}%
      </span>
    ),
  },
  {
    field:      "zScore",
    headerName: "Z-Score",
    width:      100,
    type:       "number",
    renderCell: (p) => (p.value != null ? p.value : "—"),
  },
  {
    field:      "severity",
    headerName: "Severity",
    width:      120,
    renderCell: (p) => <SeverityPill value={p.value} />,
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

const EnergyAnomalyDetection = () => {
  // ── Mode & detection settings ─────────────────────────────────────────────
  const [mode,          setMode]          = useState("plant");         // "plant"|"building"
  const [detectionMode, setDetectionMode] = useState("statistical");   // "statistical"|"threshold"
  const [sensitivity,   setSensitivity]   = useState("moderate");      // "conservative"|"moderate"|"aggressive"

  // ── Date range ─────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState("");
  const [toDate,   setToDate]   = useState("");

  // ── Plant hierarchy ────────────────────────────────────────────────────────
  const [plantList,        setPlantList]        = useState([]);
  const [incomerList,      setIncomerList]      = useState([]);
  const [distributorList,  setDistributorList]  = useState([]);
  const [feederList,       setFeederList]       = useState([]);
  const [plantMeterList,   setPlantMeterList]   = useState([{ id: -1, displayName: "All" }]);
  const [selectedPlant,         setSelectedPlant]        = useState("");
  const [selectedIncomer,       setSelectedIncomer]      = useState("");
  const [selectedDistributor,   setSelectedDistributor]  = useState("");
  const [selectedFeeder,        setSelectedFeeder]       = useState("");
  const [selectedPlantMeter,    setSelectedPlantMeter]   = useState(-1);

  // ── Building hierarchy ─────────────────────────────────────────────────────
  const [buildingList,     setBuildingList]     = useState([]);
  const [floorList,        setFloorList]        = useState([]);
  const [categoryList,     setCategoryList]     = useState([]);
  const [subCategoryList,  setSubCategoryList]  = useState([]);
  const [bldgMeterList,    setBldgMeterList]    = useState([{ id: -1, displayName: "All" }]);
  const [selectedBuilding,     setSelectedBuilding]     = useState("");
  const [selectedFloor,        setSelectedFloor]        = useState("");
  const [selectedCategory,     setSelectedCategory]     = useState("");
  const [selectedSubCategory,  setSelectedSubCategory]  = useState("");
  const [selectedBldgMeter,    setSelectedBldgMeter]    = useState(-1);

  // ── Thresholds ─────────────────────────────────────────────────────────────
  const [thresholds, setThresholds] = useState({ HourMaxErgCon: 500, DayMaxErgCon: 500 });

  // ── Results ────────────────────────────────────────────────────────────────
  const [anomalies,    setAnomalies]    = useState([]);
  const [chartSeries,  setChartSeries]  = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [loading,      setLoading]      = useState(false);
  const [hasData,      setHasData]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");

  // ── On mount ───────────────────────────────────────────────────────────────
  useEffect(() => {
    getPlantDistributorFeeder({}, (d) => setPlantList(d?.data || []), () => {});
    MachineListService(
      (d) => setPlantMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
    getBuildingDropDown((d) => setBuildingList(d?.data || []), () => {});
    AddMaxEnergyView((d) => {
      const cfg = d?.data?.[0];
      if (cfg) setThresholds({
        HourMaxErgCon: parseFloat(cfg.HourMaxErgCon) || 500,
        DayMaxErgCon:  parseFloat(cfg.DayMaxErgCon)  || 500,
      });
    }, () => {});
  }, []);

  // Reset results when mode changes
  useEffect(() => {
    setAnomalies([]);
    setHasData(false);
    setErrorMsg("");
  }, [mode]);

  // ── Plant cascade handlers ─────────────────────────────────────────────────
  const handlePlantChange = (plantId) => {
    setSelectedPlant(plantId);
    setSelectedIncomer(""); setSelectedDistributor(""); setSelectedFeeder("");
    setDistributorList([]); setFeederList([]);
    if (!plantId) { setIncomerList([]); return; }
    getIncomerDropDown({ plantId }, (d) => setIncomerList(d?.data || []), () => {});
  };

  const handleIncomerChange = (incomerId) => {
    setSelectedIncomer(incomerId);
    setSelectedDistributor(""); setSelectedFeeder("");
    setFeederList([]);
    if (!incomerId) { setDistributorList([]); return; }
    DistributerShowDataFiltered(
      { plantId: selectedPlant, incomerId },
      (d) => setDistributorList(d?.data || []),
      () => setDistributorList([])
    );
  };

  const handleDistributorChange = (distId) => {
    setSelectedDistributor(distId);
    setSelectedFeeder("");
    if (!distId) { setFeederList([]); return; }
    FeederShowDataFiltered(
      { plantId: selectedPlant, incomerId: selectedIncomer, distributorId: distId },
      (d) => setFeederList(d?.data || []),
      () => setFeederList([])
    );
  };

  // ── Building cascade handlers ──────────────────────────────────────────────
  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor(""); setSelectedCategory(""); setSelectedSubCategory(""); setSelectedBldgMeter(-1);
    setFloorList([]); setCategoryList([]); setSubCategoryList([]);
    setBldgMeterList([{ id: -1, displayName: "All" }]);
    if (!buildingId) return;
    getFloorDropDown({ buildingId }, (d) => setFloorList(d?.data || []), () => {});
  };

  const handleFloorChange = (floorId) => {
    setSelectedFloor(floorId);
    setSelectedCategory(""); setSelectedSubCategory(""); setSelectedBldgMeter(-1);
    setCategoryList([]); setSubCategoryList([]);
    setBldgMeterList([{ id: -1, displayName: "All" }]);
    if (!floorId) return;
    getCategoryDropDown(
      { buildingId: selectedBuilding, floorId },
      (d) => setCategoryList(d?.data || []),
      () => {}
    );
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(""); setSelectedBldgMeter(-1);
    setSubCategoryList([]);
    setBldgMeterList([{ id: -1, displayName: "All" }]);
    if (!categoryId) return;
    getSubCategoryDropDown({ categoryId }, (d) => setSubCategoryList(d?.data || []), () => {});
    getCategoryMeterDropDown(
      { buildingId: selectedBuilding, categoryId },
      (d) => setBldgMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
  };

  const handleSubCategoryChange = (subCatId) => {
    setSelectedSubCategory(subCatId);
    setSelectedBldgMeter(-1);
    setBldgMeterList([{ id: -1, displayName: "All" }]);
    if (!subCatId) return;
    getCategoryMeterDropDown(
      { buildingId: selectedBuilding, categoryId: selectedCategory, subCategoryId: subCatId },
      (d) => setBldgMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
  };

  // ── Detect ─────────────────────────────────────────────────────────────────
  const handleDetect = () => {
    if (!fromDate || !toDate) {
      setErrorMsg("Please select both From and To date/time.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setHasData(false);
    setAnomalies([]);

    const onSuccess = (raw) => {
      setLoading(false);
      const points = normalizeToTimeSeries(raw);
      if (!points.length) {
        setErrorMsg("No data returned for the selected filters and date range.");
        return;
      }

      const detected =
        detectionMode === "statistical"
          ? runStatistical(points, sensitivity, thresholds)
          : runThreshold(points, thresholds);

      const { series, options } = buildChart(points, detected, thresholds);
      setChartSeries(series);
      setChartOptions(options);
      setAnomalies(detected);
      setHasData(true);
    };

    const onError = () => {
      setLoading(false);
      setErrorMsg("Failed to fetch data. Please check filters and try again.");
    };

    if (mode === "plant") {
      EnergyHourReportService(
        {
          fromDate,
          toDate,
          meterId:       selectedPlantMeter,
          plantId:       selectedPlant       || undefined,
          incomerId:     selectedIncomer     || undefined,
          distributerId: selectedDistributor || undefined,
          feederId:      selectedFeeder      || undefined,
        },
        onSuccess,
        onError
      );
    } else {
      BuildingEnergyHourReportService(
        {
          fromDate,
          toDate,
          meterId:        selectedBldgMeter,
          buildingId:     selectedBuilding     || undefined,
          floorId:        selectedFloor        || undefined,
          categoryId:     selectedCategory     || undefined,
          subCategoryId:  selectedSubCategory  || undefined,
        },
        onSuccess,
        onError
      );
    }
  };

  // ── Derived counts ─────────────────────────────────────────────────────────
  const counts = anomalies.reduce(
    (acc, a) => { acc[a.severity] = (acc[a.severity] || 0) + 1; return acc; },
    {}
  );

  const canDetect  = !!(fromDate && toDate);
  const dataGridCols = buildColumns(detectionMode);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box className="anomaly-wrapper">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="anomaly-header">
        <WarningAmberIcon style={{ color: "#f57f17", fontSize: 26 }} />
        <Typography variant="h6">Energy Anomaly Detection</Typography>
      </div>

      {/* ── Mode Toggle ──────────────────────────────────────────────────── */}
      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={(_, v) => v && setMode(v)}
        size="small"
        className="mode-toggle-group"
      >
        <ToggleButton value="plant">
          <FactoryIcon style={{ fontSize: 16, marginRight: 6 }} />
          Plant Mode
        </ToggleButton>
        <ToggleButton value="building">
          <BusinessIcon style={{ fontSize: 16, marginRight: 6 }} />
          Building Mode
        </ToggleButton>
      </ToggleButtonGroup>

      {/* ── Control Panel ────────────────────────────────────────────────── */}
      <Paper className="control-panel" elevation={0}>
        {/* Row 1: Detection method + sensitivity */}
        <div className="control-panel-row">
          <span className="detection-mode-label">Detection mode:</span>
          <ToggleButtonGroup
            value={detectionMode}
            exclusive
            onChange={(_, v) => v && setDetectionMode(v)}
            size="small"
          >
            <ToggleButton value="statistical">Statistical (Z-score)</ToggleButton>
            <ToggleButton value="threshold">Threshold</ToggleButton>
          </ToggleButtonGroup>

          {detectionMode === "statistical" && (
            <>
              <span className="detection-mode-label" style={{ marginLeft: 16 }}>Sensitivity:</span>
              <ToggleButtonGroup
                value={sensitivity}
                exclusive
                onChange={(_, v) => v && setSensitivity(v)}
                size="small"
                className="sensitivity-toggle"
              >
                <ToggleButton value="conservative">Conservative</ToggleButton>
                <ToggleButton value="moderate">Moderate</ToggleButton>
                <ToggleButton value="aggressive">Aggressive</ToggleButton>
              </ToggleButtonGroup>
            </>
          )}
        </div>

        {/* Row 2: Cascade filters */}
        <Grid container spacing={2} alignItems="flex-end" style={{ marginBottom: 12 }}>
          {mode === "plant" ? (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Plant</InputLabel>
                  <Select value={selectedPlant} label="Plant" onChange={(e) => handlePlantChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {plantList.map((p) => (
                      <MenuItem key={p.id ?? p.plantId} value={p.id ?? p.plantId}>
                        {p.displayName ?? p.plantName ?? p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedPlant}>
                  <InputLabel>Incomer</InputLabel>
                  <Select value={selectedIncomer} label="Incomer" onChange={(e) => handleIncomerChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {incomerList.map((i) => (
                      <MenuItem key={i.id ?? i.incomerId} value={i.id ?? i.incomerId}>
                        {i.displayName ?? i.incomerName ?? i.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedIncomer}>
                  <InputLabel>Distributor</InputLabel>
                  <Select value={selectedDistributor} label="Distributor" onChange={(e) => handleDistributorChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {distributorList.map((d) => (
                      <MenuItem key={d.id ?? d.distributerId} value={d.id ?? d.distributerId}>
                        {d.displayName ?? d.distributorName ?? d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedDistributor}>
                  <InputLabel>Feeder</InputLabel>
                  <Select value={selectedFeeder} label="Feeder" onChange={(e) => setSelectedFeeder(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {feederList.map((f) => (
                      <MenuItem key={f.id ?? f.feederId} value={f.id ?? f.feederId}>
                        {f.displayName ?? f.feederName ?? f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meter</InputLabel>
                  <Select value={selectedPlantMeter} label="Meter" onChange={(e) => setSelectedPlantMeter(e.target.value)}>
                    {plantMeterList.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Building</InputLabel>
                  <Select value={selectedBuilding} label="Building" onChange={(e) => handleBuildingChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {buildingList.map((b) => (
                      <MenuItem key={b.id ?? b.buildingId} value={b.id ?? b.buildingId}>
                        {b.displayName ?? b.buildingName ?? b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedBuilding}>
                  <InputLabel>Floor</InputLabel>
                  <Select value={selectedFloor} label="Floor" onChange={(e) => handleFloorChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {floorList.map((f) => (
                      <MenuItem key={f.id ?? f.floorId} value={f.id ?? f.floorId}>
                        {f.displayName ?? f.floorName ?? f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedFloor}>
                  <InputLabel>Category</InputLabel>
                  <Select value={selectedCategory} label="Category" onChange={(e) => handleCategoryChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {categoryList.map((c) => (
                      <MenuItem key={c.id ?? c.categoryId} value={c.id ?? c.categoryId}>
                        {c.displayName ?? c.categoryName ?? c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedCategory}>
                  <InputLabel>Sub-Category</InputLabel>
                  <Select value={selectedSubCategory} label="Sub-Category" onChange={(e) => handleSubCategoryChange(e.target.value)}>
                    <MenuItem value=""><em>All</em></MenuItem>
                    {subCategoryList.map((s) => (
                      <MenuItem key={s.id ?? s.subCategoryId} value={s.id ?? s.subCategoryId}>
                        {s.displayName ?? s.subCategoryName ?? s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meter</InputLabel>
                  <Select value={selectedBldgMeter} label="Meter" onChange={(e) => setSelectedBldgMeter(e.target.value)}>
                    {bldgMeterList.map((m) => (
                      <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>

        {/* Row 3: Date range + button */}
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="From"
              type="datetime-local"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="To"
              type="datetime-local"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={handleDetect}
              disabled={!canDetect || loading}
              className="detect-btn"
              fullWidth
              startIcon={<SearchIcon />}
            >
              {loading ? "Detecting…" : "Detect Anomalies"}
            </Button>
          </Grid>
        </Grid>

        {errorMsg && (
          <Typography style={{ color: "#d32f2f", fontSize: 12, marginTop: 10 }}>
            {errorMsg}
          </Typography>
        )}
      </Paper>

      {/* ── Summary Chips ─────────────────────────────────────────────────── */}
      {hasData && (
        <div className="summary-chips-row">
          <SummaryChip count={counts.critical || 0} label="Critical" chipClass="chip-critical" />
          <SummaryChip count={counts.high     || 0} label="High"     chipClass="chip-high"     />
          <SummaryChip count={counts.medium   || 0} label="Medium"   chipClass="chip-medium"   />
          <SummaryChip count={counts.drop     || 0} label="Drops"    chipClass="chip-drop"     />
          <SummaryChip count={anomalies.length}     label="Total"    chipClass="chip-total"    />
        </div>
      )}

      {/* ── Timeline Chart ────────────────────────────────────────────────── */}
      <Paper className="chart-card" elevation={0}>
        {loading ? (
          <LoadingView />
        ) : hasData ? (
          <>
            <Typography className="chart-subtitle">
              Blue line = hourly consumption · Colored markers = anomaly points ·
              Red dashed line = configured max threshold ({thresholds.HourMaxErgCon} kWh)
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={380}
            />
          </>
        ) : (
          <EmptyState message="Select your filters and date range, then click Detect Anomalies to identify unusual energy consumption patterns." />
        )}
      </Paper>

      {/* ── Anomaly Details Table ─────────────────────────────────────────── */}
      {hasData && (
        <Paper className="table-card" elevation={0}>
          <div className="table-card-header">
            <ErrorOutlineIcon style={{ color: "#d32f2f", fontSize: 20 }} />
            Anomaly Details
            {anomalies.length === 0 && (
              <div className="no-anomaly-msg" style={{ marginLeft: 16 }}>
                <CheckCircleOutlineIcon style={{ fontSize: 18 }} />
                No anomalies detected for the selected period and settings.
              </div>
            )}
          </div>
          {anomalies.length > 0 && (
            <DataGrid
              rows={anomalies}
              columns={dataGridCols}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              density="compact"
              disableSelectionOnClick
              autoHeight
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f1f5f9",
                  fontWeight: 700,
                  fontSize: 12,
                },
                "& .MuiDataGrid-cell": { fontSize: 13 },
              }}
            />
          )}
        </Paper>
      )}
    </Box>
  );
};

export default EnergyAnomalyDetection;
