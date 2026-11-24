import React, { useEffect, useState } from "react";
import "./Energy.css";
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
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  EnergyHourReportService,
  EnergyReportService,
  MachineListService,
  getTopFiveEnergyReport,
  getEnergyGraphReport,
  getPlantDistributorFeeder,
  getIncomerDropDown,
} from "../../../../Services/NodeJsApiServices";
import { DownloadEnergyXl } from "../../../../Services/DownloadCsvReportsService";
import { Chart } from "react-google-charts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#3FA2F6", "#FF4191", "#F4CE14", "#AF47D2", "#40A578"];

const getPieOptions = () => ({
  is3D: true,
  pieSliceText: "percentage",
  pieHole: 0,
  chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
  legend: { position: "right", alignment: "center" },
  slices: { 0: { offset: 0 }, 1: { offset: 0 }, 2: { offset: 0 }, 3: { offset: 0 }, 4: { offset: 0 } },
});

// Maps a header label to its value in the `total` response object.
// Incomer-type columns (Electric Board Incomer, Solar, Generator, Windmill, UPS)
// and meter columns are both keyed directly by their header label.
const getTotalValue = (header, total) => {
  if (header === "Date")       return "TOTAL";
  if (header === "Total")      return total?.totConsumption ?? "0.00";
  if (header === "Diff/loss")  return total?.totDiff         ?? "0.00";
  return total?.[header] != null ? String(total[header]) : "0.00";
};

const calculateOneMonthFrom = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
};

