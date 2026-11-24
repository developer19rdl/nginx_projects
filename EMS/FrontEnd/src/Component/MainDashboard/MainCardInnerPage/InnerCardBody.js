import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { Stack, Typography, colors } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { Bar, BarChart, Tooltip, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Area } from 'recharts';
import { Chart } from "react-google-charts";
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import InnerCardOeeModal from './InnerCardOeeModal';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SwipeableViews from "react-swipeable-views";
import { GetCalenderDetails, GetCapacityUtilizationData, GetDownTimeTrends, OeeDetails, OeePlanedProduced } from '../../../Services/NodeJsApiServices';
import { DataObject } from '@mui/icons-material';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export const data = [
    ["Year", "Planed", "Actual",],
    ["2011", 10, 0],
    ["2012", 31, 45],
    ["2013", 90, 50],
    ["2014", 0, 80],

];
export const options1 = {

    colors: ['#3366cc', '#109618'],
};

export const options = {
    // title: "Availability Status",
    is3D: true,
    colors: ["#3366cc", "#FF0000", "#109618", "#FF9900"]
};

// CALENDER DATA
const customStartDate = moment('2023-10-30 10:00'); // Replace with your desired start date and time
const customEndDate = moment('2023-10-30 12:00'); // Replace with your desired end date and time

const date1 = '2023-10-28 10:00';
const date2 = '2023-10-30 10:00';


// WHITE ITEM CARD
const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    // boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
}));
const localizer = momentLocalizer(moment)

// CIRCULAR PROGRESSBAR
function CircularProgressWithLabel(props) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" size={155} color="secondary" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography variant="caption" component="div" color="text.secondary" fontSize={20}>
                    {`${Math.round(props.value)}%`}
                </Typography>
            </Box>
        </Box>
    );
}

