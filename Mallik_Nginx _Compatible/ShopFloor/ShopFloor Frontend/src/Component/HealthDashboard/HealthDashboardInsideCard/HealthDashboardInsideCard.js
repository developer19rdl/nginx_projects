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
import { Backdrop, CircularProgress, FormControl, InputAdornment, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Switch, TextField, Typography } from '@mui/material';
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
import { GetSensorDropdown, GetMachineHeaderData, GetChartData, GetChartTwoData, GetChartThreeData, GetSelectDropdown, GetAlertData, ClearAlertData } from '../../../Services/NodeJsApiServices';
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

const data = [
    {
        "name": "Page A",
        "uv": 4000,
        "pv": 2400,
        "amt": 2400
    },
    {
        "name": "Page B",
        "uv": 3000,
        "pv": 1398,
        "amt": 2210
    },
    {
        "name": "Page C",
        "uv": 2000,
        "pv": 9800,
        "amt": 2290
    },
    {
        "name": "Page D",
        "uv": 2780,
        "pv": 3908,
        "amt": 2000
    },
    {
        "name": "Page E",
        "uv": 1890,
        "pv": 4800,
        "amt": 2181
    },
    {
        "name": "Page F",
        "uv": 2390,
        "pv": 3800,
        "amt": 2500
    },
    {
        "name": "Page G",
        "uv": 3490,
        "pv": 4300,
        "amt": 2100
    }
]

