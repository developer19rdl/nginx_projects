import React, { useState, useEffect } from "react";
import './Alerts.css';
import { FormControl, Button, Grid, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { GetAlertDeviceDropdown, GetAlertSlaveDropdown, GetAlertTagDropdown, GetAlertReport } from "../../../../Services/NodeJsApiServices";
import { DataGrid } from '@mui/x-data-grid';
import LinearProgress from '@mui/material/LinearProgress';

const ALL_OPTION = { id: -1, displayName: "All" };

const Alerts = () => {
    const [fromDateTime, setFromDateTime] = useState("");
    const [toDateTime, setToDateTime] = useState("");

    // Cascade: Device -> Slave ID -> Tag Name
    const [deviceList, setDeviceList] = useState([ALL_OPTION]);
    const [slaveList, setSlaveList] = useState([ALL_OPTION]);
    const [tagList, setTagList] = useState([ALL_OPTION]);

    const [device, setDevice] = useState(-1);
    const [slave, setSlave] = useState(-1);
    const [tag, setTag] = useState(-1);

    const [alertReport, setAlertReport] = useState([])
    const [loader, setLoader] = useState(false);

    // On mount: load devices, and the full (unscoped) tag list
    useEffect(() => {
        GetAlertDeviceDropdown(
            (dataObject) => setDeviceList([ALL_OPTION, ...(dataObject?.data || [])]),
            () => { }
        );
        GetAlertTagDropdown(
            {},
            (dataObject) => setTagList([ALL_OPTION, ...(dataObject?.data || [])]),
            () => { }
        );
    }, [])

    // Slave ID list cascades on the selected device; Tag Name resets with it
    const handleDeviceChange = (deviceId) => {
        setDevice(deviceId);
        setSlave(-1);
        setTag(-1);

        if (deviceId === -1) {
            setSlaveList([ALL_OPTION]);
            GetAlertTagDropdown({}, (dataObject) => setTagList([ALL_OPTION, ...(dataObject?.data || [])]), () => { });
            return;
        }

        GetAlertSlaveDropdown(
            { deviceId },
            (dataObject) => setSlaveList([ALL_OPTION, ...((dataObject?.data || []).map(r => ({
                id: r.slaveId,
                displayName: r.slaveInformation ? `${r.slaveId} - ${r.slaveInformation}` : r.slaveId,
            })))]),
            () => { }
        );
        GetAlertTagDropdown(
            { deviceId, slaveId: 'all' },
            (dataObject) => setTagList([ALL_OPTION, ...(dataObject?.data || [])]),
            () => { }
        );
    };

    // Tag Name list cascades on the selected slave ID
    const handleSlaveChange = (slaveId) => {
        setSlave(slaveId);
        setTag(-1);
        GetAlertTagDropdown(
            { deviceId: device === -1 ? 'all' : device, slaveId: slaveId === -1 ? 'all' : slaveId },
            (dataObject) => setTagList([ALL_OPTION, ...(dataObject?.data || [])]),
            () => { }
        );
    };

    /////Min And Max date  Calculate function///////////
    const calculateOneMonthFrom = (date) => {
        if (!date) return "";
        const oneMonthFromSelectedDate = new Date(date);
        oneMonthFromSelectedDate.setMonth(oneMonthFromSelectedDate.getMonth() + 1);
        return oneMonthFromSelectedDate.toISOString().slice(0, 16);
    };

    const handleSubmit = () => {
        setLoader(true)
        GetAlertReport({
            fromDate: fromDateTime,
            toDate: toDateTime,
            deviceId: device === -1 ? 'all' : device,
            slaveId: slave === -1 ? 'all' : slave,
            meterId: tag === -1 ? 'all' : tag
        }, handleReportSuccess, handleReportException)
    }

    const handleReportSuccess = (dataObject) => {
        setLoader(false)
        setAlertReport(dataObject?.data || []);
    }
    const handleReportException = () => {
        setLoader(false)
    }

    const columns = [
        {
            field: 'meterType',
            headerClassName: 'super-app-theme--header',
            headerName: 'Source',
            sortable: true,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'meter_name',
            headerClassName: 'super-app-theme--header',
            headerName: 'Tag Name',
            sortable: true,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'slaveId',
            headerClassName: 'super-app-theme--header',
            headerName: 'Slave ID',
            sortable: true,
            flex: 0.7,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'severity',
            headerClassName: 'super-app-theme--header',
            headerName: 'Severity',
            sortable: true,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'alertMessage',
            headerClassName: 'super-app-theme--header',
            headerName: 'Alert Message',
            sortable: true,
            flex: 1.5,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'date',
            headerClassName: 'super-app-theme--header',
            headerName: 'Date',
            sortable: true,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'time',
            headerClassName: 'super-app-theme--header',
            headerName: 'Time',
            sortable: true,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'value',
            headerClassName: 'super-app-theme--header',
            headerName: 'Alert Triggered Value',
            sortable: true,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
    ];

    return (
        <>
            <div className="alerts_bottomContainer">
                <div className="alerts_headerContainer">
                    <span>ALERT REPORT</span>
                </div>

                <Grid
                    container
                    spacing={2}
                    paddingLeft={"50px"}
                    paddingRight={"30px"}
                    paddingTop={"30px"}
                    paddingBottom={"30px"}
                    alignItems="center"
                >
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <TextField
                            fullWidth
                            size="small"
                            id="outlined-basic"
                            label="From Date Time"
                            type="datetime-local"
                            variant="outlined"
                            value={fromDateTime}
                            required
                            onChange={(e) => {
                                setFromDateTime(e.target.value);
                            }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                max: calculateOneMonthFrom(toDateTime),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <TextField
                            fullWidth
                            size="small"
                            id="outlined-basic"
                            label="To Date Time"
                            type="datetime-local"
                            variant="outlined"
                            value={toDateTime}
                            onChange={(e) => {
                                setToDateTime(e.target.value);
                            }}
                            required
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                min: fromDateTime,
                                max: calculateOneMonthFrom(fromDateTime),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <FormControl fullWidth>
                            <InputLabel id="alert-device-select-label">Device</InputLabel>
                            <Select
                                size="small"
                                labelId="alert-device-select-label"
                                id="alert-device-select"
                                label="Device"
                                value={device}
                                onChange={(e) => handleDeviceChange(e.target.value)}
                            >
                                {deviceList.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>{data.displayName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <FormControl fullWidth>
                            <InputLabel id="alert-slave-select-label">Slave ID</InputLabel>
                            <Select
                                size="small"
                                labelId="alert-slave-select-label"
                                id="alert-slave-select"
                                label="Slave ID"
                                value={slave}
                                disabled={device === -1}
                                onChange={(e) => handleSlaveChange(e.target.value)}
                            >
                                {slaveList.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>{data.displayName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <FormControl fullWidth>
                            <InputLabel id="alert-tag-select-label">Tag Name</InputLabel>
                            <Select
                                size="small"
                                labelId="alert-tag-select-label"
                                id="alert-tag-select"
                                label="Tag Name"
                                value={tag}
                                onChange={(e) => {
                                    setTag(e.target.value);
                                }}
                            >
                                {tagList.map((data) => (
                                    <MenuItem key={data.id} value={data.id}>{data.displayName}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2} lg={2}>
                        <Button variant="contained" size="small" onClick={handleSubmit}>Search</Button>
                    </Grid>
                </Grid>
            </div>

            <div className="energy_table_bottomContainer">
                {loader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <div className="energy_headerContainer">
                    <span> Alert Report [ RG35 ]</span>
                </div>
                {}
                <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={alertReport}
                        columns={columns}
                        sx={{
                            '& .super-app-theme--header': {
                                WebkitTextStrokeWidth: '0.6px',

                            },
                            // '& .MuiDataGrid-cell': {
                            //     border: '1px solid #969696',
                            // },
                            // '& .MuiDataGrid-columnHeader': {
                            //     border: '1px solid #969696', // Add border to column headers
                            // },
                        }}
                    />
                </Box>
            </div>
        </>
    )
}
export default Alerts;
