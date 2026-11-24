import {
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Tooltip,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import React from "react";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import SettingsIcon from "@mui/icons-material/Settings";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import BuildIcon from "@mui/icons-material/Build";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import { DataGrid } from "@mui/x-data-grid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import "./PreventiveMaintenance.css";
//   import {
//       PreveMaintainancecount,
//     PreventiveMaintanceSchedule,
//     shopFloreSchedule,
//     showdeviceCount,
//   } from "../../../services/LoginServiceNod";
import { useEffect } from "react";
import {
  FetchMachinesStatusService,
  PreveMaintainancecount,
  PreventiveMaintanceSchedule,
  ShowSensorAlert,
  ShowServiceAlert,
  shopFloreSchedule,
  shopFloregraphdata,
  showalert,
  showdeviceCount,
} from "../../Services/NodeJsApiServices";
//   import { DeviceIdAlerts } from "../../../services/LoginPageService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PrevMaintCalendDialog from "./PrevMaintCalendDialog";
import BreakdownTrendDialog from "./BreakdownTrendDialog";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const columns2 = [
  { field: "id", headerName: "Ticket ID", width: 90 },
  {
    field: "fromdate",
    headerName: "Schedule Date",
    headerAlign: "center",
    width: 100,
    align: "center",
    editable: true,
    flex: 1,
  },
  {
    field: "Maintype",
    headerName: "Maintance Type",
    width: 100,
    headerAlign: "center",
    editable: true,
    align: "center",
    flex: 1,
  },
  {
    field: "machineName",
    headerName: "Machine",
    type: "number",
    width: 100,
    headerAlign: "center",
    editable: true,
    align: "center",
    flex: 1,
  },
  {
    field: "ProblemNote",
    headerName: "Maintance Reason",
    type: "number",
    headerAlign: "center",
    width: 100,
    editable: true,
    align: "center",
    flex: 1,
  },
  // {
  //     field: 'fullName',
  //     headerName: 'Full name',
  //     description: 'This column has a value getter and is not sortable.',
  //     sortable: false,
  //     width: 160,
  //     valueGetter: (params) =>
  //         `${params.row.firstName || ''} ${params.row.lastName || ''}`,
  // },
];

const PreventiveMaintenance = () => {
  const navigate = useNavigate();

  const handleViewAction = (row) => {
    console.log("View action clicked for row:", row);

    navigate("/MaintenanceSchedule", {
      state: {
        machineId: row.assetId,
        Rowsection: row.Section,
        RowassetType: row.AssetType,
        Department: row.Department,
      },
    });
  };

  const columns3 = [
    // { field: "id", headerName: "ID", width: 90, headerAlign: "center", align: "center", },
    {
      field: "dateTime",
      headerName: "DateTime",
      width: 120,
      headerAlign: "center",
      editable: true,
      align: "center",
      flex: 1,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        const pad = (n) => n.toString().padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
          date.getDate()
        )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
          date.getSeconds()
        )}`;
      },
    },
    {
      field: "alertMessage",
      headerName: "Alert Type",
      width: 100,
      headerAlign: "center",
      editable: true,
      align: "center",
      flex: 1,
    },
    {
      field: "value",
      headerName: "Actual Value",
      width: 60,
      headerAlign: "center",
      editable: true,
      align: "center",
      flex: 1,
    },
    {
      field: "machine_name",
      headerName: "Machine",
      width: 100,
      headerAlign: "center",
      editable: true,
      align: "center",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      width: 60,
      headerAlign: "center",
      align: "center",
      flex: 1,
      renderCell: (params) => {
        if (params.row.alertMessage === "Breakdown detected") {
          return (
            <IconButton
              onClick={() => handleViewAction(params.row)}
              aria-label="view"
            >
              <VisibilityIcon />
            </IconButton>
          );
        }
        return null;
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const [row, setRow] = useState([]);
  const [rows2, setRow2] = useState([]);
  const [gdata, setgdata] = useState([]);
  const [checked, setChecked] = useState({
    TYPE: false,
    CURRENT: false,
    MAX: false,
    SEVERITY: false,
    TIMESTAMP: false,
  });

  const [openPrevCal, setOpenPrevCal] = useState(false);
  const [scroll, setScroll] = React.useState("body");

 const [openPrevCalBd, setOpenPrevCalBd] = useState(false);
  const [scrollBd, setScrollBd] = React.useState("body");


  const handleClose = () => {
    setOpen(false);
  };

  const [percentage, setPercentage] = useState();
  const [priactual, setpriactual] = useState("");
  const [priplanned, setpriplanned] = useState("");

  const [Condctual, setCondactual] = useState("");
  const [Condplanned, setCondplanned] = useState("");
  const [condpercentage, setcondPercentage] = useState();

  const [Breakactual, setBreakactual] = useState("");
  const [Breakplanned, setBreakplanned] = useState("");
  const [Breakpercentage, setBreakPercentage] = useState();
  const [devicount, setdevicount] = useState("");
  const [alertCount, setalertCount] = useState("");
  const [MaintCount, setMaintCount] = useState("");
  const [breakDownCnt, setBreakDownCnt] = useState(0); // State for breakDownCnt

  const [machineStatus, setMachineStatus] = useState({
    downTime: 0,
    idle: 0,
    downMachineList: [],
    idleMachineList: [],
  });
  const [serviceAlertCount, setServiceAlertCount] = useState(0);
  const [sensorAlertCount, setSensorAlertCount] = useState(0);
  const [month, setMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
    const [monthBd, setMonthBd] = useState("");
  const [toMonthBd, setToMonthBd] = useState("");

  console.log("machineStatusmachineStatus", machineStatus);

  const handleChange = (event) => {
    setChecked({ ...checked, [event.target.name]: event.target.checked });
  };

  useEffect(() => {
    PreventiveMaintanceSchedule(
      PreventiveMainListSuccess,
      PreventiveMainListException
    );

    //   DeviceIdAlerts({}, DeviceIdAlertsListSuccess, DeviceIdAlertsListException);

    shopFloregraphdata(
      shopFloreScheduleListSuccess,
      shopFloreScheduleListException
    );

    PreveMaintainancecount(
      { Maintype: "Preventive Maintenance" },
      PreveMaintainanListSuccess,
      PreveMaintainanListException
    );

    PreveMaintainancecount(
      { Maintype: "Conditions Based Maintenance" },
      PreveMaintainanListSuccess2,
      PreveMaintainanListException2
    );

    PreveMaintainancecount(
      { Maintype: "BreakDown" },
      PreveMaintainanListSuccess3,
      PreveMaintainanListException3
    );

    showdeviceCount(handeldevicecount, handelexceptioncount);
    showalert(handelalert, handelexceptionalert);

    FetchMachinesStatusService(handleSuccess, handleException);
    ShowServiceAlert(handleServiceAlertSuccess, handleServiceAlertException);
    ShowSensorAlert(handleSensorAlertSuccess, handleSensorAlertException);
  }, []);

  //SENSOR ALERT
  const handleSensorAlertSuccess = (dataObject) => {
    setSensorAlertCount(dataObject?.alertCount || 0);
  };
  const handleSensorAlertException = () => {};

  // SERVICE ALERT
  const handleServiceAlertSuccess = (dataObject) => {
    setServiceAlertCount(dataObject?.alertCount || 0);
  };
  const handleServiceAlertException = () => {};

  //HEADER
  const handleSuccess = (dataObject) => {
    setMachineStatus(dataObject.data);
  };
  const handleException = (errorObject) => {
    // Handle errors if needed
  };

  const handelalert = (dataObject) => {
    setRow2(dataObject?.data || []);
    setBreakDownCnt(dataObject?.breakDownCnt || 0); // Set the breakDownCnt value
  };
  const handelexceptionalert = () => {};

  const handeldevicecount = (dataObject) => {
    setdevicount(dataObject.count);
  };
  const handelexceptioncount = () => {};

  const PreveMaintainanListSuccess3 = (dataObject) => {
    setBreakactual(dataObject.count0);
    setBreakplanned(dataObject.count1);
    const per = (dataObject.count0 / dataObject.count1) * 100;
    setBreakPercentage(per.toFixed(2));
  };
  const PreveMaintainanListException3 = () => {};

  const PreveMaintainanListSuccess2 = (dataObject) => {
    setCondactual(dataObject.count0);
    setCondplanned(dataObject.count1);
    const per = (dataObject.count0 / dataObject.count1) * 100;
    const perRound = per.toFixed(2);
    setcondPercentage(perRound);
  };

  const PreveMaintainanListException2 = () => {};

  const PreventiveMainListSuccess = (dataObject) => {
    const data = dataObject.data || [];
    const count = data.length; // Count the data
    console.log("length==", count); // L
    setMaintCount(count);
    setRow(dataObject?.data);
  };
  const PreventiveMainListException = () => {};

  const DeviceIdAlertsListSuccess = (dataObject) => {
    const data = dataObject.data || [];
    const count = data.length; // Count the data
    console.log("length==", count); // L
    setalertCount(count);
    setRow2(dataObject?.data || []);
  };

  const DeviceIdAlertsListException = () => {};

  const shopFloreScheduleListSuccess = (dataObject) => {
    setgdata(dataObject?.data || []);
    // console.log("setRow2===",dataObject?.data)
  };
  const shopFloreScheduleListException = () => {};

  const PreveMaintainanListSuccess = (dataObject) => {
    setpriactual(dataObject.count0);
    setpriplanned(dataObject.count1);
    console.log("dataObject.count0==", dataObject.count0);
    console.log("dataObject.count1==", dataObject.count1);
    const per = dataObject.count0 / dataObject.count1;

    const roundedPer = Math.round(per * 100);
    setPercentage(roundedPer.toFixed(2));
  };

  const PreveMaintainanListException = () => {};

  const handleClickOpen = (scrollType) => () => {
    setScroll(scrollType);
    setOpenPrevCal(true);
  };

 const handleClickOpenBd = (scrollType) => () => {
    setScrollBd(scrollType);
    setOpenPrevCalBd(true);
  };


  

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <Box sx={{ width: "100%", padding: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                justifyContent={"space-between"}
                container
                style={{ alignItems: "center" }}
              >
                <Grid item>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    RUNNING
                  </Typography>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    {machineStatus.running}
                  </Typography>
                </Grid>
                <Grid item>
                  <SettingsIcon sx={{ fontSize: 40, color: "#00ff00" }} />
                </Grid>
              </Grid>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                justifyContent={"space-between"}
                container
                style={{ alignItems: "center" }}
              >
                <Grid item>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    DOWN
                  </Typography>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    {machineStatus.downTime}
                  </Typography>
                </Grid>
                <Grid item>
                  <ReportProblemIcon sx={{ fontSize: 40, color: "#f10909" }} />
                </Grid>
              </Grid>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                justifyContent={"space-between"}
                container
                style={{ alignItems: "center" }}
              >
                <Grid item>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    SERVICE ALERT
                  </Typography>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    {serviceAlertCount}
                  </Typography>
                </Grid>
                <Grid item>
                  <BuildIcon sx={{ fontSize: 40, color: "#ffa500" }} />
                </Grid>
              </Grid>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                justifyContent={"space-between"}
                container
                style={{ alignItems: "center" }}
              >
                <Grid item>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    SENSOR ALERT
                  </Typography>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    {sensorAlertCount}
                  </Typography>
                </Grid>
                <Grid item>
                  <NotificationsIcon sx={{ fontSize: 40, color: "#F3C623" }} />
                </Grid>
              </Grid>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid
                justifyContent={"space-between"}
                container
                style={{ alignItems: "center" }}
              >
                <Grid item>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    DISCONNECTED
                  </Typography>
                  <Typography style={{ color: "#000000", fontWeight: "bold" }}>
                    0
                  </Typography>
                </Grid>
                <Grid item>
                  <SettingsInputComponentIcon
                    sx={{ fontSize: 40, color: "#f10909" }}
                  />
                </Grid>
              </Grid>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={2} md={6}>
            <Item
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* <img src={companyDetails ? `${process.env.REACT_APP_API_URL}${companyDetails.customerLogo}` : noImage} alt="Image Description" style={{ maxWidth: '100%', maxHeight: '100%' }} /> */}
              <Typography
                color="text.secondary"
                fontSize={16}
                fontWeight="bold"
              >
                {/* {companyDetails ? companyDetails.companyName : "Company Name"} */}
              </Typography>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={6} md={6}>
            <Item>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    m: 0,
                    color: "#000000",
                    fontWeight: "bold",
                    marginRight: "14px",
                  }}
                >
                  Emergency / Service Alert
                </Typography>
                {breakDownCnt > 0 && ( // Conditionally render the icon
                  <Tooltip title="Breakdown" arrow>
                    <ReportProblemIcon
                      style={{
                        marginLeft: "14px",
                        color: "red",
                        cursor: "pointer",
                      }}
                    />
                  </Tooltip>
                )}{" "}
              </div>

              <Box sx={{ height: '40vh', width: "100%" }}>
                <DataGrid
                  rows={rows2}
                  columns={columns3}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  // checkboxSelection
                  disableRowSelectionOnClick
                  // sx={{
                  //     '& .MuiDataGrid-columnHeaders': {
                  //         color: '#000000', // Header text color
                  //         fontWeight: 'bold', // Header font weight
                  //     },
                  //     '& .MuiDataGrid-columnHeaderTitle': {
                  //         fontWeight: 'bold', // Ensures the header font weight is bold
                  //     },
                  // }}

                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      fontSize: "14px",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Box>
            </Item>
          </Grid>
          <Grid item xs={12} sm={12} lg={6} md={6}>
            <Item>
              <Typography sx={{ m: 0, color: "#000000", fontWeight: "bold" }}>
                Shop Floor Health
              </Typography>
              <ResponsiveContainer width="100%" height={335}>
                <BarChart width={730} height={250} data={gdata}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {gdata.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Item>
          </Grid>

          <Grid item xs={12} sm={12} lg={6} md={6}>
            <Item>
              <Typography sx={{ m: 0, color: "#000000", fontWeight: "bold" }}>
                Maintenance Schedule
              </Typography>
              <Box sx={{ height: '300px', width: "100%" }}>
                <DataGrid
                  rows={row}
                  columns={columns2}
                  initialState={{
                    pagination: {
                      paginationModel: {
                        pageSize: 5,
                      },
                    },
                  }}
                  pageSizeOptions={[5]}
                  checkboxSelection
                  disableRowSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      color: "#000000", // Header text color
                      fontWeight: "bold", // Header font weight
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: "bold", // Ensures the header font weight is bold
                    },
                  }}
                />
              </Box>
            </Item>
          </Grid>

          <Grid item xs={12} sm={12} lg={6} md={6}>
            <Item style={{ height: "100px" }}>
              <Grid
                container
                style={{ height: "100%" }}
                justifyContent={"space-between"}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    m: 0,
                    color: "#000000",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden", // Hides any overflow
                    textOverflow: "ellipsis", // Adds "..." if the text overflows
                    display: "block", // Ensures it's treated as a block element
                  }}
                >
                  Preventive Maintenance
                </Typography>
                <TextField
                  fullWidth
                  label="From Month "
                  placeholder="From Month"
                  variant="outlined"
                  required
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    width: 160, // custom width
                    "& .MuiOutlinedInput-root": {
                      height: 25, // custom height for the entire input box
                    },
                    ml: 5,
                  }}
                />

                <TextField
                  fullWidth
                  label="To Month "
                  placeholder="To Month"
                  variant="outlined"
                  required
                  type="month"
                  value={toMonth}
                  onChange={(e) => setToMonth(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    width: 160, // custom width
                    "& .MuiOutlinedInput-root": {
                      height: 25, // custom height for the entire input box
                    },
                    ml: 5,
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={month === "" || toMonth === ""}
                  onClick={handleClickOpen("body")}
                >
                  View
                </Button>
                <Grid
                  item
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Grid
                    container
                    style={{ width: "100%", alignItems: "center" }}
                  >
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "100%",
                      }}
                    >
                      <Typography
                        style={{
                          color: "#000000",
                          width: "61px",
                          textAlign: "start",
                        }}
                      >
                        Actual:
                      </Typography>
                      <Typography>{priactual}</Typography>
                    </Grid>
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "100%",
                      }}
                    >
                      <Typography
                        style={{
                          color: "#000000",
                          width: "61px",
                          textAlign: "start",
                        }}
                      >
                        Planned:
                      </Typography>
                      <Typography>{priplanned}</Typography>
                    </Grid>
                  </Grid>

                  <Grid container style={{ width: "100%" }}>
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <div className="progress-bar-containers">
                        <div
                          className="progress-bars"
                          style={{ width: `${percentage}%` }}
                        >
                          {`${percentage}%`}
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Item>
            <Item style={{ marginTop: "20px", height: "100px" }}>
              <Grid
                container
                style={{ height: "100%" }}
                justifyContent={"space-between"}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    m: 0,
                    color: "#000000",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    overflow: "hidden", // Hides any overflow
                    textOverflow: "ellipsis", // Adds "..." if the text overflows
                    display: "block", // Ensures it's treated as a block element
                  }}
                >
                  Condition Based Maintenance
                </Typography>
                <Grid
                  item
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Grid
                    container
                    style={{ width: "100%", alignItems: "center" }}
                  >
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "100%",
                      }}
                    >
                      <Typography
                        style={{
                          color: "#000000",
                          width: "61px",
                          textAlign: "start",
                          color: "#000000",
                        }}
                      >
                        Actual:
                      </Typography>
                      <Typography>{Condctual}</Typography>
                    </Grid>
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "100%",
                      }}
                    >
                      <Typography
                        style={{
                          color: "#000000",
                          width: "61px",
                          textAlign: "start",
                        }}
                      >
                        Planned:
                      </Typography>
                      <Typography>{Condplanned}</Typography>
                    </Grid>
                  </Grid>
                  <Grid container style={{ width: "100%" }}>
                    <Grid
                      item
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    >
                      <div className="progress-bar-containers">
                        <div
                          className="progress-bars"
                          style={{ width: `${condpercentage}%` }}
                        >
                          {`${condpercentage}%`}
                        </div>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Item>
                  <Item style={{ marginTop: "20px", height: "100px" }}>
                    <Grid
                      container
                      style={{ height: "100%" }}
                      justifyContent={"space-between"}
                    >
                    
                          <Typography
                            variant="h5"
                            gutterBottom
                            sx={{
                              m: 0,
                              color: "#000000",
                              fontWeight: "bold",
                              whiteSpace: "nowrap",
                              overflow: "hidden", // Hides any overflow
                              textOverflow: "ellipsis", // Adds "..." if the text overflows
                              display: "block", // Ensures it's treated as a block element
                              mr: 18,
                            }}
                          >
                            Breakdown
                          </Typography>
                        
                              <TextField
                            
                        fullWidth
                        label="From Month "
                        placeholder="From Month"
                        variant="outlined"
                        required
                        type="month"
                        value={monthBd}
                        onChange={(e) => setMonthBd(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          width: 160, // custom width
                          "& .MuiOutlinedInput-root": {
                            height: 25, // custom height for the entire input box
                          },
                          ml: 5,
                        }}
                      />

                      <TextField
                        fullWidth
                        label="To Month "
                        placeholder="To Month"
                        variant="outlined"
                        required
                        type="month"
                        value={toMonthBd}
                        onChange={(e) => setToMonthBd(e.target.value)}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        sx={{
                          width: 160, // custom width
                          "& .MuiOutlinedInput-root": {
                            height: 25, // custom height for the entire input box
                          },
                          ml: 5,
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={monthBd === "" || toMonthBd  === ""}
                        onClick={handleClickOpenBd("body")}
                      >
                        View
                      </Button>
                      <Grid
                        item
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Grid
                          container
                          style={{ width: "100%", alignItems: "center" }}
                        >

                          <Grid
                            item
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-evenly",
                              width: "100%",
                            }}
                          >
                            <Typography
                              style={{
                                color: "#000000",
                                width: "61px",
                                textAlign: "start",
                              }}
                            >
                              Actual:
                            </Typography>
                            <Typography>{Breakactual}</Typography>
                          </Grid>
                          <Grid
                            item
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-evenly",
                              width: "100%",
                            }}
                          >
                            <Typography
                              style={{
                                color: "#000000",
                                width: "61px",
                                textAlign: "start",
                              }}
                            >
                              Planned:
                            </Typography>
                            <Typography>{Breakplanned}</Typography>
                          </Grid>
                        </Grid>
                        <Grid container style={{ width: "100%" }}>
                          <Grid
                            item
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              width: "100%",
                            }}
                          >
                            <div className="progress-bar-containers">
                              <div
                                className="progress-bars"
                                style={{ width: `${Breakpercentage}%` }}
                              >
                                {`${Breakpercentage}%`}
                              </div>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Item>
          </Grid>
        </Grid>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Columns to display"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked.TYPE}
                      onChange={handleChange}
                      name="TYPE"
                      color="primary"
                    />
                  }
                  label="TYPE"
                />
              </FormControl>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </Box>
      <PrevMaintCalendDialog
        open={openPrevCal}
        setOpen={setOpenPrevCal}
        scroll={scroll}
        month={month}
        toMonth={toMonth}
      />
      <BreakdownTrendDialog  
        open={openPrevCalBd}
        setOpen={setOpenPrevCalBd}
        scroll={scrollBd}
        month={monthBd}
        toMonth={toMonthBd}
      /> 
    </div>
  );
};

export default PreventiveMaintenance;
