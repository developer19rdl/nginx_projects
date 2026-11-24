import React, { useEffect, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  TextField,
  Paper,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PerformanceMetricsMonth, PerformanceMetricsYear } from "../../../../Services/NodeJsApiServices";
import NotificationBar from '../../../../Utility/NotificationBar';


const PerformanceMetrics = () => {
  const [energyType, setEnergyType] = useState("Day");
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]); 
  const [notification,setNotification ] = useState({ open: false, message: "", severity: "success" });

  /* ------------------ TABLE COLUMNS ------------------ */
  const yearlyColumns = [
    { field: "year", headerName: "Financial Year", flex: 1 },
    { field: "actual", headerName: "Actual", flex: 1 },
    { field: "target", headerName: "Target", flex: 1 },
  ];

  const monthlyColumns = [
    { field: "month", headerName: "Month", flex: 1 },
    { field: "actual", headerName: "Actual", flex: 1 },
    { field: "target", headerName: "Target", flex: 1 },
  ];

  // uss

  const handleSearch = () => {
    PerformanceMetricsYear(
      {
        fromMonth,  
        toMonth
      },
      handleSuccussYear,
      handleErrorYear
    );  
    
    PerformanceMetricsMonth(
      {
        fromMonth,
        toMonth
      },
      handleSuccuss,
      handleError
    );            
  };   
  
const handleSuccussYear = (dataObject) => {
  const formatted = dataObject.data.map((item) => ({
    year: item.year,
    actual: item.powerPercentage,   // 🔑 FIX
    target: item.target,
    powerCost: item.powerCost,
    salesAmount: item.salesAmount
  }));
  setYearlyData(formatted);
  setNotification({ open:true, message:dataObject.message, severity:"success" });
};

useEffect(() => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1-12
  const currentYear = today.getFullYear();

  let fyStartYear;

  // Financial year logic (April–March)
  if (currentMonth >= 4) {
    fyStartYear = currentYear;
  } else {
    fyStartYear = currentYear - 1;
  }

  const defaultFromMonth = `${fyStartYear}-04`;
  const defaultToMonth = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  setFromMonth(defaultFromMonth);
  setToMonth(defaultToMonth);
}, []);


useEffect(() => {
  if (fromMonth && toMonth) {
    handleSearch();
  }
}, [fromMonth, toMonth]);

  const handleErrorYear = (error) => {
    console.error("Error fetching Performance Metrics Yearly Data:", error);
    setNotification({open:true, message:error.message, severity:"error"});
  };  

const handleSuccuss = (dataObject) => {
  const formatted = dataObject.data.map((item) => ({
    month: item.month,
    actual: item.powerPercentage,   // 🔑 FIX
    target: item.target,
    powerCost: item.powerCost,
    salesAmount: item.salesAmount
  }));

  setMonthlyData(formatted);
};

  const handleError = (error) => {
    console.error("Error fetching Performance Metrics MonthlyData:", error);
  };      

  return (

<Box sx={{ p: 2, height: "100vh", backgroundColor: "#f5f6fa" }}>

  {/* ================= FILTER BAR ================= */}
  <Paper sx={{ p: 2, mb: 2 }} elevation={2}>
    <Grid container spacing={2} alignItems="center">
      <Grid item md={3}>
        <TextField
          fullWidth
          type="month"
          label="From Month"
          size="small"
          value={fromMonth}
          onChange={(e) => setFromMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item md={3}>
        <TextField
          fullWidth
          type="month"
          label="To Month"
          size="small"
          value={toMonth}
          onChange={(e) => setToMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid item md={2}>
        <Button
          variant="contained"
          disabled={!fromMonth || !toMonth}
          onClick={handleSearch}
        >
          Search
        </Button>
      </Grid>
    </Grid>
  </Paper>

  {/* ================= 4 BOX GRID ================= */}
  <Grid container spacing={2} sx={{ height: "calc(100% - 90px)" }}>

    {/* YEAR CHART */}
    <Grid item md={6} sx={{ height: "45%" }}>
      <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
        <Typography fontWeight="bold" mb={1}>
          Yearly Performance
        </Typography>

        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="actual" fill="#2e7d32" />
            <Line dataKey="target" stroke="#3949ab" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>

    {/* MONTH CHART */}
    <Grid item md={6} sx={{ height: "45%" }}>
      <Paper sx={{ p: 2, height: "100%" }} elevation={3}>
        <Typography fontWeight="bold" mb={1}>
          Monthly Performance
        </Typography>

        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="actual" fill="#2e7d32" />
            <Line dataKey="target" stroke="#3949ab" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Grid>

    {/* YEAR TABLE */}
    <Grid item md={6} sx={{ height: "55%" }}>
      <Paper sx={{ p: 1, height: "100%" }} elevation={3}>
        <Typography fontWeight="bold" mb={1}>
          Yearly Data
        </Typography>

        <DataGrid
          rows={yearlyData.map((r, i) => ({ id: i, ...r }))}
          columns={yearlyColumns}
          pageSize={5}
          sx={{ height: "calc(100% - 40px)" }}
        />
      </Paper>
    </Grid>

    {/* MONTH TABLE */}
    <Grid item md={6} sx={{ height: "55%" }}>
      <Paper sx={{ p: 1, height: "100%" }} elevation={3}>
        <Typography fontWeight="bold" mb={1}>
          Monthly Data
        </Typography>
        <DataGrid
          rows={monthlyData.map((r, i) => ({ id: i, ...r }))}
          columns={monthlyColumns}
          pageSize={5}
          sx={{ height: "calc(100% - 40px)" }}
        />
      </Paper>
    </Grid>
    <NotificationBar 
    openNotification={notification.open}
    type={notification.severity}
    notificationContent={notification.message}
    handleClose={() => setNotification({ ...notification, open: false })}
    />
  </Grid>

</Box>
  );
};

export default PerformanceMetrics;