const HealthDashboardInsideCard = () => {
    const location = useLocation();
    const [sensorLists, setSensorLists] = useState([])
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
    console.log("headerData", headerData)
    const [intervalModal, setIntervalModal] = useState(false);
    const [intervalModalTwo, setIntervalModalTwo] = useState(false);
    const [intervalModalThree, setIntervalModalThree] = useState(false);
    const [selectList, setSelectList] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [headerRefreshData, setHeaderRefreshData] = useState(false);
    const [graphDisplayNames, setGraphDisplayNames] = useState('')
    const [chartSlaveIds, setChartSlaveIds] = useState('');
    console.log("chartSlaveIds", chartSlaveIds)

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
    console.log(chartThreeData)
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

    // EACH CARD
    const Item = styled(Paper)(({ theme }) => ({
        // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        backgroundColor: isDarkMode ? '#1A2027' : '#ffffff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    // BACKGROUND COLOR OF DROPDOWN LISTS AFTER CLICK
    const MenuProps = {
        PaperProps: {
            style: {
                backgroundColor: isDarkMode ? '#333333' : '#ffffff', // Background color for the dropdown list
            },
        },
    };


    const machineName = new URLSearchParams(location.search).get('machineName');
    const machineId = new URLSearchParams(location.search).get('machineId');
    const machineImage = new URLSearchParams(location.search).get('machineImage');

    useEffect(() => {
        GetSelectDropdown({ machineId: machineId, field: "selectAll" }, handleGetSensorSuccess, handleGetSensorException)
        GetAlertData({ machineId: machineId, dateRange: alertSelectedDay }, handleGetAlertSuccess, handleGetAlertException)
        // GetMachineHeaderData({ machineId: machineId }, handleHeaderSuccess, handleHeaderException)
        // // CHART ONE
        // GetChartData({
        //     machineId: machineId,
        //     selected: selectedGropdown,
        //     aggregation: "min",
        //     interval: "1hr",
        //     sortDataType: "15days",
        //     tagIds: [],
        //     chartNo: 1,
        //     selectedSlaveId:chartSlaveIds?.chart1SlaveId
        // }, handleGetChartDataSuccess, handleGetChartDataException)

        // // CHART TWO
        // GetChartTwoData({
        //     machineId: machineId,
        //     selected: selectedGropdown,
        //     aggregation: "min",
        //     interval: "1hr",
        //     sortDataType: "15days",
        //     tagIds: [],
        //     chartNo: 2,
        //     selectedSlaveId:chartSlaveIds?.chart2SlaveId
        // }, handleGetChartTwoDataSuccess, handleGetChartTwoDataException)

        // // CHART TWO
        // GetChartThreeData({
        //     machineId: machineId,
        //     selected: selectedGropdown,
        //     aggregation: "min",
        //     interval: "1hr",
        //     sortDataType: "15days",
        //     tagIds: [],
        //     chartNo: 3,
        //     selectedSlaveId:chartSlaveIds?.chart3SlaveId
        // }, handleGetChartThreeDataSuccess, handleGetChartThreeDataException)
    }, [refreshData])

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

    const handleGetSensorSuccess = (dataObject) => {
        const tagNames = dataObject.data.map((item) => item.Tag_name);
        setSensorLists(tagNames);
        setSelectList(dataObject?.data)
    }
    const handleGetSensorException = () => { }

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
            const selectedTag = selectList.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        console.log("selectedIds", selectedIds)
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
            const selectedTag = selectList.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        console.log("selectedIds", selectedIds)
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
            aggregation: "min",
            interval: "1hr",
            sortDataType: "15days",
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
            const selectedTag = selectList.find(tag => tag.Tag_name === val);
            return selectedTag ? selectedTag.Id : null;
        }).filter(id => id !== null);
        console.log("selectedIds", selectedIds)
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
            aggregation: "min",
            interval: "1hr",
            sortDataType: "15days",
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
        // {
        //   field: 'id',
        //   headerName: 'ID',
        //   minWidth: 60,
        //   align: 'center',
        //   flex: 1,
        //   headerAlign: 'center'
        // },
        {
            field: 'Date',
            headerName: 'Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        // {
        //   field: 'machineId',
        //   headerName: 'Machine ID',
        //   minWidth: 60,
        //   align: 'center',
        //   flex: 1,
        //   headerAlign: 'center'
        // },
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

    /////////////////////////////////////////////////////
    const MaterialUISwitch = styled(Switch)(({ theme }) => ({
        width: 62,
        height: 34,
        padding: 7,
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                        '#fff',
                    )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: '#aab4be',
                    ...theme.applyStyles('dark', {
                        backgroundColor: '#8796A5',
                    }),
                },
            },
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: isDarkMode ? '#FABC3F' : '#001e3c',
            width: 32,
            height: 32,
            '&::before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
                    '#fff',
                )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
            },
            ...theme.applyStyles('dark', {
                backgroundColor: '#003892',
            }),
        },
        '& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: '#aab4be',
            borderRadius: 20 / 2,
            ...theme.applyStyles('dark', {
                backgroundColor: '#8796A5',
            }),
        },
    }));

    // GRAPH LINE COLOR GENERATOR BASED ON SELECTED THEME
    const generateRandomColor = (isDarkMode) => {
        // Random hue between 0 and 360
        const hue = Math.floor(Math.random() * 360);
        // If dark mode, generate light colors (high lightness), else generate dark colors (low lightness)
        const lightness = isDarkMode ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 30) + 20;
        const saturation = 80; // Saturation can stay constant for vibrant colors
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };

    return (
        <Box sx={{ width: '100%', padding: 2, backgroundColor: isDarkMode ? '#404040' : '#f0f0f0', overflow: 'auto', height: '100vh' }}>
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
                                <img
                                    src={machineImage}
                                    alt="Image Description"
                                    className='imageStyle'
                                    style={{
                                        height: '30px',
                                        filter: isDarkMode ? 'invert(1)' : 'none'
                                    }}
                                />
                                <Typography style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{machineName.toUpperCase()}</Typography>
                            </div>
                            <div style={{}}>
                                <SettingsIcon sx={{ fontSize: 25, color: isDarkMode ? '#ffffff' : '#000000' }} onClick={() => setHeaderSettingOpen(true)} />
                            </div>
                        </div>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter1_labelname.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter1Value}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter1_setname.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter1_setvalue}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={3} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter2_labelname.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter2Value}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter2_setname.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter2_setvalue}</Typography>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={2} md={6}>
                    <Item style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '80px' }}>
                        <Grid container display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                            <Grid item>
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter3_labelname.toUpperCase()}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.Parameter3Value}</Typography>
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
                                <Typography variant="h7" style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000' }}>ALERTS</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="h5" style={{ fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{headerData?.alertCount}</Typography>
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
                                <NotificationsIcon sx={{ fontSize: 40, color: isDarkMode ? '#ffffff' : '#000000' }} />
                            </Grid>
                        </Grid>

                        <FormGroup style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FormControlLabel
                                control={<MaterialUISwitch
                                    sx={{ m: 1 }}
                                    checked={isDarkMode}
                                    onChange={(e) => setIsDarkMode(e.target.checked)}
                                />}
                            // label="MUI switch"
                            />
                        </FormGroup>
                    </Item>
                </Grid>

                {/* ============================================================================================================================================== */}
                {/* BOTTOM GRAPH CARD */}
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{selectedEnergyCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName1}</Typography>
                            </Grid>
                            {/* <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedEnergyCheckBox}
                                        onChange={handleEnergyChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedEnergyCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
                            {/* <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography style={{ fontSize: '13px' }}>4957.62 kwh</Typography>
                            </Grid> */}
                            <Grid item style={{ display: 'flex', alignItems: 'center' }}>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedEnergyCheckBox}
                                        onChange={handleEnergyChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedEnergyCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px', color: isDarkMode ? '#ffffff' : '#000000' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("First");
                                    }}
                                />
                            </Grid>

                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon style={{ color: isDarkMode ? '#ffffff' : '#000000' }} /><Typography style={{ fontSize: '13px', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} onClick={() => setIntervalModal(true)}>Real Time- Last {selectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                <YAxis type='number' domain={[0, chartData.maxValue]} tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartData?.lines && chartData?.lines.map((item, index) => (
                                    <Line strokeWidth={3} dot={false} key={index} type="monotone" dataKey={item.lineName} stroke={generateRandomColor(isDarkMode)} />
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
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{selectedVibrationCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName2}</Typography>
                            </Grid>
                            {/* <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedVibrationCheckBox}
                                        onChange={handleVibrationChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedVibrationCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
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
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedVibrationCheckBox}
                                        onChange={handleVibrationChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    // MenuProps={MenuProps}
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedVibrationCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px', color: isDarkMode ? '#ffffff' : '#000000' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("Second");
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon style={{ color: isDarkMode ? '#ffffff' : '#000000' }} /><Typography style={{ fontSize: '13px', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} onClick={() => setIntervalModalTwo(true)}>Real Time- Last {secondSelectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartTwoData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                <YAxis type='number' domain={[0, chartTwoData.maxValue]} tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartTwoData?.lines && chartTwoData?.lines.map((item, index) => (
                                    <Line strokeWidth={3} dot={false} key={index} type="monotone" dataKey={item.lineName} stroke={generateRandomColor(isDarkMode)} />
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
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>{selectedTemperatureCheckBox.length > 0 ? "CUSTOM" : graphDisplayNames?.displayName3}</Typography>
                            </Grid>
                            {/* <Grid item>
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedTemperatureCheckBox}
                                        onChange={handleTemperatureChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedTemperatureCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid> */}
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
                                <FormControl sx={{ m: 1, width: 200 }}>
                                    <InputLabel id="demo-multiple-checkbox-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>Select</InputLabel>
                                    <Select
                                        labelId="demo-multiple-checkbox-label"
                                        id="demo-multiple-checkbox"
                                        multiple
                                        value={selectedTemperatureCheckBox}
                                        onChange={handleTemperatureChangeSelect}
                                        input={<OutlinedInput label="Select" />}
                                        renderValue={(selected) => selected.join(', ')}
                                        size='small'
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                            },
                                            '& .MuiSelect-icon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                            },
                                        }}
                                        style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                    >
                                        {sensorLists.map((name) => (
                                            <MenuItem key={name} value={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>
                                                <Checkbox checked={selectedTemperatureCheckBox.indexOf(name) > -1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                                <ListItemText primary={name} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} />
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <SettingsIcon
                                    sx={{ fontSize: 25, marginLeft: '80px', color: isDarkMode ? '#ffffff' : '#000000' }}
                                    onClick={() => {
                                        setGraphSettingOpen(true);
                                        setSelectedGraph("Third");
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid container display={'flex'} justifyContent={'space-between'} style={{ marginBottom: '10px' }}>
                            <Grid item display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                                <AccessTimeIcon style={{ color: isDarkMode ? '#ffffff' : '#000000' }} /><Typography style={{ fontSize: '13px', cursor: 'pointer', color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }} onClick={() => setIntervalModalThree(true)}>Real Time- Last {thirdSelectedLast}</Typography>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={chartThreeData?.data}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="dateTime" tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                {/* <YAxis type='number' domain={[0, 100]} /> */}
                                <YAxis type='number' domain={[0, chartThreeData.maxValue]} tick={{ fill: isDarkMode ? '#ffffff' : '#000000' }} />
                                <Tooltip />
                                <Legend />
                                <Brush dataKey="dateTime" height={30} stroke="#602BF8" />
                                {chartThreeData?.lines && chartThreeData?.lines.map((item, index) => (
                                    <Line strokeWidth={3} dot={false} key={index} type="monotone" dataKey={item.lineName} stroke={generateRandomColor(isDarkMode)} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} lg={6} md={6}>
                    <Item style={{ height: '356px' }}>
                        <Grid container display={'flex'} justifyContent={'space-between'}>
                            <Grid item style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', marginTop: '10px' }}>
                                <Typography style={{ fontSize: '18px', marginLeft: '3px', fontWeight: 'bold', color: isDarkMode ? '#ffffff' : '#000000' }}>Alert</Typography>
                            </Grid>
                            <Grid item sty={{ marginBottom: '10px', marginTop: '10px' }}>
                                <Box width={{ lg: "222px", md: '222px', xs: '178px', sm: '222px' }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="demo-simple-select-label" style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>--Show Entries--</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={alertSelectedDay}
                                            label="--Energy Source--"
                                            sx={{
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: isDarkMode ? '#ffffff' : '#000000', // Border color (optional)
                                                },
                                                '& .MuiSelect-icon': {
                                                    color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow color
                                                },
                                            }}
                                            style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold', backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                            onChange={(e) => {
                                                setBackDropLoader(true)
                                                setAlertSelectedDay(e.target.value)
                                                GetAlertData({ machineId: machineId, dateRange: e.target.value }, handleGetAlertSuccess, handleGetAlertException)
                                            }}
                                            MenuProps={MenuProps} // Apply custom styles to the dropdown list
                                        >
                                            <MenuItem value={"30days"} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>30days</MenuItem>
                                            <MenuItem value={"15days"} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>15days</MenuItem>
                                            <MenuItem value={"1week"} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>1week</MenuItem>
                                            <MenuItem value={"1day"} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontWeight: 'bold' }}>1day</MenuItem>
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
                                        style={{ backgroundColor: isDarkMode ? '#454545' : '#ffffff' }}
                                        sx={{
                                            '& .MuiDataGrid-columnHeaders': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Header text color
                                                fontWeight: 'bold', // Header font weight
                                            },
                                            '& .MuiDataGrid-columnHeaderTitle': {
                                                fontWeight: 'bold', // Ensures the header font weight is bold
                                            },
                                            '& .MuiDataGrid-footerContainer': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Footer (pagination) text color
                                            },
                                            '& .MuiTablePagination-root': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Pagination text color
                                            },
                                            '& .MuiTablePagination-selectIcon': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Dropdown arrow icon color in pagination
                                            },
                                            '& .MuiSvgIcon-root': {
                                                color: isDarkMode ? '#ffffff' : '#000000', // Pagination left and right icon color
                                            },
                                        }}
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
                isDarkMode={isDarkMode}
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
                isDarkMode={isDarkMode}
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
                isDarkMode={isDarkMode}
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
                isDarkMode={isDarkMode}
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
                isDarkMode={isDarkMode}
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

