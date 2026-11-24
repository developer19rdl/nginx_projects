

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  Typography,
  Grid,
  Stack,
  Button,
  Box,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TodayIcon from "@mui/icons-material/Today";
import DateRangeIcon from "@mui/icons-material/DateRange";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SpeedIcon from "@mui/icons-material/Speed";
import HighQualityIcon from "@mui/icons-material/HighQuality";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import SemiGauge from "./SemiGauge";
import { OEEDashboardProduction, OEEDashboardAssembly, OEEDashboardPlant } from "../../Services/NodeJsApiServices";

// Sample Data
const lineData = [
  { date: "20/10/2025", s1: 95, s2: 85, s3: 60, s4: 10 },
  { date: "21/10/2025", s1: 22, s2: 48, s3: 70, s4: 8 },
  { date: "22/10/2025", s1: 58, s2: 74, s3: 50, s4: 5 },
  { date: "22/10/2025", s1: 48, s2: 24, s3: 30, s4: 25 },
  { date: "22/10/2025", s1: 58, s2: 94, s3: 10, s4: 65 },
];

const machineData = [
  { name: "TPP-AE255", oee: 28 },
  { name: "LC-01", oee: 97 },
  { name: "PB-100", oee: 76 },
  { name: "PB-150", oee: 95 },
  { name: "PP-160", oee: 26 },
  { name: "WC-01", oee: 96 },
  { name: "MW-01", oee: 76 },
];

const pieData1 = [
  { name: "TPP-AE255", value: 70, label: "01:10 Hrs" },
  { name: "LC-01", value: 75, label: "01:15 Hrs" },
  { name: "PP-160", value: 35, label: "00:30 Hrs" },
];

const pieData2 = [
  { name: "PB-100", value: 60, label: "01:00 Hrs" },
  { name: "TPP-AE2510", value: 50, label: "00:50 Hrs" },
  { name: "WC-01", value: 40, label: "00:40 Hrs" },
];

const pieData3 = [
  { name: "PB-150", value: 80, label: "01:30 Hrs" },
  { name: "MW-01", value: 55, label: "00:55 Hrs" },
  { name: "PP-160", value: 30, label: "00:25 Hrs" },
];

const COLORS = ["#7b61ff", "#39a1ff", "#B84E65"];

// Shift timings and current shift calculation
const shiftTimings = {
  1: { start: '06:00:00', end: '14:00:00' },
  2: { start: '14:00:00', end: '22:00:00' },
  3: { start: '22:00:00', end: '06:00:00' }
};

function getCurrentShift() {
  const now = new Date();
  const timeInKolkata = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const currentTime = timeInKolkata.getHours() * 3600 + timeInKolkata.getMinutes() * 60 + timeInKolkata.getSeconds();

  for (const [shift, { start, end }] of Object.entries(shiftTimings)) {
    const [startH, startM, startS] = start.split(':').map(Number);
    const [endH, endM, endS] = end.split(':').map(Number);
    let startSeconds = startH * 3600 + startM * 60 + startS;
    let endSeconds = endH * 3600 + endM * 60 + endS;

    if (endSeconds <= startSeconds) {
      if (currentTime >= startSeconds || currentTime < endSeconds) {
        return Number(shift);
      }
    } else {
      if (currentTime >= startSeconds && currentTime < endSeconds) {
        return Number(shift);
      }
    }
  }
  return 1; // Default to 1 if no match
}

// Default values
const currentDate = new Date();
const defaultMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
const defaultShift = getCurrentShift();

