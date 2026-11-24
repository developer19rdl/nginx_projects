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
import { PreveMaintainancecount, PreventiveMaintanceSchedule, shopFloreSchedule, shopFloregraphdata, showalert, showdeviceCount } from "../../Services/NodeJsApiServices";
//   import { DeviceIdAlerts } from "../../../services/LoginPageService";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const columns3 = [
    { field: "id", headerName: "ID", width: 90 },
    {
        field: "dateTime",
        headerName: "DateTime",
        width: 100,
        headerAlign: "center",
        editable: true,
        align: "center",
        flex: 1,
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
        width: 100,
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
];

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
];

const data = [
    {
        name: "Page A",
        uv: 4000,
        pv: 2400,
    },
    {
        name: "Page B",
        uv: 3000,
        pv: 1398,
    },
    {
        name: "Page C",
        uv: 2000,
        pv: 9800,
    },
    {
        name: "Page D",
        uv: 2780,
        pv: 3908,
    },
    {
        name: "Page E",
        uv: 1890,
        pv: 4800,
    },
    {
        name: "Page F",
        uv: 2390,
        pv: 3800,
    },
    {
        name: "Page G",
        uv: 3490,
        pv: 4300,
    },
];

const PreventiveMaintenance = () => {
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

    const handleClose = () => {
        setOpen(false);
    };

    const [percentage, setPercentage] = useState();
    const [priactual, setpriactual] = useState('');
    const [priplanned, setpriplanned] = useState('');

    const [Condctual, setCondactual] = useState('');
    const [Condplanned, setCondplanned] = useState('');
    const [condpercentage, setcondPercentage] = useState();

    const [Breakactual, setBreakactual] = useState('');
    const [Breakplanned, setBreakplanned] = useState('');
    const [Breakpercentage, setBreakPercentage] = useState();
    const [devicount, setdevicount] = useState('');
    const [alertCount, setalertCount] = useState('');
    const [MaintCount, setMaintCount] = useState('');





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

        PreveMaintainancecount({ Maintype: "Preventive Maintenance" },
            PreveMaintainanListSuccess,
            PreveMaintainanListException
        );

        PreveMaintainancecount({ Maintype: "Conditions Based Maintenance" },
            PreveMaintainanListSuccess2,
            PreveMaintainanListException2
        );


        PreveMaintainancecount({ Maintype: "BreakDown" },
            PreveMaintainanListSuccess3,
            PreveMaintainanListException3
        );


        showdeviceCount(handeldevicecount, handelexceptioncount)
        showalert(handelalert, handelexceptionalert)


    }, []);


    const handelalert = (dataObject) => {
        setRow2(dataObject?.data || []);

    };
    const handelexceptionalert = () => { };



    const handeldevicecount = (dataObject) => {
        setdevicount(dataObject.count)

    };
    const handelexceptioncount = () => { };


    const PreveMaintainanListSuccess3 = (dataObject) => {

        setBreakactual(dataObject.count0)
        setBreakplanned(dataObject.count1)
        const per = (dataObject.count1 * 100 / dataObject.count0)
        setBreakPercentage(per)


    };
    const PreveMaintainanListException3 = () => { };

    const PreveMaintainanListSuccess2 = (dataObject) => {

        setCondactual(dataObject.count0)
        setCondplanned(dataObject.count1)
        const per = (dataObject.count1 * 100 / dataObject.count0)
        setcondPercentage(per)


    };
    const PreveMaintainanListException2 = () => { };



    const PreventiveMainListSuccess = (dataObject) => {
        const data = dataObject.data || [];
        const count = data.length; // Count the data
        console.log("length==", count); // L
        setMaintCount(count)
        setRow(dataObject?.data);
    };
    const PreventiveMainListException = () => { };

    const DeviceIdAlertsListSuccess = (dataObject) => {
        const data = dataObject.data || [];
        const count = data.length; // Count the data
        console.log("length==", count); // L
        setalertCount(count)
        setRow2(dataObject?.data || []);
    };

    const DeviceIdAlertsListException = () => { };

    const shopFloreScheduleListSuccess = (dataObject) => {
        setgdata(dataObject?.data || []);
        // console.log("setRow2===",dataObject?.data)
    };
    const shopFloreScheduleListException = () => { };


    const PreveMaintainanListSuccess = (dataObject) => {

        setpriactual(dataObject.count0)
        setpriplanned(dataObject.count1)
        console.log("dataObject.count0==", dataObject.count0)
        console.log("dataObject.count1==", dataObject.count1)
        const per = (dataObject.count1 * 100 / dataObject.count0);

        const roundedPer = Math.round(per * 100) / 100;
        setPercentage(roundedPer)


    };
    const PreveMaintainanListException = () => { };



    return (
        <div style={{ height: "89vh", overflow: "auto" }}>
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
                                    <Typography style={{ fontWeight: "bold" }}>
                                        RUNNING
                                    </Typography>
                                    <Typography style={{ fontWeight: "bold" }}>{devicount}</Typography>
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
                                    <Typography style={{ fontWeight: "bold" }}>DOWN</Typography>
                                    <Typography style={{ fontWeight: "bold" }}>0</Typography>
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
                                    <Typography style={{ fontWeight: "bold" }}>
                                        SERVICE ALERT
                                    </Typography>
                                    <Typography style={{ fontWeight: "bold" }}>{alertCount + MaintCount}</Typography>
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
                                    <Typography style={{ fontWeight: "bold" }}>
                                        EMERGENCY
                                    </Typography>
                                    <Typography style={{ fontWeight: "bold" }}>0</Typography>
                                </Grid>
                                <Grid item>
                                    <NotificationsIcon sx={{ fontSize: 40, color: "#ffff00" }} />
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
                                    <Typography style={{ fontWeight: "bold" }}>
                                        DISCONNECTED
                                    </Typography>
                                    <Typography style={{ fontWeight: "bold" }}>00</Typography>
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
                            <Typography>Emergency / Service Alert</Typography>
                            <Box sx={{ height: 300, width: "100%" }}>
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
                                    checkboxSelection
                                    disableRowSelectionOnClick
                                />
                            </Box>
                        </Item>
                        <Item style={{ marginTop: "20px" }}>
                            <Typography>Maintenance Schedule</Typography>
                            <Box sx={{ height: 420, width: "100%" }}>
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
                                />
                            </Box>
                        </Item>
                    </Grid>
                    <Grid item xs={12} sm={12} lg={6} md={6}>
                        <Item>
                            <Typography>Shop Floor Health</Typography>
                            <ResponsiveContainer width="100%" height={300}>
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

                        <Item style={{ marginTop: "20px", height: "139px" }}>
                            <Grid
                                container
                                style={{ height: "100%" }}
                                justifyContent={"space-between"}
                            >
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
                                        <Typography variant="h5" gutterBottom>
                                            Preventive Maintainance
                                        </Typography>

                                        <Grid
                                            item
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-evenly",
                                                width: "100%",
                                            }}
                                        >
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
                        <Item style={{ marginTop: "20px", height: "139px" }}>
                            <Grid
                                container
                                style={{ height: "100%" }}
                                justifyContent={"space-between"}
                            >
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
                                        <Typography variant="h5" gutterBottom>
                                            Conditions Based Maintainance
                                        </Typography>

                                        <Grid
                                            item
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-evenly",
                                                width: "100%",
                                            }}
                                        >
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
                        <Item style={{ marginTop: "20px", height: "139px" }}>
                            <Grid
                                container
                                style={{ height: "100%" }}
                                justifyContent={"space-between"}
                            >
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
                                        <Typography variant="h5" gutterBottom>
                                            Breakdown
                                        </Typography>

                                        <Grid
                                            item
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                justifyContent: "space-evenly",
                                                width: "100%",
                                            }}
                                        >
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
                                            <Typography style={{ width: "61px", textAlign: "start" }}>
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
        </div>
    );
};

export default PreventiveMaintenance;
