import React, { useEffect, useState } from "react";
import "./EnergyHeatMap.css";
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
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import BoltIcon from "@mui/icons-material/Bolt";
import BusinessIcon from "@mui/icons-material/Business";
import FactoryIcon from "@mui/icons-material/Factory";
import GridViewIcon from "@mui/icons-material/GridView";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import {
  EnergyHourReportService,
  BuildingEnergyHourReportService,
  getPlantDistributorFeeder,
  getIncomerDropDown,
  getBuildingDropDown,
  getFloorDropDown,
  getCategoryDropDown,
  getSubCategoryDropDown,
  getCategoryMeterDropDown,
  MachineListService,
} from "../../../../Services/NodeJsApiServices";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, "0")}:00`
);

const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")} ${dt.toLocaleString("en", {
    month: "short",
  })}`;
};

const formatDateTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return `${formatDate(dt)} ${String(dt.getHours()).padStart(2, "0")}:00`;
};

// ─── Data Transformers ────────────────────────────────────────────────────────

/**
 * Builds 24-row (hour × day) heatmap series from hourly data.
 * Handles both single-meter [ {date, energyConsum} ] and
 * multi-meter { data: { headers, data } } response shapes.
 */
const transformToTimePattern = (raw) => {
  let timeSlots = []; // [{dateStr, value}]

  if (Array.isArray(raw)) {
    // Single meter: sum is just the value
    timeSlots = raw.map((r) => ({
      dateStr: r.date || r.Date || "",
      value: parseFloat(r.energyConsum ?? r.EnergyConsum ?? 0) || 0,
    }));
  } else if (raw?.data?.data) {
    // Multi-meter: sum all consumption columns per row
    const consumCols = raw.data?.headers?.consumption || [];
    timeSlots = raw.data.data.map((row) => {
      const dateStr = row.Date || row.date || "";
      const total = consumCols.reduce(
        (acc, col) => acc + (parseFloat(row[col]) || 0),
        0
      );
      return { dateStr, value: parseFloat(total.toFixed(2)) };
    });
  }

  if (!timeSlots.length) return [];

  // Group into 24 series, one per hour-of-day
  const byHour = {}; // {"00:00": [{x: "01 Jan", y: 45.2}, ...]}
  HOURS.forEach((h) => { byHour[h] = []; });

  timeSlots.forEach(({ dateStr, value }) => {
    if (!dateStr) return;
    const dt = new Date(dateStr);
    if (isNaN(dt)) return;
    const hour = `${String(dt.getHours()).padStart(2, "0")}:00`;
    const dayLabel = formatDate(dt);
    if (byHour[hour]) {
      byHour[hour].push({ x: dayLabel, y: value });
    }
  });

  // Return 24 series in reverse order so 00:00 appears at the top
  return HOURS.map((h) => ({ name: h, data: byHour[h] })).reverse();
};

/**
 * Builds N-row (zone × time) heatmap series from multi-meter response.
 * Falls back to single-meter as a 1-row series.
 */
const transformToZoneComparison = (raw, modeLabel) => {
  if (Array.isArray(raw)) {
    // Single meter — one row
    const data = raw.map((r) => ({
      x: formatDateTime(r.date || r.Date || ""),
      y: parseFloat(r.energyConsum ?? r.EnergyConsum ?? 0) || 0,
    }));
    return [{ name: modeLabel || "Meter", data }];
  }

  if (raw?.data?.data) {
    const consumCols = raw.data?.headers?.consumption || [];
    const rows = raw.data.data;

    return consumCols.map((col) => ({
      name: col,
      data: rows.map((row) => ({
        x: formatDateTime(row.Date || row.date || ""),
        y: parseFloat(parseFloat(row[col] || 0).toFixed(2)),
      })),
    }));
  }

  return [];
};

// ─── Chart Options Builder ─────────────────────────────────────────────────────

