import React, { useState, useEffect } from 'react'
import './HealthDashboardInsideCard.css'
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SearchIcon from '@mui/icons-material/Search';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { Backdrop, CircularProgress, FormControl, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, TextField, Typography } from '@mui/material';
import { Brush, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
// import logo from '../../../../Assets/Images/logo (2).png'
import machh4 from '../../../Assets/Images/machh4.png';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { GetSensorDropdown, GetMachineHeaderData, GetChartData, GetChartTwoData, GetChartThreeData, GetSelectDropdown, GetAlertData, ClearAlertData, GetSelectDropdown1, GetSelectDropdown2, GetSelectDropdown3 } from '../../../Services/NodeJsApiServices';
import SettingsIcon from '@mui/icons-material/Settings';
import { HeaderSettingModal } from './HeaderSettingModal';
import { GraphSettingModal } from './GraphSettingModal';
import { useLocation } from 'react-router-dom';
import { IntervalModal } from './IntervalModal';
import { IntervalModalTwo } from './IntervalModalTwo';
import { IntervalModalThree } from './IntervalModalThree';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { WarningAmber } from '@mui/icons-material';
import NotificationBar from '../../Notification/NotificationBar';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

const HealthDashboardInsideCard = () => {
    const location = useLocation();
    const [sensorLists1, setSensorLists1] = useState([])
    const [selectList1, setSelectList1] = useState([]);
    const [sensorLists2, setSensorLists2] = useState([])
    const [selectList2, setSelectList2] = useState([]);
    const [sensorLists3, setSensorLists3] = useState([])
    const [selectList3, setSelectList3] = useState([]);
    const [age, setAge] = useState('');
    const [searchClick, setSearchClick] = useState(false)
    const [headerSettingOpen, setHeaderSettingOpen] = React.useState(false);
    const [graphSettingOpen, setGraphSettingOpen] = React.useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [checked, setChecked] = useState({
        CreatedTime: false,
        Originator: false,
        Type: false,
        Severity: false,
        Details: false,
    });
    const [filterChecked, setFilterChecked] = useState({
        Any: false,
        Active: false,
        Cleared: false,
        Acknowledged: false,
        UnAcknowledged: false,
    });
    const names = [
        'Temp',
        'Alert',
        'Vibration'
    ];
    const [selectedEnergyCheckBox, setSelectedEnergyCheckBox] = React.useState([]);
    const [selectedVibrationCheckBox, setSelectedVibrationCheckBox] = React.useState([]);
    const [selectedTemperatureCheckBox, setSelectedTemperatureCheckBox] = React.useState([]);
    const [defaultCheckbox, setDefaultCheckBox] = useState([]);
    const [open, setOpen] = React.useState(false);
    const [selectedGraph, setSelectedGraph] = useState('');
    const [selectedGropdown, setSelectedDropdown] = useState('default')
    const [headerData, setHeaderData] = useState();
    const [intervalModal, setIntervalModal] = useState(false);
    const [intervalModalTwo, setIntervalModalTwo] = useState(false);
    const [intervalModalThree, setIntervalModalThree] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [headerRefreshData, setHeaderRefreshData] = useState(false);
    const [graphDisplayNames, setGraphDisplayNames] = useState('')
    const [chartSlaveIds, setChartSlaveIds] = useState('');

    //FIRST GRAPH FILTER STATE AND DATA
    const [chartData, setChartData] = useState([]);
    const [selectedLast, setSelectedLast] = useState('15days');
    const [selectedAggregation, setSelectedAggregation] = useState('min');
    const [selectedInterval, setSelectedInterval] = useState('1hr');
    const [chartOneTagId, setChartOneTagId] = useState([])
    const [chartTwoTagId, setChartTwoTagId] = useState([])
    const [chartThreeTagId, setChartThreeTagId] = useState([])

    //SECOND GRAPH FILTER STATE AND DATA
    const [chartTwoData, setChartTwoData] = useState([]);
    const [secondSelectedLast, setSecondSelectedLast] = useState('15days');
    const [secondSelectedAggregation, setSecondSelectedAggregation] = useState('min');
    const [secondSelectedInterval, setSecondSelectedInterval] = useState('1hr');

    //THIRD GRAPH FINTER AND DATA
    const [chartThreeData, setChartThreeData] = useState([]);
    const [thirdSelectedLast, setThirdSelectedLast] = useState('15days');
    const [thirdSelectedAggregation, setThirdSelectedAggregation] = useState('min');
    const [thirdSelectedInterval, setThirdSelectedInterval] = useState('1hr');

    //ALERT DATA
    const [alertSelectedDay, setAlertSelectedDay] = useState('30days')
    const [alertData, setAlertData] = useState([]);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [deleteRemark, setDeleteRemark] = useState('');
    const [deleteValidation, setDeleteValidation] = useState("")
    const [backDropLoader, setBackDropLoader] = useState(false)
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    const machineName = new URLSearchParams(location.search).get('machineName');
    const machineId = new URLSearchParams(location.search).get('machineId');
    const machineImage = new URLSearchParams(location.search).get('machineImage');

    useEffect(() => {
        GetSelectDropdown1({ machineId: machineId, field: chartSlaveIds?.chart1SlaveId }, handleGetSensorSuccess1, handleGetSensorException1)
        GetSelectDropdown2({ machineId: machineId, field: chartSlaveIds?.chart2SlaveId }, handleGetSensorSuccess2, handleGetSensorException2)
        GetSelectDropdown3({ machineId: machineId, field: chartSlaveIds?.chart3SlaveId }, handleGetSensorSuccess3, handleGetSensorException3)
        GetAlertData({ machineId: machineId, dateRange: alertSelectedDay }, handleGetAlertSuccess, handleGetAlertException)


    }, [refreshData,chartSlaveIds])

    useEffect(() => {
        setBackDropLoader(true)
        GetMachineHeaderData({ machineId: machineId }, handleHeaderSuccess, handleHeaderException)
    }, [headerRefreshData])

    //ALERT DATA SUCCESS
    const handleGetAlertSuccess = (dataObject) => {
        setBackDropLoader(false)
        setAlertData(dataObject.data || [])
    }
    const handleGetAlertException = () => { }

    // CHART ONE
    const handleGetChartDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartData(dataObject || [])
    }
    const handleGetChartDataException = () => { }

    // CHART TWO
    const handleGetChartTwoDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartTwoData(dataObject || [])
    }
    const handleGetChartTwoDataException = () => { }

    // CHART THREE
    const handleGetChartThreeDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartThreeData(dataObject || [])
    }
    const handleGetChartThreeDataException = () => { }

    // \\\\\\\\\\\\\\\\\\\\\\\\\\\\\

    // CHART ONE
    const handleGetSensorSuccess1 = (dataObject) => {
        const tagNames = dataObject.data.map((item) => item.Tag_name);
        setSensorLists1(tagNames);
        setSelectList1(dataObject?.data)
    }
    const handleGetSensorException1 = () => { }
    // CHART TWO
    const handleGetSensorSuccess2 = (dataObject) => {
        const tagNames = dataObject.data.map((item) => item.Tag_name);
        setSensorLists2(tagNames);
        setSelectList2(dataObject?.data)
    }
    const handleGetSensorException2 = () => { }
    // CHART THREE
    const handleGetSensorSuccess3 = (dataObject) => {
        const tagNames = dataObject.data.map((item) => item.Tag_name);
        setSensorLists3(tagNames);
        setSelectList3(dataObject?.data)
    }
    const handleGetSensorException3 = () => { }

    const handleHeaderSuccess = (dataObject) => {
        setHeaderData(dataObject?.data[0] || [])
        setGraphDisplayNames(dataObject?.displayNames)
        setChartSlaveIds(dataObject?.slaveIds)

        // CHART ONE
        GetChartData({
            machineId: machineId,
            selected: selectedGropdown,
            aggregation: "min",
            interval: "1hr",
            sortDataType: "15days",
            tagIds: [],
            chartNo: 1,
            slaveId: dataObject?.slaveIds?.chart1SlaveId
        }, handleGetChartDataSuccess, handleGetChartDataException)

        // CHART TWO
        GetChartTwoData({
            machineId: machineId,
            selected: selectedGropdown,
            aggregation: "min",
            interval: "1hr",
            sortDataType: "15days",
            tagIds: [],
            chartNo: 2,
            slaveId: dataObject?.slaveIds?.chart2SlaveId
        }, handleGetChartTwoDataSuccess, handleGetChartTwoDataException)

        // CHART TWO
        GetChartThreeData({
            machineId: machineId,
            selected: selectedGropdown,
            aggregation: "min",
            interval: "1hr",
            sortDataType: "15days",
            tagIds: [],
            chartNo: 3,
            slaveId: dataObject?.slaveIds?.chart3SlaveId
        }, handleGetChartThreeDataSuccess, handleGetChartThreeDataException)
    }
    const handleHeaderException = () => { }

    const handleChange = (event) => {
        setChecked({ ...checked, [event.target.name]: event.target.checked });
    };

    const handleFilterChange = (event) => {
        setFilterChecked({ ...filterChecked, [event.target.name]: event.target.checked });
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleFilterOpen = () => {
        setFilterOpen(true)
    }
    const handleFilterClose = () => {
        setFilterOpen(false)
    }

    const handleExportOpen = () => {
        setExportOpen(true)
    }
    const handleExportClose = () => {
        setExportOpen(false)
    }

    const handleSearchClick = () => {
        setSearchClick(!searchClick)
    }

    const handleEnergyChangeSelect = (event) => {
        setBackDropLoader(true)
        setSelectedDropdown('selectAll')
        const {
            target: { value },
        } = event;

        setSelectedEnergyCheckBox(
            typeof value === 'string' ? value.split(',') : value,
        );

        // Splitting the value if it's a string, otherwise, using it directly
        const selectedValues = typeof value === 'string' ? value.split(',') : value;
        // Extracting IDs from the selected values
        const selectedIds = selectedValues.map(val => {
            const selectedTag = selectList1.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        setChartOneTagId(selectedIds)

        // GRAPH API
        GetChartData({
            machineId: machineId,
            selected: "selectAll",
            aggregation: selectedAggregation,
            interval: selectedInterval,
            sortDataType: selectedLast,
            tagIds: selectedIds,
            chartNo: 1,
            slaveId: chartSlaveIds?.chart1SlaveId
        }, handleGetChartDataSuccess, handleGetChartDataException)

    };

    const handleVibrationChangeSelect = (event) => {
        setBackDropLoader(true)
        const {
            target: { value },
        } = event;

        setSelectedVibrationCheckBox(
            typeof value === 'string' ? value.split(',') : value,
        );

        // Splitting the value if it's a string, otherwise, using it directly
        const selectedValues = typeof value === 'string' ? value.split(',') : value;
        // Extracting IDs from the selected values
        const selectedIds = selectedValues.map(val => {
            const selectedTag = selectList2.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        setChartTwoTagId(selectedIds)


        //   UpdateSensorDropdown({
        //       machineId: machineId,
        //       field: "default",
        //       tagId: '',
        //       selected: typeof value === 'string' ? value.split(',') : value,
        //       tagId: selectedIds
        //   }, handleDefaultUpdateSuccess, handleDefaultUpdateException)

        // CHART TWO
        GetChartTwoData({
            machineId: machineId,
            selected: "selectAll",
            aggregation: secondSelectedAggregation,
            interval: secondSelectedInterval,
            sortDataType: secondSelectedLast,
            tagIds: selectedIds,
            chartNo: 2,
            slaveId: chartSlaveIds?.chart2SlaveId
        }, handleGetChartTwoDataSuccess, handleGetChartTwoDataException)

    };

    const handleTemperatureChangeSelect = (event) => {
        setBackDropLoader(true)
        const {
            target: { value },
        } = event;

        setSelectedTemperatureCheckBox(
            typeof value === 'string' ? value.split(',') : value,
        );

        // Splitting the value if it's a string, otherwise, using it directly
        const selectedValues = typeof value === 'string' ? value.split(',') : value;
        // Extracting IDs from the selected values
        const selectedIds = selectedValues.map(val => {
            const selectedTag = selectList3.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        setChartThreeTagId(selectedIds)

        //   UpdateSensorDropdown({
        //       machineId: machineId,
        //       field: "default",
        //       tagId: '',
        //       selected: typeof value === 'string' ? value.split(',') : value,
        //       tagId: selectedIds
        //   }, handleDefaultUpdateSuccess, handleDefaultUpdateException)

        GetChartThreeData({
            machineId: machineId,
            selected: "selectAll",
            aggregation: thirdSelectedAggregation,
            interval: thirdSelectedInterval,
            sortDataType: thirdSelectedLast,
            tagIds: selectedIds,
            chartNo: 3,
            slaveId: chartSlaveIds?.chart3SlaveId
        }, handleGetChartThreeDataSuccess, handleGetChartThreeDataException)

    };

    const handleChangeDefault = (event) => {
        const {
            target: { value },
        } = event;
        setDefaultCheckBox(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const columns = [
        {
            field: 'Date',
            headerName: 'Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'machine_name',
            headerName: 'Machine Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'tagName',
            headerName: 'Tag Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'value',
            headerName: 'Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'alertMessage',
            headerName: 'Alert Message',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function DeleteData(props) {
        return (
            <DeleteIcon onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteDailogOpen(true);
            }}
            />
        )
    }

    const handleDeleteRemark = () => {
        if (deleteRemark) {
            setDeleteValidation("")
            ClearAlertData({ id: deleteId, remark: deleteRemark }, handleDeleteSuccess, handleDeleteException)
        } else {
            setDeleteValidation("Please enter a reason to clear 🚮")
        }
    }

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setRefreshData((oldvalue) => !oldvalue);
        setDeleteRemark("");
        setTimeout(() => {
            handleCloseNotification();
            setDeleteDailogOpen(false)
        }, 3000);
    }
    const handleDeleteException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleCloseNotification();
        }, 3000);
    }

    const handleCloseNotification = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        <Box sx={{ width: '100%', padding: 2 }}>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
                open={backDropLoader}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} lg={2} md={6}>
                    <Item style={{ height: '80px'/*, display: 'flex', justifyContent: "center", alignItems: 'center', flexDirection: 'column'*/ }}>
                        {/* <AccountBalanceIcon /> */}
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%' }}>
                                <img src={machineImage} alt="Image Description" style={{ height: '30px' }} className='imageStyle' />
                                <Typography>{machineName.toUpperCase()}</Typography>
                            </div>
                            <div style={{}}>
                                <SettingsIcon sx={{ fontSize: 25 }} onClick={() => setHeaderSettingOpen(true)} />
                            </div>
                        </div>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>{headerData?.Parameter1_labelname?.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.Parameter1Value}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>{headerData?.Parameter1_setname?.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.Parameter1_setvalue}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>{headerData?.Parameter2_labelname?.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.Parameter2Value}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>{headerData?.Parameter2_setname?.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.Parameter2_setvalue}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={2} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>{headerData?.Parameter3_labelname?.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.Parameter3Value}</Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid container display={'flex'} alignItems={'center'} justifyContent={'center'} > */}
                        {/* <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>SET MEMORY USAGE</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>55%</Typography>
                            </Grid> */}
                        {/* <Grid item>
                                <FlashOnIcon sx={{ fontSize: 40 }} />
                            </Grid>
                        </Grid> */}
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={2} md={12}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>ALERTS</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>{headerData?.alertCount}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} alignItems={'center'} justifyContent={'center'} >
                            {/* <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px' }}>SET MEMORY USAGE</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold' }}>55%</Typography>
                            </Grid> */}
                            <Grid item>
                                <NotificationsIcon sx={{ fontSize: 40 }} />
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>

                {/* ============================================================================================================================================== */}
                {/* BOTTOM GRAPH CARD */}
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold' }}>{selectedEnergyCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName1}</Typography>
                            </Grid>
                            <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label">Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedEnergyCheckBox}
                                        onChange={handleEnergyChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists1.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                <Checkbox checked={selectedEnergyCheckBox.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '13px' }}>4957.62 kwh</Typography>
                            </Grid> */}
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("First");
                                    }}
                                />
                            </Grid>

                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon /><Typography style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => setIntervalModal(true)}>Real Time- Last {selectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" />
                                <YAxis type='number' domain={[0, chartData.maxValue]} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartData?.lines && chartData?.lines.map((item, index) => (
                                    <Line key={index} strokeWidth={3} dot={false} type="monotone" dataKey={item.lineName} stroke={item.stroke} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Item>
                </Grid>

                {/* VIBRATION */}
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold' }}>{selectedVibrationCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName2}</Typography>
                            </Grid>
                            <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label">Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedVibrationCheckBox}
                                        onChange={handleVibrationChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists2.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                <Checkbox checked={selectedVibrationCheckBox.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label">Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={defaultCheckbox}
                                        onChange={handleChangeDefault}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                <Checkbox checked={defaultCheckbox.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
                            {/* <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <AccessAlarmsIcon />
                            </Grid> */}
                            {/* <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '13px' }}>4957.62 kwh</Typography>
                            </Grid> */}

                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("Second");
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon /><Typography style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => setIntervalModalTwo(true)}>Real Time- Last {secondSelectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartTwoData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" />
                                <YAxis type='number' domain={[0, chartTwoData.maxValue]} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartTwoData?.lines && chartTwoData?.lines.map((item, index) => (
                                    <Line key={index} strokeWidth={3} dot={false} type="monotone" dataKey={item.lineName} stroke={item.stroke} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Item>
                </Grid>

                {/* TEMPERATURE */}
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold' }}>{selectedTemperatureCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName3}</Typography>
                            </Grid>
                            <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label">Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedTemperatureCheckBox}
                                        onChange={handleTemperatureChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists3.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                <Checkbox checked={selectedTemperatureCheckBox.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label">Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={defaultCheckbox}
                                        onChange={handleChangeDefault}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name}>
                                                <Checkbox checked={defaultCheckbox.indexOf(name) > -1} />
                                                <ListItemText primary={name} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
                            {/* <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '13px' }}>50C</Typography>
                            </Grid> */}
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("Third");
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon /><Typography style={{ fontSize: '13px', cursor: 'pointer' }} onClick={() => setIntervalModalThree(true)}>Real Time- Last {thirdSelectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartThreeData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" />
                                {/* <YAxis type='number' domain={[0, 100]} /> */}
                                <YAxis type='number' domain={[0, chartThreeData.maxValue]} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartThreeData?.lines && chartThreeData?.lines.map((item, index) => (
                                    <Line key={index} strokeWidth={3} dot={false} type="monotone" dataKey={item.lineName} stroke={item.stroke} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item style={{ height: '356px' }}>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold' }}>Alert</Typography>
                            </Grid>
                            <Grid item sty={{ marginBottom: '10px', marginTop: '10px' }}>
                                <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="demo-simple-select-label">--Show Entries--</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={alertSelectedDay}
                                            label="--Energy Source--"
                                            onChange={(e) => {
                                                setBackDropLoader(true)
                                                setAlertSelectedDay(e.target.value)
                                                GetAlertData({ machineId: machineId, dateRange: e.target.value }, handleGetAlertSuccess, handleGetAlertException)
                                            }}
                                        >
                                            <MenuItem value={"30days"}>30days</MenuItem>
                                            <MenuItem value={"15days"}>15days</MenuItem>
                                            <MenuItem value={"1week"}>1week</MenuItem>
                                            <MenuItem value={"1day"}>1day</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Grid>
                            {/* <Grid item>
                                <SearchIcon onClick={handleSearchClick} />
                                <DensityMediumIcon onClick={handleClickOpen} />
                                <FilterAltIcon onClick={handleFilterOpen} />
                                <ImportExportIcon onClick={handleExportOpen} />
                            </Grid> */}
                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                            {searchClick ?
                                <TextField
                                    id="outlined-basic"
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                :
                                <>
                                    {/* <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                        <AccessTimeIcon /><Typography style={{ fontSize: '13px' }}>Real Time-latest</Typography>
                                    </Grid> */}
                                    {/* <Grid item>
                                        <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                            <FormControl fullWidth size="small">
                                                <InputLabel id="demo-simple-select-label">--Show Entries--</InputLabel>
                                                <Select
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    value={alertSelectedDay}
                                                    label="--Energy Source--"
                                                    onChange={(e) => {
                                                        setAlertSelectedDay(e.target.value)
                                                        GetAlertData({ machineId: machineId, dateRange: e.target.value }, handleGetAlertSuccess, handleGetAlertException)
                                                    }}
                                                >
                                                    <MenuItem value={"30days"}>30days</MenuItem>
                                                    <MenuItem value={"15days"}>15days</MenuItem>
                                                    <MenuItem value={"1week"}>1week</MenuItem>
                                                    <MenuItem value={"1day"}>1day</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </Grid> */}
                                </>
                            }
                            <Grid item>
                            </Grid>
                        </Grid>
                        <Grid container style={{ /*overflowY: 'scroll',*/ height: '244px' }}>
                            <Grid item width={'100%'} paddingTop={1}>
                                {/* <div>
                                    <div>
                                        <table id="customers">
                                            <thead>
                                                <tr>
                                                    {checked.CreatedTime === true ? null : <th>Created Time</th>}
                                                    {checked.Originator === true ? null : <th>Originator</th>}
                                                    {checked.Type === true ? null : <th>Type</th>}
                                                    {checked.Severity === true ? null : <th>Severity</th>}
                                                    {checked.Details === true ? null : <th>Details</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {checked.CreatedTime === true ? null : <td>13:13:01 To 2022-03-22</td>}
                                                    {checked.Originator === true ? null : <td>Vibration Sensor</td>}
                                                    {checked.Type === true ? null : <td>Vibration High</td>}
                                                    {checked.Severity === true ? null : <td>Major</td>}
                                                    {checked.Details === true ? null : <td>136.44</td>}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div> */}
                                <div style={{ height: 290, width: '100%' }}>
                                    <DataGrid
                                        rows={alertData}
                                        columns={columns}
                                        pageSize={5}
                                        rowsPerPageOptions={[5]}
                                        disableSelectionOnClick
                                        style={{ backgroundColor: '#ffffff' }}
                                    />
                                </div>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
            </Grid>

            {/* --------DAILOGBOX FOR DELETE REASON */}
            <Dialog
                fullWidth
                maxWidth="sm"
                sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
                open={deleteDailogOpen}
            >
                <DialogTitle sx={{ textAlign: 'center' }}>
                    <WarningAmber color="warning" style={{ fontSize: 95 }} />
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center' }}>
                    <Typography
                        sx={{ m: 1 }}
                        variant="h5"
                        component="span"
                    >
                        Do you really want to clear this record?
                    </Typography>
                    <br />
                    This process cannot be undone.
                    <Grid container marginTop={2}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField
                                fullWidth
                                required
                                id="outlined-multiline-static"
                                label="Reason for clear"
                                multiline
                                rows={4}
                                value={deleteRemark}
                                onChange={(e) => {
                                    setDeleteRemark(e.target.value);
                                    setDeleteValidation("");
                                }}
                            // defaultValue="Reason for delete"
                            />
                            <Typography style={{ color: 'red' }}>{deleteValidation}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Button onClick={handleDeleteRemark}>
                            Confirm
                        </Button>
                        <Button
                            onClick={() => {
                                setDeleteDailogOpen(false)
                                setDeleteValidation("")
                                setDeleteRemark("")
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
            {/* ----DAILOGBOX FOR 3line---- */}
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
                    <DialogContentText id="alert-dialog-description">
                        <FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked.CreatedTime}
                                        onChange={handleChange}
                                        name="CreatedTime"
                                        color="primary"
                                    />
                                }
                                label="CreatedTime"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked.Originator}
                                        onChange={handleChange}
                                        name="Originator"
                                        color="primary"
                                    />
                                }
                                label="Originator"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked.Type}
                                        onChange={handleChange}
                                        name="Type"
                                        color="primary"
                                    />
                                }
                                label="Type"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked.Severity}
                                        onChange={handleChange}
                                        name="Severity"
                                        color="primary"
                                    />
                                }
                                label="Severity"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={checked.Details}
                                        onChange={handleChange}
                                        name="Details"
                                        color="primary"
                                    />
                                }
                                label="Details"
                            />
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            {/* ----DAILOGBOX FOR FILTER---- */}
            <Dialog
                open={filterOpen}
                onClose={handleFilterClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Columns to filter"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <FormControl>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterChecked.Any}
                                        onChange={handleFilterChange}
                                        name="Any"
                                        color="primary"
                                    />
                                }
                                label="Any"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterChecked.Active}
                                        onChange={handleFilterChange}
                                        name="Active"
                                        color="primary"
                                    />
                                }
                                label="Active"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterChecked.Cleared}
                                        onChange={handleFilterChange}
                                        name="Cleared"
                                        color="primary"
                                    />
                                }
                                label="Cleared"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterChecked.Acknowledged}
                                        onChange={handleFilterChange}
                                        name="Acknowledged"
                                        color="primary"
                                    />
                                }
                                label="Acknowledged"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={filterChecked.UnAcknowledged}
                                        onChange={handleFilterChange}
                                        name="UnAcknowledged"
                                        color="primary"
                                    />
                                }
                                label="UnAcknowledged"
                            />
                        </FormControl>
                    </DialogContentText>
                </DialogContent>
            </Dialog>
            {/* ----DAILOGBOX FOR EXPORT---- */}
            <Dialog
                open={exportOpen}
                onClose={handleExportClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Export as"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <Typography className='exportTextFromate'>CSV Format</Typography>
                        <Typography className='exportTextFromate'>Exel Format</Typography>
                        <Typography className='exportTextFromate'>Pdf Format</Typography>
                        <Typography className='exportTextFromate'>Copy Data</Typography>
                    </DialogContentText>
                </DialogContent>
            </Dialog>

            < HeaderSettingModal
                headerSettingOpen={headerSettingOpen}
                setHeaderSettingOpen={setHeaderSettingOpen}
                machineId={machineId}
                setRefreshData={setRefreshData}
                setHeaderRefreshData={setHeaderRefreshData}
            />
            < GraphSettingModal
                graphSettingOpen={graphSettingOpen}
                setGraphSettingOpen={setGraphSettingOpen}
                selectedGraph={selectedGraph}
                setSelectedDropdown={setSelectedDropdown}
                selectedGropdown={selectedGropdown}
                machineId={machineId}
                setChartData={setChartData}
                setChartTwoData={setChartTwoData}
                setChartThreeData={setChartThreeData}
                setRefreshData={setRefreshData}
                setHeaderRefreshData={setHeaderRefreshData}
                //FIRST GRAPH
                selectedLast={selectedLast}
                setSelectedLast={setSelectedLast}
                selectedAggregation={selectedAggregation}
                setSelectedAggregation={setSelectedAggregation}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                chartOneName={graphDisplayNames?.displayName1}
                chartTwoName={graphDisplayNames?.displayName2}
                chartThreeName={graphDisplayNames?.displayName3}
                chartOneSlaveId={chartSlaveIds?.chart1SlaveId}
                chartTwoSlaveId={chartSlaveIds?.chart2SlaveId}
                chartThreeSlaveId={chartSlaveIds?.chart3SlaveId}
                setBackDropLoader={setBackDropLoader}
            />
            < IntervalModal
                intervalModal={intervalModal}
                setIntervalModal={setIntervalModal}
                selectedGraph={selectedGraph}
                setSelectedDropdown={setSelectedDropdown}
                selectedGropdown={selectedGropdown}
                machineId={machineId}
                setChartData={setChartData}
                chartOneTagId={chartOneTagId}
                //FIRST GRAPH
                selectedLast={selectedLast}
                setSelectedLast={setSelectedLast}
                selectedAggregation={selectedAggregation}
                setSelectedAggregation={setSelectedAggregation}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                // SECOND GRAPH
                secondSelectedLast={secondSelectedLast}
                setSecondSelectedLast={setSecondSelectedLast}
                secondSelectedAggregation={secondSelectedAggregation}
                setSecondSelectedAggregation={setSecondSelectedAggregation}
                secondSelectedInterval={secondSelectedInterval}
                setSecondSelectedInterval={setSecondSelectedInterval}
                //THIRD GRAPH
                thirdSelectedLast={thirdSelectedLast}
                setThirdSelectedLast={setThirdSelectedLast}
                thirdSelectedAggregation={thirdSelectedAggregation}
                setThirdSelectedAggregation={setThirdSelectedAggregation}
                thirdSelectedInterval={thirdSelectedInterval}
                setThirdSelectedInterval={setThirdSelectedInterval}
                //SLAVE ID
                chartOneSlaveId={chartSlaveIds?.chart1SlaveId}
                setBackDropLoader={setBackDropLoader}
            />
            < IntervalModalTwo
                intervalModalTwo={intervalModalTwo}
                setIntervalModalTwo={setIntervalModalTwo}
                selectedGraph={selectedGraph}
                setSelectedDropdown={setSelectedDropdown}
                selectedGropdown={selectedGropdown}
                machineId={machineId}
                setChartTwoData={setChartTwoData}
                chartTwoTagId={chartTwoTagId}
                //FIRST GRAPH
                selectedLast={selectedLast}
                setSelectedLast={setSelectedLast}
                selectedAggregation={selectedAggregation}
                setSelectedAggregation={setSelectedAggregation}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                // SECOND GRAPH
                secondSelectedLast={secondSelectedLast}
                setSecondSelectedLast={setSecondSelectedLast}
                secondSelectedAggregation={secondSelectedAggregation}
                setSecondSelectedAggregation={setSecondSelectedAggregation}
                secondSelectedInterval={secondSelectedInterval}
                setSecondSelectedInterval={setSecondSelectedInterval}
                //THIRD GRAPH
                thirdSelectedLast={thirdSelectedLast}
                setThirdSelectedLast={setThirdSelectedLast}
                thirdSelectedAggregation={thirdSelectedAggregation}
                setThirdSelectedAggregation={setThirdSelectedAggregation}
                thirdSelectedInterval={thirdSelectedInterval}
                setThirdSelectedInterval={setThirdSelectedInterval}
                //SLAVE ID
                chartTwoSlaveId={chartSlaveIds?.chart2SlaveId}
                setBackDropLoader={setBackDropLoader}
            />
            < IntervalModalThree
                intervalModalThree={intervalModalThree}
                setIntervalModalThree={setIntervalModalThree}
                selectedGraph={selectedGraph}
                setSelectedDropdown={setSelectedDropdown}
                selectedGropdown={selectedGropdown}
                machineId={machineId}
                setChartThreeData={setChartThreeData}
                chartThreeTagId={chartThreeTagId}
                //FIRST GRAPH
                selectedLast={selectedLast}
                setSelectedLast={setSelectedLast}
                selectedAggregation={selectedAggregation}
                setSelectedAggregation={setSelectedAggregation}
                selectedInterval={selectedInterval}
                setSelectedInterval={setSelectedInterval}
                // SECOND GRAPH
                secondSelectedLast={secondSelectedLast}
                setSecondSelectedLast={setSecondSelectedLast}
                secondSelectedAggregation={secondSelectedAggregation}
                setSecondSelectedAggregation={setSecondSelectedAggregation}
                secondSelectedInterval={secondSelectedInterval}
                setSecondSelectedInterval={setSecondSelectedInterval}
                //THIRD GRAPH
                thirdSelectedLast={thirdSelectedLast}
                setThirdSelectedLast={setThirdSelectedLast}
                thirdSelectedAggregation={thirdSelectedAggregation}
                setThirdSelectedAggregation={setThirdSelectedAggregation}
                thirdSelectedInterval={thirdSelectedInterval}
                setThirdSelectedInterval={setThirdSelectedInterval}
                //SLAVE ID
                chartThreeSlaveId={chartSlaveIds?.chart3SlaveId}
                setBackDropLoader={setBackDropLoader}
            />
            <NotificationBar
                handleClose={handleCloseNotification}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    )
}
export default HealthDashboardInsideCard;