const InnerCardBody = (props) => {
    const [oeeProducedData, setOeeProducedData] = useState([]);
    const { machineId, currentDate, machineProdLoader, companyDetails, machineCardData } = props;
    const [modalVisible, setModalVisible] = useState(false)
    const [value, setValue] = useState(0);
    const [plantOeeData, setPlantOeeData] = useState('');
    const [downTimeTrendsData, setDownTimeTrendsData] = useState([]);
    const [capacityUtilizationData, setCapacityUtilizationData] = useState([]);
    const [calenderData, setCalenderData] = useState([])

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    useEffect(() => {
        // OeeDetails(
        //     {
        //         machineId: machineId,
        //         nextDate: currentDate
        //     }, handleOeeSuccess, handleOeeException
        // );
        OeePlanedProduced(
            {
                machineId: machineId,
            }, handlePlanedProduceSuccess, handlePlanedProduceException
        )

        GetDownTimeTrends(
            {
                machineId: machineId
            }, handleDownTimeTrendsSuccess, handleDownTimeException
        )

        GetCalenderDetails({ machineId: machineId }, handleCalenderDetailsSuccess, handleCalenderDetailsException)

    }, [machineId, currentDate]);

    // CALENDER HANDLER
    const handleCalenderDetailsSuccess = (dataObject) => {
        setCalenderData(dataObject?.data)
    }
    const handleCalenderDetailsException = () => { }

    const handleOeeSuccess = (dataObject) => {
        setPlantOeeData(dataObject?.data)
    };
    const handleOeeException = () => {
    };

    const handlePlanedProduceSuccess = (dataObject) => {
        setOeeProducedData(dataObject?.data)
    };
    const handlePlanedProduceException = () => {
    };

    const handleDownTimeTrendsSuccess = (dataObject) => {
        setDownTimeTrendsData(dataObject?.data)
    }
    const handleDownTimeException = () => { }

    const totalUptime = downTimeTrendsData.reduce((acc, value) => acc + value.UpTime, 0) / 60;
    const totalIdletime = downTimeTrendsData.reduce((acc, value) => acc + value.IdleTime, 0) / 60;
    const totalDowntime = downTimeTrendsData.reduce((acc, value) => acc + value.DownTime, 0) / 60;

    const handleFilterButtonClick = (period) => {
        GetDownTimeTrends(
            {
                machineId: machineId,
                period: period
            }, handleDownTimeTrendsSuccess, handleDownTimeException
        )
    }
    const buttons = [
        <Button key="today" onClick={() => handleFilterButtonClick('today')}>Today</Button>,
        <Button key="week" onClick={() => handleFilterButtonClick('week')}>Week</Button>,
        <Button key="month" onClick={() => handleFilterButtonClick('month')}>Month</Button>,
    ];


    // const CalenderData = [
    //     { id: 28, Maintype: "Conditions Based Maintenance", fromdate: "2024-06-08", todate: "2024-06-13" }
    // ];

    // Convert CalenderData to Events
    // const Events = CalenderData.map((data, index) => ({
    //     title: `Event ${index + 1}`,
    //     start: moment(data.fromdate).toDate(),
    //     end: moment(data.todate).toDate(),
    // }));

    // const Events = [
    //     { id: 30, title: 'BreakDown', start: '2024-06-13', end: '2024-06-21' },
    //     { id: 31, title: 'Preventive Maintenance', start: '2024-07-16', end: '2024-07-19' }
    // ]

    const Events = calenderData.map((data, index) => ({
        title: data.title,
        start: moment(data.start).toDate(),
        end: moment(data.end).toDate(),
    }));

    return (
        <Box sx={{ margin: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item style={{ paddingBottom: '49px' }}>
                        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={5} spacing={2}>
                            <Grid item>
                                <Typography style={{ width: '100%', textAlign: 'start', color: '#203580', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px' }}>{machineCardData.machine_name.toUpperCase()} - OEE</Typography>
                            </Grid>
                            <Grid item>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexWrap: 'wrap',
                                        alignItems: 'flex-start',
                                        '& > *': {
                                            m: 0,
                                        },
                                    }}
                                >
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        '& > *': {
                                            m: 0,
                                        },
                                    }}
                                >
                                </Box>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" endIcon={<RemoveRedEyeIcon />} onClick={() => setModalVisible(!modalVisible)}>
                                    View
                                </Button>
                            </Grid>
                        </Grid>
                        <Grid container justifyContent={'space-around'} flexWrap={'wrap'} style={{ paddingTop: '20px' }}>
                            <Grid item>
                                <CircularProgressWithLabel value={machineCardData.oee} />
                            </Grid>
                            <Grid item style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <Grid container spacing={7.5}>
                                    <Grid item>
                                        <Typography style={{ color: '#404462' }}>Availability</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#203580' }}>{machineCardData.availability}%</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={10.7}>
                                    <Grid item>
                                        <Typography style={{ color: '#404462' }}>Quality</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#203580' }}>{machineCardData.quality}%</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={5}>
                                    <Grid item>
                                        <Typography style={{ color: '#404462' }}>Performance</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#203580' }}>{machineCardData.performance}%</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item>
                        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} paddingBottom={2} spacing={2}>
                            <Grid item>
                                <Typography style={{ width: '100%', textAlign: 'start', color: '#203580', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px' }}>
                                    Capacity Utilization
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        '& > *': {
                                            m: 0,
                                        },
                                    }}
                                >
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        '& > *': {
                                            m: 0,
                                        },
                                    }}
                                >
                                </Box>
                            </Grid>
                        </Grid>
                        <ResponsiveContainer width={'100%'} height={250}>
                            <ComposedChart width={730} height={250} data={oeeProducedData}>
                                <XAxis dataKey="HR" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <CartesianGrid stroke="#f5f5f5" />
                                {/* <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" /> */}
                                <Bar dataKey="Actual" barSize={20} fill="#413ea0" />
                                <Line type="monotone" dataKey="Planned" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item style={{ height: '480px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Grid container display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} spacing={2} paddingBottom={2}>
                            <Grid item>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                        <Tab label="Performance" {...a11yProps(0)} />
                                        <Tab label="Downtime Trends" {...a11yProps(1)} />
                                    </Tabs>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        '& > *': {
                                            m: 0,
                                        },
                                    }}
                                >
                                    {value === 1 && (
                                        <ButtonGroup size="small" aria-label="large button group">
                                            {buttons}
                                        </ButtonGroup>)
                                    }
                                </Box>
                            </Grid>
                        </Grid>
                        <SwipeableViews
                            index={value}
                            onChangeIndex={(index) => setValue(index)}
                            enableMouseEvents
                        >
                            <CustomTabPanel value={value} index={0}>
                                <Chart
                                    chartType="PieChart"
                                    data={machineCardData.pieData}
                                    options={options}
                                    width={"100%"}
                                    height={"330px"}
                                />
                            </CustomTabPanel>
                            <CustomTabPanel value={value} index={1}>
                                <ResponsiveContainer width={'100%'} height={250}>
                                    <BarChart width={730} height={250} data={downTimeTrendsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="HR" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="IdleTime" fill="#DC5F00" />
                                        <Bar dataKey="DownTime" fill="#FF0000" />
                                        <Bar dataKey="UpTime" fill="#3ABEF9" />
                                    </BarChart>
                                </ResponsiveContainer>

                                <Grid container justifyContent={'space-between'} spacing={2} style={{ marginTop: '30px' }} >
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '10px' }} >
                                            <Typography style={{ color: '#FF0000', fontWeight: 'bold' }}>Total Downtime : {totalDowntime} Hrs</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '10px' }} >
                                            <Typography style={{ color: '#DC5F00', fontWeight: 'bold' }}>Total Idletime : {totalIdletime} Hrs</Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '10px' }} >
                                            <Typography style={{ color: '#3ABEF9', fontWeight: 'bold' }}>Total Uptime : {totalUptime} Hrs</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CustomTabPanel>
                        </SwipeableViews>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item style={{ height: '480px' }}>
                        <Typography style={{ width: '100%', textAlign: 'start', color: '#203580', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px', marginBottom: '18px' }}>
                            Calendar Schedules
                        </Typography>
                        <Calendar
                            localizer={localizer}
                            // events={calenderData}
                            events={Events}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 400 }}
                        // onNavigate={(newDate) => console.log(newDate)}
                        />
                    </Item>
                </Grid>
            </Grid>
            <InnerCardOeeModal
                open={modalVisible}
                setModalVisible={setModalVisible}
            />
        </Box>
    );
}
export default InnerCardBody;
