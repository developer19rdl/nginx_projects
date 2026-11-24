import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import GaugeChart from "react-gauge-chart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  Cell,
} from "recharts";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import buildingImg from "../../Assets/Images/LenovoBuilding.jpg";
import FloorImg from "../../Assets/Images/THIRD-FLOOR-PLAN-Mar-24.jpg";
import tower from "../../Assets/Images/Electric_Transmision_100.png";
import energy from "../../Assets/Images/Green_Energy_100.png";
import alert from "../../Assets/Images/icons8-alert-50.png";
import co2 from "../../Assets/Images/CO2_100.png";
import Generator from "../../Assets/Images/Generator_100.png";
import SemiGauge from "./SemiGaugeHVAS";
import FloorWiseModel from "../EMS_Dashboard/FloorWiseModel";
import CatergoryWiseModel from "../EMS_Dashboard/CatergoryWiseModel";
import DayWiseModel from "../EMS_Dashboard/DayWiseModel";
import HourWiseModel from "../EMS_Dashboard/HourWiseModel";

const HVAS_Dashboard = (props) => {
  const [pf, setPf] = useState(0.9); // 0..1
  const [kw, setKw] = useState(107); // 0..200
  const [temp, setTemp] = useState(70); // 0..120
  const [isModalOpenFloor, setIsModalOpenFloor] = useState(false);
  const [isModalOpenCatergory, setIsModalOpenCatergory] = useState(false);
  const [isModalOpenDay, setIsModalOpenDay] = useState(false);
  const [isModalOpenhour, setIsModalOpenHour] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [modalData, setModalData] = useState([]);
  const [showFloor, setShowFloor] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleForwardClick = () => {
    setShowFloor(true);
    setImageZoom(1);
  };

  const handleBackwardClick = () => {
    setShowFloor(false);
    setImageZoom(1);
  };
  const databarfloor = [
    { name: "Floor 1", uv: 400, pv: 140, avgConsum: 200 },
    { name: "Floor 2", uv: 300, pv: 138, avgConsum: 200 },
    { name: "Floor 3", uv: 200, pv: 500, avgConsum: 200 },
    { name: "Floor 4", uv: 278, pv: 190, avgConsum: 200 },
    { name: "Floor 5", uv: 189, pv: 180, avgConsum: 200 },
    { name: "Floor 6", uv: 239, pv: 150, avgConsum: 200 },
    { name: "Floor 7", uv: 349, pv: 80, avgConsum: 200 },
  ];

  const databarshops = [
    { name: "Pizza Hut", uv: 300, pv: 120, avgConsum: 200 },
    { name: "KFC", uv: 250, pv: 170, avgConsum: 200 },
    { name: "McDonald's", uv: 400, pv: 90, avgConsum: 200 },
    { name: "Levi's", uv: 200, pv: 170, avgConsum: 200 },
    { name: "Zara", uv: 210, pv: 160, avgConsum: 200 },
    { name: "Nike", uv: 230, pv: 390, avgConsum: 200 },
    { name: "Adidas", uv: 280, pv: 90, avgConsum: 200 },
  ];

  const databarcategory = [
    { name: "Common Area", uv: 400, pv: 340, avgConsum: 500 },
    { name: "AHU", uv: 400, pv: 1000, avgConsum: 500 },
    { name: "Customer", uv: 1000, pv: 159, avgConsum: 500 },
    { name: "STP", uv: 200, pv: 160, avgConsum: 500 },
    { name: "Pump House", uv: 278, pv: 308, avgConsum: 500 },
  ];

  const databardatwise = [
    { name: "1", uv: 400, pv: 240, avgConsum: 500 },
    { name: "2", uv: 300, pv: 196, avgConsum: 500 },
    { name: "3", uv: 180, pv: 335, avgConsum: 500 },
    { name: "4", uv: 40, pv: 1000, avgConsum: 500 },
    { name: "6", uv: 198, pv: 452, avgConsum: 500 },
    { name: "7", uv: 120, pv: 234, avgConsum: 500 },
    { name: "8", uv: 250, pv: 249, avgConsum: 500 },
    { name: "9", uv: 120, pv: 349, avgConsum: 500 },
    { name: "10", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "11", uv: 250, pv: 239, avgConsum: 500 },
    { name: "12", uv: 125, pv: 234, avgConsum: 500 },
    { name: "12", uv: 120, pv: 239, avgConsum: 500 },
    { name: "13", uv: 150, pv: 249, avgConsum: 500 },
    { name: "14", uv: 150, pv: 249, avgConsum: 500 },
    { name: "15", uv: 125, pv: 349, avgConsum: 500 },
    { name: "16", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "17", uv: 350, pv: 239, avgConsum: 500 },
    { name: "18", uv: 125, pv: 349, avgConsum: 500 },
    { name: "19", uv: 145, pv: 234, avgConsum: 500 },
    { name: "20", uv: 399, pv: 334, avgConsum: 500 },
    { name: "21", uv: 280, pv: 39, avgConsum: 500 },
    { name: "22", uv: 250, pv: 239, avgConsum: 500 },
    { name: "23", uv: 10, pv: 239, avgConsum: 500 },
    { name: "24", uv: 90, pv: 29, avgConsum: 500 },
    { name: "25", uv: 1250, pv: 239, avgConsum: 500 },
    { name: "26", uv: 150, pv: 239, avgConsum: 500 },
    { name: "27", uv: 1250, pv: 439, avgConsum: 500 },
    { name: "28", uv: 125, pv: 239, avgConsum: 500 },
    { name: "29", uv: 150, pv: 239, avgConsum: 500 },
    { name: "30", uv: 300, pv: 339, avgConsum: 500 },
    { name: "31", uv: 230, pv: 239, avgConsum: 500 },
  ];

  const databarpeakhourDemand = [
    { name: "1hr", uv: 400, pv: 240, avgConsum: 500 },
    { name: "2hr", uv: 300, pv: 196, avgConsum: 500 },
    { name: "3hr", uv: 154, pv: 1000, avgConsum: 500 },
    { name: "4hr", uv: 214, pv: 400, avgConsum: 500 },
    { name: "5hr", uv: 129, pv: 492, avgConsum: 500 },
    { name: "6hr", uv: 190, pv: 249, avgConsum: 500 },
    { name: "7hr", uv: 125, pv: 249, avgConsum: 500 },
    { name: "8hr", uv: 250, pv: 349, avgConsum: 500 },
    { name: "9hr", uv: 350, pv: 249, avgConsum: 500 },
    { name: "10hr", uv: 450, pv: 249, avgConsum: 500 },
    { name: "11hr", uv: 110, pv: 249, avgConsum: 500 },
    { name: "12hr", uv: 150, pv: 449, avgConsum: 500 },
    { name: "13hr", uv: 250, pv: 249, avgConsum: 500 },
    { name: "14hr", uv: 350, pv: 249, avgConsum: 500 },
    { name: "15hr", uv: 120, pv: 249, avgConsum: 500 },
    { name: "16hr", uv: 190, pv: 149, avgConsum: 500 },
    { name: "17hr", uv: 200, pv: 249, avgConsum: 500 },
    { name: "18hr", uv: 350, pv: 1005, avgConsum: 500 },
    { name: "19hr", uv: 450, pv: 255, avgConsum: 500 },
    { name: "20hr", uv: 350, pv: 249, avgConsum: 500 },
    { name: "21hr", uv: 150, pv: 167, avgConsum: 500 },
    { name: "22hr", uv: 100, pv: 249, avgConsum: 500 },
    { name: "23hr", uv: 150, pv: 199, avgConsum: 500 },
    { name: "24hr", uv: 200, pv: 249, avgConsum: 500 },
  ];

  const handleBarClick = (data) => {
    console.log("data", data);
    setSelectedFloor(data.name);
    // Replace this with API call or logic to get floor-specific data
    setModalData(databarfloor);
    setIsModalOpenFloor(true);
  };

  const currentData = showFloor ? databarshops : databarfloor;
  const currentitle = showFloor ? "Customer Wise Consumption" : "BTU Meter";

  return (
    <Box p={2}>
      {/* Top Summary Cards */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} sm={6} xl={2.4}>
          <Card sx={{ backgroundColor: "#5D5D5D", color: "#fff", height: 100 }}>
            <CardContent sx={{ position: "relative", p: 1 }}>
              {/* Top-left Icon */}
              <Box
                component="img"
                src={tower}
                alt="Tower Icon"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              />

              {/* Centered Title */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                EB
              </Typography>

              {/* Arrow Icon */}
              <ArrowUpwardIcon
                sx={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  color: "lime",
                  fontSize: 35,
                }}
              />

              {/* Percentage Text below arrow */}
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  top: 55,
                  right: 18,
                  color: "lime",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                23%
              </Typography>

              {/* Center Value */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  26
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "17px",
                    fontWeight: "normal",
                    ml: 0.5,
                    mb: "2px",
                  }}
                >
                  Mw
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sm={6} xl={2.4}>
          <Card sx={{ backgroundColor: "#5D5D5D", color: "#fff", height: 100 }}>
            <CardContent sx={{ position: "relative", p: 1 }}>
              {/* Top-left Icon */}
              <Box
                component="img"
                src={energy}
                alt="Tower Icon"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              />

              {/* Centered Title */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Green Energy
              </Typography>

              {/* Arrow Icon */}
              <ArrowUpwardIcon
                sx={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  color: "lime",
                  fontSize: 35,
                }}
              />

              {/* Percentage Text below arrow */}
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  top: 55,
                  right: 18,
                  color: "lime",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                23%
              </Typography>

              {/* Center Value */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  12
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "17px",
                    fontWeight: "normal",
                    ml: 0.5,
                    mb: "2px",
                  }}
                >
                  Kw
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sm={6} xl={2.4}>
          <Card sx={{ backgroundColor: "#5D5D5D", color: "#fff", height: 100 }}>
            <CardContent sx={{ position: "relative", p: 1 }}>
              {/* Top-left Icon */}
              <Box
                component="img"
                src={Generator}
                alt="Tower Icon"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              />

              {/* Centered Title */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Generator
              </Typography>

              {/* Arrow Icon */}
              <ArrowUpwardIcon
                sx={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  color: "lime",
                  fontSize: 35,
                }}
              />

              {/* Percentage Text below arrow */}
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  top: 55,
                  right: 18,
                  color: "lime",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                23%
              </Typography>

              {/* Center Value */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  12
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "17px",
                    fontWeight: "normal",
                    ml: 0.5,
                    mb: "2px",
                  }}
                >
                  Kw
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4} sm={6} xl={2.4}>
          <Card sx={{ backgroundColor: "#5D5D5D", color: "#fff", height: 100 }}>
            <CardContent sx={{ position: "relative", p: 1 }}>
              {/* Top-left Icon */}
              <Box
                component="img"
                src={co2}
                alt="Tower Icon"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              />

              {/* Centered Title */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                CO2
              </Typography>

              {/* Arrow Icon */}
              <ArrowUpwardIcon
                sx={{
                  position: "absolute",
                  top: 18,
                  right: 18,
                  color: "lime",
                  fontSize: 35,
                }}
              />

              {/* Percentage Text below arrow */}
              <Typography
                variant="body2"
                sx={{
                  position: "absolute",
                  top: 55,
                  right: 18,
                  color: "lime",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                23%
              </Typography>

              {/* Center Value */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  1
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "17px",
                    fontWeight: "normal",
                    ml: 0.5,
                    mb: "2px",
                  }}
                >
                  Kg
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4} sm={6} xl={2.4}>
          <Card sx={{ backgroundColor: "#5D5D5D", color: "#fff", height: 100 }}>
            <CardContent sx={{ position: "relative", p: 1 }}>
              {/* Top-left Icon */}
              <Box
                component="img"
                src={alert}
                alt="Tower Icon"
                sx={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 40,
                  height: 40,
                }}
              />

              {/* Centered Title */}
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Alert
              </Typography>

              {/* Arrow Icon */}

              {/* Center Value */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "flex-end",
                  mt: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                  }}
                >
                  5
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 1: 3 small + 1 wide card */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 180 }}>
              <CardContent
                sx={{
                  width: "100%",
                  padding: 1,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {/* Centered Text at the Top */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Outdoor Tempartaure
                </Typography>

                <SemiGauge
                  min={0}
                  max={200}
                  value={37}
                  unit="°"
                  thickness={12}
                  size={220}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 180 }}>
              <CardContent
                sx={{
                  width: "100%",
                  padding: 1,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {/* Centered Text at the Top */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Indoor Temparature
                </Typography>

                {/* Gauge Container */}
                <div className="progress-containers">
                  <SemiGauge
                    min={0}
                    max={200}
                    value={107}
                    unit="°"
                    size={220}
                  />
                  {/* <div className="progress-texts">107 Kw</div> */}
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 180 }}>
              <CardContent
                sx={{
                  width: "100%",
                  padding: 1,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {/* Centered Text at the Top */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  Indoor Humidity
                </Typography>

                {/* Gauge Container */}
                <div className="progress-containers">
                  <SemiGauge
                    min={0}
                    max={120}
                    value={110}
                    unit="%"
                    size={220}
                  />

                  {/* <div className="progress-texts">70°</div> */}
                </div>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 180, overflowX: "auto" }}>
              <CardContent sx={{ paddingBottom: "16px !important" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  align="center"
                  sx={{ marginBottom: 1 }}
                >
                  {currentitle}
                </Typography>

                <ResponsiveContainer width="100%" height={130}>
                  <ComposedChart data={currentData} margin={{ bottom: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#5D5D5D" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                    />
                    <Legend />

                    <Bar
                      dataKey="pv"
                      barSize={10}
                      onClick={(data) => handleBarClick(data)}
                    >
                      {currentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.pv > entry.avgConsum ? "#EF4444" : "#8884d8"
                          }
                        />
                      ))}
                    </Bar>

                    <Line
                      type="monotone"
                      dataKey="avgConsum"
                      stroke="#FF7300"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Row 2: Left Small Card + Right Long Card */}
      <Box mt={3}>
        <Grid container spacing={2}>
          {/* Left Side - One Big Card */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: 350, position: "relative" }}>
              <CardContent
                sx={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 0,
                }}
              >
                {/* Left Arrow */}
                <IconButton onClick={handleBackwardClick} sx={{ zIndex: 2 }}>
                  <ArrowBackIosNewIcon fontSize="large" />
                </IconButton>

                {/* Image Display */}
                <Box
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    justifyContent: "center",
                    overflow: "auto",
                    height: "100%",
                  }}
                >
                  <img
                    src={showFloor ? FloorImg : buildingImg}
                    alt={showFloor ? "Floor" : "Building"}
                    style={{
                      objectFit: "contain",
                      height: "100%",
                      width: "100%",
                      transform: `scale(${imageZoom})`,
                      transformOrigin: "center",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </Box>

                {/* Right Arrow */}
                <IconButton onClick={handleForwardClick} sx={{ zIndex: 2 }}>
                  <ArrowForwardIosIcon fontSize="large" />
                </IconButton>

                {/* Zoom Controls */}
                <Box sx={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 0.5, zIndex: 2 }}>
                  <IconButton size="small" onClick={() => setImageZoom((z) => Math.min(z + 0.25, 3))} sx={{ bgcolor: "rgba(255,255,255,0.8)" }}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setImageZoom((z) => Math.max(z - 0.25, 1))} sx={{ bgcolor: "rgba(255,255,255,0.8)" }}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Side - Two Cards in Column */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" gap={2} height="100%">
              <Card sx={{ height: 170, overflowX: "auto" }}>
                <CardContent sx={{ paddingBottom: "16px !important" }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    align="center"
                    sx={{ marginBottom: 1 }}
                  >
                    Energy Consumption
                  </Typography>
                  <ResponsiveContainer width="100%" height={120}>
                    <ComposedChart
                      data={databarcategory}
                      margin={{ bottom: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#5D5D5D" }}
                        labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="pv"
                        barSize={10}
                        onClick={(data) => handleBarClick(data)}
                      >
                        {databarcategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.pv > entry.avgConsum ? "#EF4444" : "#8884d8"
                            }
                          />
                        ))}
                      </Bar>
                      <Line
                        type="monotone"
                        dataKey="avgConsum"
                        stroke="#FF7300"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card sx={{ height: 170, overflowX: "auto" }}>
                <CardContent sx={{ paddingBottom: "16px !important" }}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    align="center"
                    sx={{ marginBottom: 1 }}
                  >
                    Temparature vs Humidity
                  </Typography>
                  <ResponsiveContainer width="100%" height={120}>
                    <ComposedChart
                      data={databardatwise}
                      margin={{ bottom: -20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#5D5D5D" }}
                        labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                      />
                      <Legend />

                      {/* Line for pv */}
                      <Line
                        type="monotone"
                        dataKey="pv"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="uv"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />

                      {/* Line for avgConsum */}
                      <Line
                        type="monotone"
                        dataKey="avgConsum"
                        stroke="#FF7300"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Row 3: 3 small + 1 wide card */}
      <Box mt={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 150 }}>
              <CardContent>
                <Typography variant="h6" align="center" fontWeight={600}>
                  Energy Meter
                </Typography>

                <Box mt={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Active
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      50
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CancelIcon color="error" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Deactive
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      15
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <EqualizerIcon color="primary" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Total
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      65
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 150 }}>
              <CardContent>
                <Typography variant="h6" align="center" fontWeight={600}>
                  Utility Meter
                </Typography>

                <Box mt={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Active
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      25
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CancelIcon color="error" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Deactive
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      10
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <EqualizerIcon color="primary" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Total
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      35
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={2.66}>
            <Card sx={{ height: 150 }}>
              <CardContent>
                <Typography variant="h6" align="center" fontWeight={600}>
                  Water Meter
                </Typography>

                <Box mt={2}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon color="success" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Active
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      45
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <CancelIcon color="error" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Deactive
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      10
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <EqualizerIcon color="primary" fontSize="small" />
                      <Typography
                        variant="body2"
                        fontWeight={400}
                        fontSize={20}
                      >
                        Total
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={400} fontSize={20}>
                      55
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 150, overflowX: "auto" }}>
              <CardContent sx={{ paddingBottom: "16px !important" }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  align="center"
                  sx={{ marginBottom: 1 }}
                >
                  Outside vs Indoor Temparature
                </Typography>
                <ResponsiveContainer width="100%" height={100}>
                  <ComposedChart
                    data={databarpeakhourDemand}
                    margin={{ bottom: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#5D5D5D" }}
                      labelStyle={{ color: "#FFFFFF", fontWeight: "bold" }}
                    />
                    <Legend />

                    {/* Line for pv instead of Bar */}
                    <Line
                      type="monotone"
                      dataKey="pv"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="uv"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />

                    {/* Line for avgConsum */}
                    <Line
                      type="monotone"
                      dataKey="avgConsum"
                      stroke="#FF7300"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <FloorWiseModel
        open={isModalOpenFloor}
        handleClose={() => setIsModalOpenFloor(false)}
        data={modalData}
        selectedFloor={selectedFloor}
      />

      <CatergoryWiseModel
        open={isModalOpenCatergory}
        handleClose={() => setIsModalOpenCatergory(false)}
        data={modalData}
        selectedFloor={selectedFloor}
      />

      <DayWiseModel
        open={isModalOpenDay}
        handleClose={() => setIsModalOpenDay(false)}
        data={modalData}
        selectedFloor={selectedFloor}
      />

      <HourWiseModel
        open={isModalOpenhour}
        handleClose={() => setIsModalOpenHour(false)}
        data={modalData}
        selectedFloor={selectedFloor}
      />
    </Box>
  );
};

export default HVAS_Dashboard;
