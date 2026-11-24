import React, { useEffect, useState } from "react";
import "./Energy.css";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Grid,
  LinearProgress,
  TextField,
  Typography,
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
  BuildingEnergyReportService,
  BuildingEnergyHourReportService,
  getBuildingTop5energyReport,
  getBuildingEnergyGraphReport,
  getBuildingDropDown,
  getFloorDropDown,
  getCategoryDropDown,
  getSubCategoryDropDown,
  getCategoryMeterDropDown,
} from "../../../../Services/NodeJsApiServices";
import { Chart } from "react-google-charts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PIE_COLORS = ["#3FA2F6", "#FF4191", "#F4CE14", "#AF47D2", "#40A578"];

const getPieOptions = () => ({
  is3D: true,
  pieSliceText: "percentage",
  pieHole: 0,
  chartArea: { left: 0, top: 0, width: "100%", height: "100%" },
  legend: { position: "right", alignment: "center" },
});

const calculateOneMonthFrom = (date) => {
  if (!date) return "";
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
};

const getTotalValue = (header, total) => {
  if (header === "Date")  return "TOTAL";
  if (header === "Total") return total?.totConsumption ?? "0.00";
  return total?.[header] != null ? String(total[header]) : "0.00";
};

// ─── Component ────────────────────────────────────────────────────────────────