const buildChartOptions = (series, viewType) => {
  const allValues = series.flatMap((s) => s.data.map((d) => d.y || 0));
  const maxVal = allValues.length ? Math.max(...allValues) : 100;
  const safeMax = maxVal > 0 ? maxVal : 1;

  return {
    chart: {
      type: "heatmap",
      toolbar: {
        show: true,
        tools: { download: true, selection: false, zoom: false, pan: false, reset: false },
      },
      animations: { enabled: true, speed: 400 },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.6,
        radius: 3,
        useFillColorAsStroke: false,
        colorScale: {
          ranges: [
            { from: 0,              to: safeMax * 0.01, color: "#e8f5e9", name: "None" },
            { from: safeMax * 0.01, to: safeMax * 0.25, color: "#00B074", name: "Low" },
            { from: safeMax * 0.25, to: safeMax * 0.50, color: "#FEB019", name: "Medium" },
            { from: safeMax * 0.50, to: safeMax * 0.75, color: "#FF4560", name: "High" },
            { from: safeMax * 0.75, to: safeMax,        color: "#7B2FBE", name: "Peak" },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 1 },
    xaxis: {
      type: "category",
      labels: {
        rotate: -45,
        style: { fontSize: "10px", colors: "#555" },
        hideOverlappingLabels: true,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "11px", colors: "#444" } },
      title: {
        text: viewType === "time" ? "Hour of Day" : "Zone / Meter",
        style: { fontSize: "11px", fontWeight: 600, color: "#444" },
      },
    },
    tooltip: {
      y: { formatter: (val) => `${(val || 0).toFixed(2)} kWh` },
    },
    legend: {
      show: true,
      position: "top",
      fontSize: "12px",
      onItemClick: { toggleDataSeries: false },
    },
    grid: { padding: { right: 20 } },
  };
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <div className="empty-state">
    <GridViewIcon className="empty-state-icon" />
    <p>{message}</p>
  </div>
);

const LoadingView = () => (
  <div className="loading-container">
    <CircularProgress size={40} style={{ color: "#051622" }} />
    <span>Generating heat map…</span>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

const EnergyHeatMap = () => {
  // ── Mode & View ─────────────────────────────────────────────────────────────
  const [mode, setMode]       = useState("plant");   // "plant" | "building"
  const [viewType, setViewType] = useState("time");  // "time" | "zone"

  // ── Date range ───────────────────────────────────────────────────────────────
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");

  // ── Plant hierarchy ─────────────────────────────────────────────────────────
  const [plantList,       setPlantList]       = useState([]);
  const [incomerList,     setIncomerList]     = useState([]);
  const [distributorList, setDistributorList] = useState([]);
  const [feederList,      setFeederList]      = useState([]);
  const [plantMeterList,  setPlantMeterList]  = useState([{ id: -1, displayName: "All" }]);

  const [selectedPlant,      setSelectedPlant]      = useState("");
  const [selectedIncomer,    setSelectedIncomer]    = useState("");
  const [selectedDistributor,setSelectedDistributor]= useState("");
  const [selectedFeeder,     setSelectedFeeder]     = useState("");
  const [selectedPlantMeter, setSelectedPlantMeter] = useState(-1);

  // ── Building hierarchy ───────────────────────────────────────────────────────
  const [buildingList,     setBuildingList]     = useState([]);
  const [floorList,        setFloorList]        = useState([]);
  const [categoryList,     setCategoryList]     = useState([]);
  const [subCategoryList,  setSubCategoryList]  = useState([]);
  const [bldgMeterList,    setBldgMeterList]    = useState([{ id: -1, displayName: "All" }]);

  const [selectedBuilding,    setSelectedBuilding]    = useState("");
  const [selectedFloor,       setSelectedFloor]       = useState("");
  const [selectedCategory,    setSelectedCategory]    = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedBldgMeter,   setSelectedBldgMeter]   = useState(-1);

  // ── Chart state ──────────────────────────────────────────────────────────────
  const [series,       setSeries]       = useState([]);
  const [chartOptions, setChartOptions] = useState({});
  const [loading,      setLoading]      = useState(false);
  const [hasData,      setHasData]      = useState(false);
  const [errorMsg,     setErrorMsg]     = useState("");

  // ── On mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Load plant list
    getPlantDistributorFeeder({}, (d) => setPlantList(d?.data || []), () => {});
    // Load plant meters (for All option)
    MachineListService(
      (d) => setPlantMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
    // Load building list
    getBuildingDropDown((d) => setBuildingList(d?.data || []), () => {});
  }, []);

  // Reset chart when mode changes
  useEffect(() => {
    setSeries([]);
    setHasData(false);
    setErrorMsg("");
  }, [mode]);

  // Re-render chart with new options when viewType changes (data already loaded)
  useEffect(() => {
    if (series.length > 0) {
      setChartOptions(buildChartOptions(series, viewType));
    }
  }, [viewType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Plant cascade handlers ────────────────────────────────────────────────────
  const handlePlantChange = (plantId) => {
    setSelectedPlant(plantId);
    setSelectedIncomer(""); setSelectedDistributor(""); setSelectedFeeder("");
    setDistributorList([]); setFeederList([]);
    if (!plantId) { setIncomerList([]); return; }
    getIncomerDropDown(
      { plantId },
      (d) => setIncomerList(d?.data || []),
      () => {}
    );
  };

  const handleIncomerChange = (incomerId) => {
    setSelectedIncomer(incomerId);
    setSelectedDistributor(""); setSelectedFeeder("");
    setFeederList([]);
    if (!incomerId) { setDistributorList([]); return; }
    // Distributors come bundled in plant data; filter by incomer
    const match = plantList.find((p) => p.id === selectedPlant || p.plantId === selectedPlant);
    const dists = match?.distributor?.filter((d) => d.incomerId === incomerId) || [];
    setDistributorList(dists);
  };

  const handleDistributorChange = (distId) => {
    setSelectedDistributor(distId);
    setSelectedFeeder("");
    if (!distId) { setFeederList([]); return; }
    const match = distributorList.find((d) => d.id === distId || d.distributerId === distId);
    setFeederList(match?.feeder || []);
  };

  // ── Building cascade handlers ─────────────────────────────────────────────────
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

  // ── Generate heatmap ──────────────────────────────────────────────────────────
  const handleGenerate = () => {
    if (!fromDate || !toDate) {
      setErrorMsg("Please select both From and To date/time.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    setSeries([]);
    setHasData(false);

    const onSuccess = (raw) => {
      setLoading(false);
      const s =
        viewType === "time"
          ? transformToTimePattern(raw)
          : transformToZoneComparison(raw, "Meter");

      if (!s.length || s.every((row) => !row.data.length)) {
        setHasData(false);
        setErrorMsg("No data returned for the selected filters and date range.");
        return;
      }
      setSeries(s);
      setChartOptions(buildChartOptions(s, viewType));
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
          meterId: selectedPlantMeter,
          plantId: selectedPlant || undefined,
          incomerId: selectedIncomer || undefined,
          distributerId: selectedDistributor || undefined,
          feederId: selectedFeeder || undefined,
        },
        onSuccess,
        onError
      );
    } else {
      BuildingEnergyHourReportService(
        {
          fromDate,
          toDate,
          meterId: selectedBldgMeter,
          buildingId: selectedBuilding || undefined,
          floorId: selectedFloor || undefined,
          categoryId: selectedCategory || undefined,
          subCategoryId: selectedSubCategory || undefined,
        },
        onSuccess,
        onError
      );
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const chartHeight =
    viewType === "time"
      ? 660
      : Math.max(380, (series.length || 1) * 34 + 120);

  const canGenerate = fromDate && toDate;

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Box className="heatmap-wrapper">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="heatmap-header">
        <BoltIcon style={{ color: "#FEB019", fontSize: 26 }} />
        <Typography variant="h6">Energy Heat Map</Typography>
      </div>

      {/* ── Mode Toggle ────────────────────────────────────────────────────── */}
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

      {/* ── Filter Panel ───────────────────────────────────────────────────── */}
      <Paper className="filter-panel" elevation={0}>
        <Grid container spacing={2} alignItems="flex-end">
          {mode === "plant" ? (
            <>
              {/* Plant */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Plant</InputLabel>
                  <Select
                    value={selectedPlant}
                    label="Plant"
                    onChange={(e) => handlePlantChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {plantList.map((p) => (
                      <MenuItem key={p.id ?? p.plantId} value={p.id ?? p.plantId}>
                        {p.displayName ?? p.plantName ?? p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Incomer */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedPlant}>
                  <InputLabel>Incomer</InputLabel>
                  <Select
                    value={selectedIncomer}
                    label="Incomer"
                    onChange={(e) => handleIncomerChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {incomerList.map((i) => (
                      <MenuItem key={i.id ?? i.incomerId} value={i.id ?? i.incomerId}>
                        {i.displayName ?? i.incomerName ?? i.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Distributor */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedIncomer}>
                  <InputLabel>Distributor</InputLabel>
                  <Select
                    value={selectedDistributor}
                    label="Distributor"
                    onChange={(e) => handleDistributorChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {distributorList.map((d) => (
                      <MenuItem key={d.id ?? d.distributerId} value={d.id ?? d.distributerId}>
                        {d.displayName ?? d.distributerName ?? d.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Feeder */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedDistributor}>
                  <InputLabel>Feeder</InputLabel>
                  <Select
                    value={selectedFeeder}
                    label="Feeder"
                    onChange={(e) => setSelectedFeeder(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {feederList.map((f) => (
                      <MenuItem key={f.id ?? f.feederId} value={f.id ?? f.feederId}>
                        {f.displayName ?? f.feederName ?? f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Meter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meter</InputLabel>
                  <Select
                    value={selectedPlantMeter}
                    label="Meter"
                    onChange={(e) => setSelectedPlantMeter(e.target.value)}
                  >
                    {plantMeterList.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          ) : (
            <>
              {/* Building */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Building</InputLabel>
                  <Select
                    value={selectedBuilding}
                    label="Building"
                    onChange={(e) => handleBuildingChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {buildingList.map((b) => (
                      <MenuItem key={b.id ?? b.buildingId} value={b.id ?? b.buildingId}>
                        {b.displayName ?? b.buildingName ?? b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Floor */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedBuilding}>
                  <InputLabel>Floor</InputLabel>
                  <Select
                    value={selectedFloor}
                    label="Floor"
                    onChange={(e) => handleFloorChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {floorList.map((f) => (
                      <MenuItem key={f.id ?? f.floorId} value={f.id ?? f.floorId}>
                        {f.displayName ?? f.floorName ?? f.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Category */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedFloor}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {categoryList.map((c) => (
                      <MenuItem key={c.id ?? c.categoryId} value={c.id ?? c.categoryId}>
                        {c.displayName ?? c.categoryName ?? c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sub-Category */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small" disabled={!selectedCategory}>
                  <InputLabel>Sub-Category</InputLabel>
                  <Select
                    value={selectedSubCategory}
                    label="Sub-Category"
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                  >
                    <MenuItem value=""><em>All</em></MenuItem>
                    {subCategoryList.map((s) => (
                      <MenuItem key={s.id ?? s.subCategoryId} value={s.id ?? s.subCategoryId}>
                        {s.displayName ?? s.subCategoryName ?? s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Meter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Meter</InputLabel>
                  <Select
                    value={selectedBldgMeter}
                    label="Meter"
                    onChange={(e) => setSelectedBldgMeter(e.target.value)}
                  >
                    {bldgMeterList.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* ── Date range ──────────────────────────────────────────────────── */}
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} sm={6} md={2}>
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

          {/* ── Generate button ─────────────────────────────────────────────── */}
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="generate-btn"
              fullWidth
              startIcon={<WbSunnyIcon />}
            >
              {loading ? "Generating…" : "Generate Heat Map"}
            </Button>
          </Grid>
        </Grid>

        {errorMsg && (
          <Typography
            style={{ color: "#d32f2f", fontSize: 12, marginTop: 10 }}
          >
            {errorMsg}
          </Typography>
        )}
      </Paper>

      {/* ── View Type Tabs ──────────────────────────────────────────────────── */}
      <Box className="view-tabs-wrapper">
        <Tabs
          value={viewType}
          onChange={(_, v) => setViewType(v)}
          textColor="inherit"
        >
          <Tab
            value="time"
            label="Time Pattern (Hour × Day)"
            icon={<BarChartIcon style={{ fontSize: 16 }} />}
            iconPosition="start"
          />
          <Tab
            value="zone"
            label="Zone Comparison"
            icon={<GridViewIcon style={{ fontSize: 16 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ── Chart Area ─────────────────────────────────────────────────────── */}
      <Paper className="chart-card" elevation={0}>
        {loading ? (
          <LoadingView />
        ) : hasData ? (
          <>
            <Typography className="chart-subtitle">
              {viewType === "time"
                ? "Each row = hour of day · Each column = calendar day · Color = kWh intensity"
                : "Each row = zone / meter · Each column = time slot · Color = kWh intensity"}
            </Typography>
            <ReactApexChart
              options={chartOptions}
              series={series}
              type="heatmap"
              height={chartHeight}
            />
          </>
        ) : (
          <EmptyState
            message={
              errorMsg ||
              "Select your filters, choose a date range, and click Generate Heat Map to visualise energy consumption patterns."
            }
          />
        )}
      </Paper>
    </Box>
  );
};

export default EnergyHeatMap;