// -------------------- KPI Card Component --------------------
function KPIBox({ title, value, availability, performance, quality, cardId, selectedPeriod, selectedShift, onPeriodChange, onShiftChange, isLoading }) {
  const handlePeriodClick = (period) => {
    onPeriodChange(cardId, period);
  };

  const handleShiftClick = (shift) => {
    onShiftChange(cardId, shift);
  };

  const periodOptions = [
    { label: "Today", value: "today", icon: <TodayIcon sx={{ fontSize: 15 }} /> },
    { label: "Week",  value: "week",  icon: <DateRangeIcon sx={{ fontSize: 15 }} /> },
    { label: "Month", value: "month", icon: <CalendarMonthIcon sx={{ fontSize: 15 }} /> },
  ];

  const kpiRows = [
    { label: "Availability", value: availability, icon: <CheckCircleOutlineIcon sx={{ fontSize: 16, color: "#2e7d32" }} /> },
    { label: "Performance",  value: performance,  icon: <SpeedIcon sx={{ fontSize: 16, color: "#1565c0" }} /> },
    { label: "Quality",      value: quality,      icon: <HighQualityIcon sx={{ fontSize: 16, color: "#6a1b9a" }} /> },
  ];

  return (
    <Card
      sx={{
        minHeight: 280,
        p: 2.5,
        position: 'relative',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Overlay when loading */}
      {isLoading && (
        <Box sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(255,255,255,0.75)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
        }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Title */}
      <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: 0.3 }}>
        {title}
      </Typography>

      {/* Period Buttons */}
      <Stack direction="row" justifyContent="center" spacing={0.75} sx={{ mb: 2 }}>
        {periodOptions.map(({ label, value, icon }) => (
          <Button
            key={value}
            variant={selectedPeriod === value ? "contained" : "outlined"}
            onClick={() => handlePeriodClick(value)}
            disabled={isLoading}
            startIcon={icon}
            size="small"
            sx={{
              textTransform: "none",
              borderRadius: 5,
              px: 1.5,
              py: 0.4,
              fontWeight: 600,
              fontSize: "0.72rem",
              minWidth: 0,
              transition: "all 0.2s ease",
              boxShadow: selectedPeriod === value ? 2 : 0,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: 3,
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Stack>

      {/* Main Content */}
      <Grid container spacing={1} alignItems="center">
        {/* Gauge */}
        <Grid item xs={6} sx={{ display: "flex", justifyContent: "center" }}>
          <SemiGauge min={0} max={100} value={value} unit="%" size={220} />
        </Grid>

        {/* KPI Details */}
        <Grid item xs={6}>
          <Stack spacing={1} sx={{ pl: 1.5 }}>
            {kpiRows.map(({ label, value: val, icon }) => (
              <Stack
                key={label}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.03)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' },
                  transition: 'background 0.2s',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={0.6}>
                  {icon}
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                    {label}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: "0.82rem" }}>
                  {val}%
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Grid>

        {/* Shift Buttons */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.75}
            sx={{ mt: 0.5, pt: 1, borderTop: '1px solid rgba(0,0,0,0.08)' }}
          >
            <Stack direction="row" alignItems="center" spacing={0.4}>
              <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: "0.78rem" }}>
                Shift:
              </Typography>
            </Stack>
            {[1, 2, 3, 4].map((shift) => (
              <Button
                key={shift}
                size="small"
                variant={selectedShift === shift ? "contained" : "outlined"}
                onClick={() => handleShiftClick(shift)}
                disabled={isLoading}
                sx={{
                  minWidth: 30,
                  width: 30,
                  height: 30,
                  p: 0,
                  borderRadius: "50%",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  transition: "all 0.2s ease",
                  boxShadow: selectedShift === shift ? 2 : 0,
                  '&:hover': {
                    transform: 'scale(1.18)',
                    boxShadow: 3,
                  },
                }}
              >
                {shift}
              </Button>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
// -------------------- Dashboard Component --------------------
export default function OEE_Dashboard() {
  const [plantData, setPlantData] = useState(null);
  const [productionData, setProductionData] = useState(null);
  const [assemblyData, setAssemblyData] = useState(null);
  const [plantLoading, setPlantLoading] = useState(false);
  const [productionLoading, setProductionLoading] = useState(false);
  const [assemblyLoading, setAssemblyLoading] = useState(false);
  const [plantPeriod, setPlantPeriod] = useState("today");
  const [plantShift, setPlantShift] = useState(defaultShift);
  const [productionPeriod, setProductionPeriod] = useState("today");
  const [productionShift, setProductionShift] = useState(defaultShift);
  const [assemblyPeriod, setAssemblyPeriod] = useState("today");
  const [assemblyShift, setAssemblyShift] = useState(defaultShift);
  const [openTrendsDialog, setOpenTrendsDialog] = useState(false);
  const [openMachineDialog, setOpenMachineDialog] = useState(false);
  const [openAssemblyDialog, setOpenAssemblyDialog] = useState(false);

  // Period and shift change handlers for individual cards
  const handlePeriodChange = (cardId, period) => {
    if (cardId === 1) {
      setPlantPeriod(period);
    } else if (cardId === 2) {
      setProductionPeriod(period);
    } else if (cardId === 3) {
      setAssemblyPeriod(period);
    }
  };

  const handleShiftChange = (cardId, shift) => {
    if (cardId === 1) {
      setPlantShift(shift);
    } else if (cardId === 2) {
      setProductionShift(shift);
    } else if (cardId === 3) {
      setAssemblyShift(shift);
    }
  };

  // Separate useEffect for each API call - optimized performance
  useEffect(() => {
    const payload = { period: plantPeriod, shift: plantShift };
    setPlantLoading(true);
    OEEDashboardPlant(payload, (response) => {
      setPlantData(response);
      setPlantLoading(false);
    }, (error) => {
      console.error('Plant API Error:', error);
      setPlantLoading(false);
    });
  }, [plantPeriod, plantShift]); // Only depends on plant card changes

  useEffect(() => {
    const payload = { period: productionPeriod, shift: productionShift };
    setProductionLoading(true);
    OEEDashboardProduction(payload, (response) => {
      setProductionData(response);
      setProductionLoading(false);
    }, (error) => {
      console.error('Production API Error:', error);
      setProductionLoading(false);
    });
  }, [productionPeriod, productionShift]); // Only depends on production card changes

  useEffect(() => {
    const payload = { period: assemblyPeriod, shift: assemblyShift };
    setAssemblyLoading(true);
    OEEDashboardAssembly(payload, (response) => {
      setAssemblyData(response);
      setAssemblyLoading(false);
    }, (error) => {
      console.error('Assembly API Error:', error);
      setAssemblyLoading(false);
    });
  }, [assemblyPeriod, assemblyShift]); // Only depends on assembly card changes

  // Initial load - call all APIs once when component mounts
  useEffect(() => {
    // Plant OEE Initial Load
    setPlantLoading(true);
    OEEDashboardPlant({ period: plantPeriod, shift: plantShift }, (response) => {
      setPlantData(response);
      setPlantLoading(false);
    }, (error) => {
      console.error('Plant API Error:', error);
      setPlantLoading(false);
    });

    // Production Floor OEE Initial Load
    setProductionLoading(true);
    OEEDashboardProduction({ period: productionPeriod, shift: productionShift }, (response) => {
      setProductionData(response);
      setProductionLoading(false);
    }, (error) => {
      console.error('Production API Error:', error);
      setProductionLoading(false);
    });

    // Assembly Floor OEE Initial Load
    setAssemblyLoading(true);
    OEEDashboardAssembly({ period: assemblyPeriod, shift: assemblyShift }, (response) => {
      setAssemblyData(response);
      setAssemblyLoading(false);
    }, (error) => {
      console.error('Assembly API Error:', error);
      setAssemblyLoading(false);
    });
  }, []); // Empty dependency array - only runs once on mount

  // const handlePlantSuccess = (dataObject) => {
  //   setPlantData(dataObject);
  //   console.log('Plant Data:', dataObject?.overall?.availability);
  // };

  // const handlePlantException = (errorObject) => {
  //   console.error('API Error:', errorObject);
  // };

  // const handleProductionSuccess = (dataObject) => {
  //   setProductionData(dataObject);
  // };

  // const handleProductionException = (errorObject) => {
  //   console.error('API Error:', errorObject);
  // };

  // const handleAssemblySuccess = (dataObject) => {
  //   setAssemblyData(dataObject);
  // };

  // const handleAssemblyException = (errorObject) => {
  //   console.error('API Error:', errorObject);
  // };
  return (
    // <Box sx={{ background: "#ddd", minHeight: "90vh", p: 2 }}>
    <>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {/* Row 1: KPI Cards */}
        <Grid item xs={12} md={4}>
          <KPIBox
            cardId={1}
            title="Plant OEE"
            value={plantData?.overall?.oee || 0}
            availability={plantData?.overall?.availability || 0}
            performance={plantData?.overall?.performance || 0}
            quality={plantData?.overall?.quality || 0}
            selectedPeriod={plantPeriod}
            selectedShift={plantShift}
            onPeriodChange={handlePeriodChange}
            onShiftChange={handleShiftChange}
            isLoading={plantLoading}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <KPIBox
            cardId={2}
            title="Production Floor OEE"
            value={productionData?.overall?.oee || 0}
            availability={productionData?.overall?.availability || 0}
            performance={productionData?.overall?.performance || 0}
            quality={productionData?.overall?.quality || 0}
            selectedPeriod={productionPeriod}
            selectedShift={productionShift}
            onPeriodChange={handlePeriodChange}
            onShiftChange={handleShiftChange}
            isLoading={productionLoading}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <KPIBox
            cardId={3}
            title="Assembly Floor OEE"
            value={assemblyData?.overall?.oee || 0}
            availability={assemblyData?.overall?.availability || 0}
            performance={assemblyData?.overall?.performance || 0}
            quality={assemblyData?.overall?.quality || 0}
            selectedPeriod={assemblyPeriod}
            selectedShift={assemblyShift}
            onPeriodChange={handlePeriodChange}
            onShiftChange={handleShiftChange}
            isLoading={assemblyLoading}
          />
        </Grid>

        {/* Row 2: LineChart & BarCharts */}
        {/* <Grid item xs={12} md={4}>
          
          <Card
            sx={{
              minHeight: 250,
              p: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 3,
              }
            }}
            onClick={() => setOpenTrendsDialog(true)}
          >
           
            <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
              OEE Trends
            </Typography>
            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={plantData?.lineGraph}
                // margin={{ right: 20, left: 10, bottom: 38}}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xFrame"
                    interval={0}
                    angle={-35}
                    tickMargin={12}
                    tickLine={false}
                    tickCount={5}
                    tick={{
                      fill: "black",
                      fontSize: 12,
                    }}
                  />
                  <YAxis>
                    <Label
                      value="OEE"
                      angle={-90}
                      position="insideLeft"
                      style={{
                        textAnchor: "middle",
                        fontWeight: 700,
                        fill: "Black",
                      }}
                    />
                  </YAxis>
                  <Tooltip />
                  <Legend verticalAlign="bottom"
                    wrapperStyle={{
                      marginBottom: -9, // 👈 pushes legend slightly UP
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="s1"
                    stroke="#0f6"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="s2"
                    stroke="#8b2"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="s3"
                    stroke="#f58"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="s4"
                    stroke="#27a"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#ff6c00"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid> */}

<Grid item xs={12} md={4}>
  <Card
    sx={{
      minHeight: 250,
      p: 2,
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3,
      },
    }}
    onClick={() => setOpenTrendsDialog(true)}
  >
    <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
      OEE Trends
    </Typography>

    <Box sx={{ height: 180 }}>
      {plantLoading ? (
        // ✅ Loader view
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        // ✅ Chart view
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plantData?.lineGraph}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="xFrame"
              interval={0}
              angle={-35}
              tickMargin={12}
              tickLine={false}
              tickCount={5}
              tick={{ fill: 'black', fontSize: 12 }}
            />
            <YAxis>
              <Label
                value="OEE"
                angle={-90}
                position="insideLeft"
                style={{
                  textAnchor: 'middle',
                  fontWeight: 700,
                  fill: 'Black',
                }}
              />
            </YAxis>
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                marginBottom: -9,
              }}
            />
            <Line type="monotone" dataKey="s1" stroke="#0f6" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="s2" stroke="#8b2" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="s3" stroke="#f58" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="s4" stroke="#27a" strokeWidth={2} dot={{ r: 2 }} />
            <Line type="monotone" dataKey="avg" stroke="#ff6c00" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>

        {/* <Grid item xs={12} md={4}>
          <Card
            sx={{
              minHeight: 250,
              p: 2,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: 3,
              }
            }}
            onClick={() => setOpenMachineDialog(true)}
          >
            <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1 }}>
              OEE - Machine / Cell
            </Typography>

            <Box sx={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    productionData?.machineWise?.map(item => ({
                      name: item.machineName,
                      oee: parseFloat(item.oee),
                    })) || machineData
                  }
                  margin={{ right: 20, left: 10, bottom: 38 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    tick={{ fontSize: 11 }}
                  >
                    <Label
                      position="bottom"
                      offset={25}
                      style={{ fontWeight: 600 }}
                    />
                  </XAxis>

                  <YAxis>
                    <Label
                      value="OEE"
                      angle={-90}
                      position="insideLeft"
                      style={{
                        textAnchor: "middle",
                        fontWeight: 700,
                        fill: "black",
                      }}
                    />
                  </YAxis>

                  <Tooltip />
                  <Bar dataKey="oee" fill="#39a1ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid> */}
        <Grid item xs={12} md={4}>
  <Card
    sx={{
      minHeight: 250,
      p: 2,
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3,
      },
    }}
    onClick={() => setOpenMachineDialog(true)}
  >
    <Typography
      variant="h6"
      align="center"
      sx={{ fontWeight: 800, mb: 1 }}
    >
      OEE - Machine / Cell
    </Typography>

    <Box sx={{ height: 180 }}>
      {productionLoading ? (
        // ✅ Loader while data is being fetched
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        // ✅ Chart once loading is complete
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={
              productionData?.machineWise?.map(item => ({
                name: item.machineName,
                oee: parseFloat(item.oee),
              })) || machineData
            }
            margin={{ right: 20, left: 10, bottom: 38 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="name"
              interval={0}
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 11 }}
            >
              <Label
                position="bottom"
                offset={25}
                style={{ fontWeight: 600 }}
              />
            </XAxis>

            <YAxis>
              <Label
                value="OEE"
                angle={-90}
                position="insideLeft"
                style={{
                  textAnchor: 'middle',
                  fontWeight: 700,
                  fill: 'black',
                }}
              />
            </YAxis>

            <Tooltip />
            <Bar dataKey="oee" fill="#39a1ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>


      <Grid item xs={12} md={4}>
  <Card
    sx={{
      minHeight: 250,
      p: 2,
      cursor: 'pointer',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 3,
      },
    }}
    onClick={() => setOpenAssemblyDialog(true)}
  >
    <Typography variant="h6" align="center" sx={{ fontWeight: 800, mb: 1 }}>
      OEE - Assembly / Cell
    </Typography>

    <Box sx={{ height: 180 }}>
      {assemblyLoading ? (
        // ✅ Loader shown while fetching data
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        // ✅ Chart shown after loading finishes
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={
              assemblyData?.machineWise?.map(item => ({
                name: item.machineName,
                oee: parseFloat(item.oee),
              })) || machineData
            }
            margin={{ right: 20, left: 10, bottom: 38 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            {/* X Axis */}
            <XAxis
              dataKey="name"
              interval={0}
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 11 }}
            >
              <Label
                position="bottom"
                offset={25}
                style={{ fontWeight: 600 }}
              />
            </XAxis>

            {/* Y Axis */}
            <YAxis>
              <Label
                value="OEE"
                angle={-90}
                position="insideLeft"
                style={{
                  textAnchor: 'middle',
                  fontWeight: 700,
                  fill: 'Black',
                }}
              />
            </YAxis>

            <Tooltip />
            <Bar dataKey="oee" fill="#39a1ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>


        {/* Row 3: PieChart Cards */}
        
        <Grid item xs={12} md={4}>
  <Card sx={{ minHeight: 250, p: 2 }}>
    <Typography
      variant="h6"
      align="center"
      sx={{ fontWeight: 800 }}
    >
      Major Downtimes - {plantData?.majorDowntimeValue || "12:34 Hrs"}
    </Typography>

    <Box sx={{ height: 180 }}>
      {plantLoading ? (
        // ✅ Loader while plant data (including downtime) is loading
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        // ✅ Pie Chart once data has loaded
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={plantData?.topDowntimeMachines || pieData1}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={false}
            >
              {(plantData?.topDowntimeMachines || pieData1).map(
                (entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                )
              )}
            </Pie>

            <Legend
              verticalAlign="middle"
              layout="vertical"
              align="right"
              formatter={(value) => {
                const item = (plantData?.topDowntimeMachines || pieData1).find(
                  (d) => d.name === value
                );
                return `${value} - ${item?.label || ""}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>


        <Grid item xs={12} md={4}>
  <Card sx={{ minHeight: 250, p: 2 }}>
    <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
      Major Downtimes - {productionData?.majorDowntimeValue || "12:34 Hrs"}
    </Typography>

    <Box sx={{ height: 180, position: "relative" }}>
      {productionLoading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={productionData?.topDowntimeMachines || pieData2}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={false}
            >
              {(productionData?.topDowntimeMachines || pieData2).map(
                (entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                )
              )}
            </Pie>
            <Legend
              verticalAlign="middle"
              layout="vertical"
              align="right"
              formatter={(value) =>
                `${value} - ${
                  (productionData?.topDowntimeMachines || pieData2).find(
                    (d) => d.name === value
                  )?.label
                }`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>

      <Grid item xs={12} md={4}>
  <Card sx={{ minHeight: 250, p: 2 }}>
    <Typography variant="h6" align="center" sx={{ fontWeight: 800 }}>
      Major Downtimes - {assemblyData?.majorDowntimeValue || "12:34 Hrs"}
    </Typography>

    <Box sx={{ height: 180, position: "relative" }}>
      {assemblyLoading ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={assemblyData?.topDowntimeMachines || pieData3}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={false}
            >
              {(assemblyData?.topDowntimeMachines || pieData3).map(
                (entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                )
              )}
            </Pie>
            <Legend
              verticalAlign="middle"
              layout="vertical"
              align="right"
              formatter={(value) =>
                `${value} - ${
                  (assemblyData?.topDowntimeMachines || pieData3).find(
                    (d) => d.name === value
                  )?.label
                }`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  </Card>
</Grid>
        {/* // </Box> */}
      </Grid>
      {/* Chart Dialogs */}
      {/* OEE Trends Dialog */}
      <Dialog
        open={openTrendsDialog}
        onClose={() => setOpenTrendsDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
        }}>
          <Typography variant="h5" sx={{ width: "60%", display: "flex", justifyContent: "flex-end", fontWeight: 600, align: "center" }}>
            OEE Trends
          </Typography>
          <div style={{ width: "40%", display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenTrendsDialog(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ height: '60vh', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plantData?.lineGraph || lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="xFrame"
                  interval={0}
                  angle={-35}
                  tickMargin={12}
                  tickLine={false}
                  tickCount={5}
                  tick={{
                    fill: "black",
                    fontSize: 12,
                  }}
                />
                <YAxis>
                  <Label
                    value="OEE"
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: "middle",
                      fontWeight: 900,
                      fill: "Black",
                    }}
                  />
                </YAxis>
                <Tooltip />
                <Legend verticalAlign="bottom"
                  wrapperStyle={{
                    marginBottom: -20, // 👈 pushes legend slightly UP
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="s1"
                  stroke="#0f6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="s2"
                  stroke="#8b2"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="s3"
                  stroke="#f58"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="s4"
                  stroke="#27a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  stroke="#ff6c00"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Machine/Cell Dialog */}
      <Dialog
        open={openMachineDialog}
        onClose={() => setOpenMachineDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex' }}
        >
          <Typography variant="h5" sx={{ width: "60%", display: "flex", justifyContent: "flex-end", fontWeight: 600, align: "center" }}>
            OEE - Machine / Cell
          </Typography>
          <div style={{ width: "40%", display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenMachineDialog(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ height: '60vh', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  productionData?.machineWise?.map((item) => ({
                    name: item.machineName,
                    oee: parseFloat(item.oee),
                  })) || machineData
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 0 }} // ✅ more space at bottom
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={80} // ✅ ensures enough room for rotated labels
                >
                  <Label
                    value="Machine Name"
                    position="bottom"
                    offset={-20}
                    style={{ fontWeight: 700 }}
                  />
                </XAxis>
                <YAxis>
                  <Label
                    value="OEE (%)"
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: 'middle',
                      fontWeight: 700,
                      fill: 'Black',
                    }}
                  />
                </YAxis>
                <Tooltip />
                <Bar dataKey="oee" fill="#39a1ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>


      {/* Assembly/Cell Dialog */}
      <Dialog
        open={openAssemblyDialog}
        onClose={() => setOpenAssemblyDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh', maxHeight: '90vh' },
        }}
      >
        <DialogTitle
          sx={{ display: 'flex' }}
        >
          <Typography variant="h5" sx={{ width: "60%", display: "flex", justifyContent: "flex-end", fontWeight: 600, align: "center" }}>
            OEE - Assembly / Cell
          </Typography>
          <div style={{ width: "40%", display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setOpenAssemblyDialog(false)}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ height: '60vh', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  assemblyData?.machineWise?.map((item) => ({
                    name: item.machineName,
                    oee: parseFloat(item.oee),
                  })) || machineData
                }
                margin={{ top: 20, right: 30, left: 20, bottom: 0 }} // 👈 increased bottom space
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  tick={{ fontSize: 12 }}
                  height={80} // 👈 adds more space for rotated labels
                >
                  <Label
                    value="Machine Name"
                    position="bottom"
                    offset={-20} // 👈 pushes axis label further down
                    style={{ fontWeight: 700 }}
                  />
                </XAxis>
                <YAxis>
                  <Label
                    value="OEE (%)"
                    angle={-90}
                    position="insideLeft"
                    style={{
                      textAnchor: 'middle',
                      fontWeight: 700,
                      fill: 'Black',
                    }}
                  />
                </YAxis>
                <Tooltip />
                <Bar dataKey="oee" fill="#39a1ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>

    </>
  );
}