// "Cycle" reports each full day as 8 PM (previous day) → 8 PM (24h).
// "DayShift"/"NightShift" split that same cycle into its two 12-hour halves.
const CYCLE_TYPE_BY_ENERGY_TYPE = {
  Cycle:      "shift",
  DayShift:   "dayShift",
  NightShift: "nightShift",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Energy = () => {
  // Filter state
  const [energyType, setEnergyType]             = useState("Day");
  const [fromDay, setFromDay]                   = useState("");
  const [toDay, setToDay]                       = useState("");
  const [fromHour, setFromHour]                 = useState("");
  const [toHour, setToHour]                     = useState("");

  // Hierarchy dropdowns
  const [plantList, setPlantList]               = useState([]);
  const [incomerList, setIncomerList]           = useState([]);
  const [distributorList, setDistributorList]   = useState([]);
  const [feederList, setFeederList]             = useState([]);
  const [meterList, setMeterList]               = useState([{ id: -1, displayName: "All" }]);

  const [selectedPlant, setSelectedPlant]             = useState("");
  const [selectedCategory, setSelectedCategory]       = useState("");
  const [selectedIncomer, setSelectedIncomer]         = useState("");
  const [selectedDistributor, setSelectedDistributor] = useState("");
  const [selectedFeeder, setSelectedFeeder]           = useState("");
  const [selectedMeter, setSelectedMeter]             = useState(-1);

  // Report state
  const [reportResult, setReportResult]   = useState(null);
  const [pieData, setPieData]             = useState([]);
  const [graphData, setGraphData]         = useState([]);
  const [graphMaxValue, setGraphMaxValue] = useState(0);
  const [loader, setLoader]               = useState(false);

  // "Day", "Cycle", "DayShift" and "NightShift" all use date-only inputs and
  // the day-wise endpoints; only "Hour" uses date-time inputs and the hourly endpoint.
  const isDayFamily = energyType !== "Hour";
  const cycleType = CYCLE_TYPE_BY_ENERGY_TYPE[energyType] || "calendar";

  // ── On mount: load plants + all meters ─────────────────────────────────────
  useEffect(() => {
    getPlantDistributorFeeder({}, (d) => setPlantList(d?.data || []), () => {});
    MachineListService(
      (d) => setMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
  }, []);

  // Reset results when switching Day / Hour / Cycle
  useEffect(() => {
    setReportResult(null);
    setPieData([]);
    setGraphData([]);
  }, [energyType]);

  // ── Hierarchy cascade handlers ──────────────────────────────────────────────
  const handlePlantChange = (plantId) => {
    setSelectedPlant(plantId);
    setSelectedCategory("");
    setSelectedIncomer("");
    setSelectedDistributor("");
    setSelectedFeeder("");
    setSelectedMeter(-1);
    setIncomerList([]);
    setDistributorList([]);
    setFeederList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
    if (plantId) {
      // Load incomers for this plant
      getIncomerDropDown(
        { plantId },
        (d) => setIncomerList(d?.data || []),
        () => {}
      );
      // Load distributors for this plant
      getPlantDistributorFeeder(
        { plantId },
        (d) => setDistributorList(d?.data || []),
        () => {}
      );
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedIncomer("");
    setSelectedDistributor("");
    setSelectedFeeder("");
    setSelectedMeter(-1);
    setFeederList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
  };

  const handleIncomerChange = (incomerId) => {
    setSelectedIncomer(incomerId);
    setSelectedMeter(-1);
    setMeterList([{ id: -1, displayName: "All" }]);
  };

  const handleDistributorChange = (distributerId) => {
    setSelectedDistributor(distributerId);
    setSelectedFeeder("");
    setSelectedMeter(-1);
    setFeederList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
    if (distributerId) {
      getPlantDistributorFeeder(
        { plantId: selectedPlant, distributerId },
        (d) => setFeederList(d?.data || []),
        () => {}
      );
    }
  };

  const handleFeederChange = (feederId) => {
    setSelectedFeeder(feederId);
    setSelectedMeter(-1);
    if (feederId) {
      getPlantDistributorFeeder(
        { plantId: selectedPlant, distributerId: selectedDistributor, feederId },
        (d) => setMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
        () => {}
      );
    } else {
      setMeterList([{ id: -1, displayName: "All" }]);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    setReportResult(null);
    setPieData([]);
    setGraphData([]);

    const hierarchyParams = {
      plantId:       selectedPlant       || undefined,
      incomerId:     selectedIncomer     || undefined,
      distributerId: selectedDistributor || undefined,
      feederId:      selectedFeeder      || undefined,
    };

    if (isDayFamily) {
      EnergyReportService(
        { fromDate: fromDay, toDate: toDay, meterId: selectedMeter, cycleType, ...hierarchyParams },
        handleReportSuccess,
        handleReportException
      );
      getTopFiveEnergyReport(
        { fromDate: fromDay, toDate: toDay, cycleType, ...hierarchyParams },
        (d) => {
          const rows = d?.data || [];
          const transformed = rows.map((item, i) => [
            `${item.machine_name} : ${parseFloat(item.totalKWh).toFixed(2)} Kwh`,
            parseFloat(item.totalKWh),
            PIE_COLORS[i] || "#999",
          ]);
          setPieData([["Machine Name", "Total KWH", "Color"], ...transformed]);
        },
        () => {}
      );
      getEnergyGraphReport(
        { fromDate: fromDay, toDate: toDay, cycleType, ...hierarchyParams },
        (d) => {
          setGraphData(d?.data || []);
          setGraphMaxValue(d?.maxValue || 0);
        },
        () => {}
      );
    } else {
      EnergyHourReportService(
        { fromDate: fromHour, toDate: toHour, meterId: selectedMeter, ...hierarchyParams },
        handleReportSuccess,
        handleReportException
      );
    }
  };

  const handleReportSuccess = (dataObject) => {
    setReportResult(dataObject);
    setLoader(false);
  };

  const handleReportException = () => setLoader(false);

  // ── Derived display values ──────────────────────────────────────────────────
  const isAllMeters     = reportResult?.machine === false;
  const isSingleMeter   = reportResult?.machine === true;
  const allHeaders      = isAllMeters
    ? [
        ...(reportResult.data?.headers?.consumption || []),
        ...(reportResult.data?.headers?.input       || []),
      ]
    : [];
  const consumHeaders   = reportResult?.data?.headers?.consumption || [];
  const inputHeaders    = reportResult?.data?.headers?.input       || [];
  const bodyRows        = reportResult?.data?.data                 || [];

  // Single-meter table: the period's opening read is the first bucket that has
  // a reading, its closing read is the last one ("-" when no bucket has a reading).
  const singleMeterRows  = isSingleMeter && Array.isArray(reportResult.data) ? reportResult.data : [];
  const firstOpeningRead = singleMeterRows.find((r) => r.openingRead !== "-")?.openingRead ?? "-";
  const lastClosingRead  = [...singleMeterRows].reverse().find((r) => r.closingRead !== "-")?.closingRead ?? "-";

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── FILTER SECTION ─────────────────────────────────────────────────── */}
      <div className="energy_bottomContainer">
        <div className="energy_headerContainer">
          <span style={{ fontWeight: "bold", color: "#000000", fontFamily: "Roboto Slab" }}>
            Building ENERGY CONSUMPTION REPORT
          </span>
        </div>

        <div className="energy_bottm_date_containet">
          <Grid container spacing={1} paddingLeft={"20px"} paddingRight={"20px"} alignItems="center">

            {/* Energy Type (Day / Hour / Report Cycle) */}
            <Grid item xs={12} sm={6} md={1.6} lg={1.6}>
              <FormControl fullWidth size="small">
                <InputLabel>Energy Type</InputLabel>
                <Select
                  label="Energy Type"
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value)}
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

            {/* From Date / DateTime */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <TextField
                fullWidth
                size="small"
                label={isDayFamily ? "From Date" : "From Date Time"}
                type={isDayFamily ? "date" : "datetime-local"}
                value={isDayFamily ? fromDay : fromHour}
                required
                onChange={(e) =>
                  isDayFamily
                    ? setFromDay(e.target.value)
                    : setFromHour(e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  max: isDayFamily
                    ? calculateOneMonthFrom(toDay)
                    : calculateOneMonthFrom(fromHour),
                }}
              />
            </Grid>

            {/* To Date / DateTime */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <TextField
                fullWidth
                size="small"
                label={isDayFamily ? "To Date" : "To Date Time"}
                type={isDayFamily ? "date" : "datetime-local"}
                value={isDayFamily ? toDay : toHour}
                required
                onChange={(e) =>
                  isDayFamily
                    ? setToDay(e.target.value)
                    : setToHour(e.target.value)
                }
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: isDayFamily ? fromDay : fromHour,
                  max: isDayFamily
                    ? calculateOneMonthFrom(fromDay)
                    : calculateOneMonthFrom(fromHour),
                }}
              />
            </Grid>

            {/* Plant */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Plant</InputLabel>
                <Select
                  label="Plant"
                  value={selectedPlant}
                  onChange={(e) => handlePlantChange(e.target.value)}
                >
                  {plantList.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.plantName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={!selectedPlant}
                >
                  <MenuItem value="Outgoing">Outgoing</MenuItem>
                  <MenuItem value="Incomer">Incomer</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Incomer */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Incomer</InputLabel>
                <Select
                  label="Incomer"
                  value={selectedIncomer}
                  onChange={(e) => handleIncomerChange(e.target.value)}
                  disabled={!selectedPlant || incomerList.length === 0}
                >
                  {incomerList.map((inc) => (
                    <MenuItem key={inc.id} value={inc.id}>{inc.incomerName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Distributor */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Distributor</InputLabel>
                <Select
                  label="Distributor"
                  value={selectedDistributor}
                  onChange={(e) => handleDistributorChange(e.target.value)}
                  disabled={!selectedPlant}
                >
                  {distributorList.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.distributorName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Feeder / Sub Distributor */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Feeder/Sub Distributor</InputLabel>
                <Select
                  label="Feeder/Sub Distributor"
                  value={selectedFeeder}
                  onChange={(e) => handleFeederChange(e.target.value)}
                  disabled={!selectedDistributor}
                >
                  {feederList.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.feederName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Energy Source */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Energy Source</InputLabel>
                <Select
                  label="Energy Source"
                  value={selectedMeter}
                  onChange={(e) => setSelectedMeter(e.target.value)}
                >
                  {meterList.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search */}
            <Grid item xs={12} sm={6} md={0.8} lg={0.8} display="flex" alignItems="center">
              <Button variant="contained" size="small" onClick={handleSubmit} fullWidth>
                Search
              </Button>
            </Grid>

            {/* ── CHARTS (Day/Cycle + All meters only) ───────────────────── */}
            {isDayFamily && pieData.length > 1 && isAllMeters && (
              <Grid item xs={12} md={5} lg={5}>
                <Typography style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Top 5 Machines
                </Typography>
                <Chart
                  chartType="PieChart"
                  data={pieData}
                  options={getPieOptions()}
                  width="100%"
                  height="290px"
                />
              </Grid>
            )}

            {isDayFamily && graphData.length > 0 && isAllMeters && (
              <Grid item xs={12} md={7} lg={7}>
                <Typography style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  Total KWh Per Day
                </Typography>
                <ResponsiveContainer width="100%" height={290}>
                  <BarChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, graphMaxValue]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalKWh" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            )}

          </Grid>
        </div>

        {/* Single meter line chart */}
        {isSingleMeter && Array.isArray(reportResult.data) && (
          <div className="lineChartContainer">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={reportResult.data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="energyConsum" stroke="#8884d8" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {loader && (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}
      </div>

      {/* ── TABLE SECTION ──────────────────────────────────────────────────── */}
      <div className="energy_table_bottomContainer">
        <div className="energy_table_sub_bottomContainer">

          {/* All meters table */}
          {isAllMeters && bodyRows.length > 0 && (
            <table id="customers">
              {/* Two-level header */}
              <thead>
                <tr>
                  <th
                    colSpan={consumHeaders.length}
                    style={{ textAlign: "center" }}
                  >
                    CONSUMPTION
                  </th>
                  <th
                    colSpan={inputHeaders.length - 1}
                    style={{ textAlign: "center" }}
                  >
                    INCOMER
                  </th>
                  <th />
                </tr>
                <tr>
                  {allHeaders.map((h, i) => (
                    <th className="tableHeader" key={i}>{h}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri}>
                    {Object.values(row).map((val, ci) => (
                      <td className="tableData" key={ci}>{val}</td>
                    ))}
                  </tr>
                ))}

                {/* TOTAL row */}
                <tr>
                  {allHeaders.map((h, i) => (
                    <td
                      key={i}
                      style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}
                    >
                      {getTotalValue(h, reportResult?.total)}
                    </td>
                  ))}
                </tr>

                {/* Download row */}
                <tr>
                  <td colSpan={allHeaders.length} className="bottomButtonContainer">
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={() =>
                            DownloadEnergyXl(
                              {
                                fromDate:      isDayFamily ? fromDay : fromHour,
                                toDate:        isDayFamily ? toDay   : toHour,
                                meterId:       selectedMeter,
                                plantId:       selectedPlant       || undefined,
                                incomerId:     selectedIncomer     || undefined,
                                distributerId: selectedDistributor || undefined,
                                feederId:      selectedFeeder      || undefined,
                              },
                              () => {},
                              () => {}
                            )
                          }
                        >
                          Download CSV
                        </Button>
                      </Grid>
                    </Grid>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Single meter table */}
          {isSingleMeter && (
            <table id="customers">
              <thead>
                <tr>
                  <th colSpan={4} style={{ textAlign: "center" }}>
                    {reportResult?.meterName || "Meter"}
                  </th>
                </tr>
                <tr>
                  <th>{isDayFamily ? "Date" : "Date / Hr"}</th>
                  <th>Opening Read [kWh]</th>
                  <th>Closing Read [kWh]</th>
                  <th>Consumption [kWh]</th>
                </tr>
              </thead>
              <tbody>
                {singleMeterRows.map((item, i) => (
                  <tr key={i}>
                    <td>{item.date}</td>
                    <td>{item.openingRead}</td>
                    <td>{item.closingRead}</td>
                    <td>{item.energyConsum}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>TOTAL</td>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>{firstOpeningRead}</td>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>{lastClosingRead}</td>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>{reportResult?.dateRangeTotalKWh}</td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    className="bottomButtonContainer"
                  >
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <Button
                          variant="contained"
                          onClick={() =>
                            DownloadEnergyXl(
                              {
                                fromDate:      isDayFamily ? fromDay : fromHour,
                                toDate:        isDayFamily ? toDay   : toHour,
                                meterId:       selectedMeter,
                                plantId:       selectedPlant       || undefined,
                                incomerId:     selectedIncomer     || undefined,
                                distributerId: selectedDistributor || undefined,
                                feederId:      selectedFeeder      || undefined,
                              },
                              () => {},
                              () => {}
                            )
                          }
                        >
                          Download CSV
                        </Button>
                      </Grid>
                    </Grid>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Energy;