const BuildingEnergy = () => {
  // Filter state
  const [energyType, setEnergyType] = useState("Day");
  const [fromDay, setFromDay]       = useState("");
  const [toDay, setToDay]           = useState("");
  const [fromHour, setFromHour]     = useState("");
  const [toHour, setToHour]         = useState("");

  // Hierarchy dropdown data
  const [buildingList, setBuildingList]       = useState([]);
  const [floorList, setFloorList]             = useState([]);
  const [categoryList, setCategoryList]       = useState([]);
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [meterList, setMeterList]             = useState([{ id: -1, displayName: "All" }]);

  // Selections
  const [selectedBuilding, setSelectedBuilding]       = useState("");
  const [selectedFloor, setSelectedFloor]             = useState("");
  const [selectedCategory, setSelectedCategory]       = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedMeter, setSelectedMeter]             = useState(-1);

  // Report state
  const [reportResult, setReportResult]   = useState(null);
  const [pieData, setPieData]             = useState([]);
  const [graphData, setGraphData]         = useState([]);
  const [graphMaxValue, setGraphMaxValue] = useState(0);
  const [viewReport, setViewReport]       = useState(false);
  const [loader, setLoader]               = useState(false);

  // On mount: load buildings
  useEffect(() => {
    getBuildingDropDown(
      (d) => setBuildingList(d?.data || []),
      () => {}
    );
  }, []);

  // Reset results on type switch
  useEffect(() => {
    setReportResult(null);
    setPieData([]);
    setGraphData([]);
    setViewReport(false);
  }, [energyType]);

  // ── Cascade handlers ──────────────────────────────────────────────────────────

  const handleBuildingChange = (buildingId) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor(""); setSelectedCategory(""); setSelectedSubCategory(""); setSelectedMeter(-1);
    setFloorList([]); setCategoryList([]); setSubCategoryList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
    if (buildingId)
      getFloorDropDown({ buildingId }, (d) => setFloorList(d?.data || []), () => {});
  };

  const handleFloorChange = (floorId) => {
    setSelectedFloor(floorId);
    setSelectedCategory(""); setSelectedSubCategory(""); setSelectedMeter(-1);
    setCategoryList([]); setSubCategoryList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
    if (floorId)
      getCategoryDropDown(
        { buildingId: selectedBuilding, floorId },
        (d) => setCategoryList(d?.data || []),
        () => {}
      );
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(""); setSelectedMeter(-1);
    setSubCategoryList([]);
    setMeterList([{ id: -1, displayName: "All" }]);
    if (categoryId) {
      getSubCategoryDropDown({ categoryId }, (d) => setSubCategoryList(d?.data || []), () => {});
      getCategoryMeterDropDown(
        { buildingId: selectedBuilding, categoryId },
        (d) => setMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
        () => {}
      );
    }
  };

  const handleSubCategoryChange = (subCategoryId) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedMeter(-1);
    const catParams = { buildingId: selectedBuilding, categoryId: selectedCategory };
    if (subCategoryId) catParams.subCategoryId = subCategoryId;
    getCategoryMeterDropDown(
      catParams,
      (d) => setMeterList([{ id: -1, displayName: "All" }, ...(d?.data || [])]),
      () => {}
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    setReportResult(null); setPieData([]); setGraphData([]); setViewReport(false);

    const catParams = {
      buildingId:    selectedBuilding    || undefined,
      categoryId:    selectedCategory    || undefined,
      subCategoryId: selectedSubCategory || undefined,
    };

    if (energyType === "Day") {
      BuildingEnergyReportService(
        { fromDate: fromDay, toDate: toDay, meterId: selectedMeter, ...catParams },
        handleReportSuccess, handleReportException
      );
      getBuildingTop5energyReport(
        { fromDate: fromDay, toDate: toDay, ...catParams },
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
      getBuildingEnergyGraphReport(
        { fromDate: fromDay, toDate: toDay, ...catParams },
        (d) => { setGraphData(d?.data || []); setGraphMaxValue(d?.maxValue || 0); },
        () => {}
      );
    } else {
      BuildingEnergyHourReportService(
        { fromDate: fromHour, toDate: toHour, meterId: selectedMeter, ...catParams },
        handleReportSuccess, handleReportException
      );
    }
  };

  const handleReportSuccess = (dataObject) => {
    setReportResult(dataObject);
    setLoader(false);
    if (dataObject?.machine === false && energyType === "Hour") setViewReport(true);
  };
  const handleReportException = () => setLoader(false);

  // ── Derived values ────────────────────────────────────────────────────────────

  const isAllMeters   = reportResult?.machine === false;
  const isSingleMeter = reportResult?.machine === true;
  const consumHeaders = reportResult?.data?.headers?.consumption || [];
  const allHeaders    = consumHeaders; // no EB/Gen INPUT columns for building report
  const bodyRows      = reportResult?.data?.data || [];

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* FILTER SECTION */}
      <div className="energy_bottomContainer">
        <div className="energy_headerContainer">
          <span style={{ fontWeight: "bold", color: "#000000", fontFamily: "Roboto Slab" }}>
            BUILDING ENERGY CONSUMPTION REPORT
          </span>
        </div>

        <div className="energy_bottm_date_containet">
          <Grid container spacing={1} paddingLeft={"20px"} paddingRight={"20px"} alignItems="center">

            {/* Day / Hour toggle */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl component="fieldset">
                <RadioGroup row value={energyType} onChange={(e) => setEnergyType(e.target.value)}>
                  {["Day", "Hour"].map((val) => (
                    <FormControlLabel key={val} value={val} label={val}
                      control={<Radio sx={{ color: "#686D76", "&.Mui-checked": { color: "#000" } }} />}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* From Date */}
            <Grid item xs={12} sm={6} md={1.4} lg={1.4}>
              <TextField fullWidth size="small"
                label={energyType === "Day" ? "From Date" : "From Date Time"}
                type={energyType === "Day" ? "date" : "datetime-local"}
                value={energyType === "Day" ? fromDay : fromHour} required
                onChange={(e) => energyType === "Day" ? setFromDay(e.target.value) : setFromHour(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ max: energyType === "Day" ? calculateOneMonthFrom(toDay) : calculateOneMonthFrom(fromHour) }}
              />
            </Grid>

            {/* To Date */}
            <Grid item xs={12} sm={6} md={1.4} lg={1.4}>
              <TextField fullWidth size="small"
                label={energyType === "Day" ? "To Date" : "To Date Time"}
                type={energyType === "Day" ? "date" : "datetime-local"}
                value={energyType === "Day" ? toDay : toHour} required
                onChange={(e) => energyType === "Day" ? setToDay(e.target.value) : setToHour(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: energyType === "Day" ? fromDay : fromHour,
                  max: energyType === "Day" ? calculateOneMonthFrom(fromDay) : calculateOneMonthFrom(fromHour),
                }}
              />
            </Grid>

            {/* Building */}
            <Grid item xs={12} sm={6} md={1.4} lg={1.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Building</InputLabel>
                <Select label="Building" value={selectedBuilding}
                  onChange={(e) => handleBuildingChange(e.target.value)}>
                  {buildingList.map((b) => (
                    <MenuItem key={b.id} value={b.id}>{b.buildingName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Floor */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Floor</InputLabel>
                <Select label="Floor" value={selectedFloor}
                  disabled={!selectedBuilding || !floorList.length}
                  onChange={(e) => handleFloorChange(e.target.value)}>
                  {floorList.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.floorName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={selectedCategory}
                  disabled={!selectedFloor || !categoryList.length}
                  onChange={(e) => handleCategoryChange(e.target.value)}>
                  {categoryList.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.categoryName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sub-Category (always shown, disabled when no data) */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sub-Category</InputLabel>
                <Select label="Sub-Category" value={selectedSubCategory}
                  disabled={!selectedCategory || !subCategoryList.length}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}>
                  <MenuItem value=""><em>All</em></MenuItem>
                  {subCategoryList.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.subCategoryName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Energy Source */}
            <Grid item xs={12} sm={6} md={1.2} lg={1.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Energy Source</InputLabel>
                <Select label="Energy Source" value={selectedMeter}
                  onChange={(e) => setSelectedMeter(e.target.value)}>
                  {meterList.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.displayName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Search */}
            <Grid item xs={12} sm={6} md={1} lg={1} display="flex" alignItems="center">
              <Button variant="contained" size="small" onClick={handleSubmit} fullWidth>
                Search
              </Button>
            </Grid>

            {/* Pie chart — Top 5 */}
            {energyType === "Day" && pieData.length > 1 && isAllMeters && (
              <Grid item xs={12} md={5} lg={5}>
                <Typography style={{ fontWeight: "bold", marginBottom: "8px" }}>Top 5 Machines</Typography>
                <Chart chartType="PieChart" data={pieData} options={getPieOptions()} width="100%" height="290px" />
              </Grid>
            )}

            {/* Bar chart — KWh per day */}
            {energyType === "Day" && graphData.length > 0 && isAllMeters && (
              <Grid item xs={12} md={7} lg={7}>
                <Typography style={{ fontWeight: "bold", marginBottom: "8px" }}>Total KWh Per Day</Typography>
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

            {/* View / Hide Report button */}
            {energyType === "Day" && isAllMeters && bodyRows.length > 0 && (
              <Grid item xs={12} display="flex" justifyContent="center">
                <Button variant="contained" onClick={() => setViewReport((v) => !v)}>
                  {viewReport ? "Hide Report" : "View Report"}
                </Button>
              </Grid>
            )}
          </Grid>
        </div>

        {/* Single meter line chart */}
        {isSingleMeter && Array.isArray(reportResult.data) && (
          <div className="lineChartContainer">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reportResult.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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

        {loader && <Box sx={{ width: "100%" }}><LinearProgress /></Box>}
      </div>

      {/* TABLE SECTION */}
      <div className="energy_table_bottomContainer">
        <div className="energy_table_sub_bottomContainer">

          {/* All meters table */}
          {isAllMeters && viewReport && (
            <table id="customers">
              <thead>
                <tr>
                  <th colSpan={consumHeaders.length} style={{ textAlign: "center" }}>CONSUMPTION</th>
                </tr>
                <tr>
                  {allHeaders.map((h, i) => <th className="tableHeader" key={i}>{h}</th>)}
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
                <tr>
                  {allHeaders.map((h, i) => (
                    <td key={i} style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>
                      {getTotalValue(h, reportResult?.total)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td colSpan={allHeaders.length} className="bottomButtonContainer">
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item>
                        <Button variant="contained">Download CSV</Button>
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
                  <th>Date</th>
                  <th>Energy Consumption [kWh]</th>
                </tr>
              </thead>
              <tbody>
                {(reportResult?.data || []).map((item, i) => (
                  <tr key={i}><td>{item.date}</td><td>{item.energyConsum}</td></tr>
                ))}
                <tr>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>TOTAL</td>
                  <td style={{ fontWeight: "bold", textAlign: "center", color: "#000" }}>
                    {reportResult?.dateRangeTotalKWh}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="bottomButtonContainer">
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item><Button variant="contained">Download CSV</Button></Grid>
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

export default BuildingEnergy;
