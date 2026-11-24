import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';


import { MenuItem, Stack, Typography, colors } from '@mui/material';
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
import { GetCalenderDetails, GetCapacityUtilizationData, GetChartDataMachine, GetDownTimeTrends, GetPlannedShift, OeeDetails, OeePlanedProduced } from '../../../Services/NodeJsApiServices';
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

// const Events = [
//     {
//         title: 'Event 1',
//         start: moment().toDate(),
//         end: moment().add(1, 'hours').toDate(),
//     },
//     {
//         title: 'Event 2',
//         start: moment().add(1, 'days').toDate(),
//         // start: '10/25/2023',
//         end: moment().add(1, 'days').add(2, 'hours').toDate(),
//         // end: '10/28/2023',
//     },
//     {
//         title: 'Custom Event',
//         start: customStartDate.toDate(),
//         end: customEndDate.toDate(),
//     },
//     {
//         title: 'Custom Event 1',
//         start: moment(date1).toDate(),
//         end: moment(date2).toDate(),
//     }
// ]

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
    const [pieData, setPieData] = useState([]);
    

    //  const [pieData, setPieData] = useState([]);

    const { machineId, currentDate, machineProdLoader, companyDetails, machineCardData } = props;
    const [modalVisible, setModalVisible] = useState(false)
    const [value, setValue] = useState(0);
    const [plantOeeData, setPlantOeeData] = useState('');
    const [downTimeTrendsData, setDownTimeTrendsData] = useState([]);
    const [capacityUtilizationData, setCapacityUtilizationData] = useState([]);
    const [calenderData, setCalenderData] = useState([])
    const [totalUptime, setTotalUptime] = useState(0);
    const [totalIdletime, setTotalIdletime] = useState(0);
    const [totalDowntime, setTotalTotalDowntime] = useState(0);
     const [selectedDate, setSelectedDate] = useState('');
    const [selectShift, setSelectShift] = useState('')
    const [plannedShiftData, setPlannedShiftData] = useState([])


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


            GetChartDataMachine(
                        {
                            machineId: machineId
                        }, handleChartDataMachineSuccess, handleChartDataMachineException
                    )




    }, [machineId, currentDate]);


    const handleDateChange=(value)=>{
       setSelectedDate(value);
        GetPlannedShift(
            {
                date:value,
                machineId: machineId,
            }, handleGetPlannedSuccess, handleGetPlannedException
        )

       
    }
      const handleGetPlannedSuccess = (dataObject) => {
        setPlannedShiftData(dataObject?.data || [])
    }
    const handleGetPlannedException = () => { }


    

    const handleShiftChange=(value)=>{
     setSelectShift(value)
      OeePlanedProduced(
            {
                date:selectedDate,
                shift:value,
                machineId: machineId,
            }, handleShiftSuccess, handleShiftException
        )

       
    }
      const handleShiftSuccess = (dataObject) => {
        // setPlannedShiftData(dataObject?.data || [])
         setOeeProducedData(dataObject?.data)
        // setSelectShift('')
    }
    const handleShiftException = () => { }


        const handleChartDataMachineSuccess = (dataObject) => {
        setPieData(dataObject?.pieData)
    };
    const handleChartDataMachineException = () => {
    };

    // CALENDER HANDLER
    const handleCalenderDetailsSuccess = (dataObject) => {
        setCalenderData(dataObject?.data || [])
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
        setDownTimeTrendsData(dataObject?.data);
        setTotalUptime(dataObject?.totalUptime || 0);
        setTotalIdletime(dataObject?.totalIdleTime || 0)
        setTotalTotalDowntime(dataObject?.totalDownTime || 0);
    }
    const handleDownTimeException = () => { }

    // const totalUptime = downTimeTrendsData.reduce((acc, value) => acc + value.UpTime, 0) / 60;
    // const totalIdletime = downTimeTrendsData.reduce((acc, value) => acc + value.IdleTime, 0) / 60;
    // const totalDowntime = downTimeTrendsData.reduce((acc, value) => acc + value.DownTime, 0) / 60;

    const handleFilterButtonClick = (period) => {
        GetDownTimeTrends(
            {
                machineId: machineId,
                period: period
            }, handleDownTimeTrendsSuccess, handleDownTimeException
        )
    }
    const buttons = [
        <Button key="today" onClick={() => handleFilterButtonClick('today')} style={{ color: '#000000', fontWeight: 'bold' }}>Today</Button>,
        <Button key="week" onClick={() => handleFilterButtonClick('week')} style={{ color: '#000000', fontWeight: 'bold' }}>Week</Button>,
        <Button key="month" onClick={() => handleFilterButtonClick('month')} style={{ color: '#000000', fontWeight: 'bold' }}>Month</Button>,
    ];

    // const CalenderData=[{id:28,Maintype:"Conditions Based Maintenance",fromdate:"2024-06-08",todate:"2024-06-13"}]
    // const CalenderData = [
    //     {
    //         title: 'Event 1',
    //         start: '2024-06-08T00:00:00.000Z',
    //         end: '2024-06-13T00:00:00.000Z'
    //     }
    // ]

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
                                <Typography style={{ width: '100%', textAlign: 'start', color: '#000000', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px' }}>{machineCardData.machine_name.toUpperCase()} - OEE</Typography>
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
                                <Button style={{ backgroundColor: '#000000' }} variant="contained" endIcon={<RemoveRedEyeIcon />} onClick={() => setModalVisible(!modalVisible)}>
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
                                        <Typography style={{ color: '#000000', fontWeight: 'bold' }}>Availability</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#17153B' }}>{machineCardData.availability}%</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={10.7}>
                                    <Grid item>
                                        <Typography style={{ color: '#000000', fontWeight: 'bold' }}>Quality</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#17153B' }}>{machineCardData.quality}%</Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={5}>
                                    <Grid item>
                                        <Typography style={{ color: '#000000', fontWeight: 'bold' }}>Performance</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Typography style={{ fontWeight: 'bold', color: '#17153B' }}>{machineCardData.performance}%</Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item>

                        
                        {/* <Grid container display={'flex'} flexDirection={'row'}  alignItems={'center'} paddingBottom={2} spacing={2}>
                            <Grid item>
                                <Typography style={{ width: '100%', textAlign: 'start', color: '#000000', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px' }}>
                                    Capacity Utilization
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Box
                                  
                                >
                                        <TextField
                                            fullWidth
                                            type="datetime-local"
                                            variant="outlined"
                                            required
                                            value={selectedDate} // should be in 'YYYY-MM-DDTHH:mm' format
                                            size="small"
                                            onChange={(e) => {
                                                handleDateChange(e.target.value);
                                            }}
                                            autoComplete="off"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                            inputProps={{
                                                step: 60, // seconds step: 60 = 1 min, 1 = seconds
                                            }}
                                            style={{
                                                width: '100%',
                                                height: '18px',
                                            }}
                                        />
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box
                                   

                                    sx={{marginLeft:5,height:'20px'}}
                                >

                            <FormControl sx={{  width: 200 }}>
                                <InputLabel id="demo-simple-select-label"> SHIFT</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="SHIFT"
                                    // variant="filled"
                                      size='small'
                                    value={selectShift}
                                    onChange={(e) => 
                                        // setSelectShift(e.target.value)
                                     handleShiftChange(e.target.value)
                                    }
                                >
                                    {plannedShiftData.map((data) => (
                                        <MenuItem key={data.id} value={data?.shift} >{data?.shift}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                                </Box>
                            </Grid>
                        </Grid> */}
                        <Grid container alignItems="center" spacing={2} paddingBottom={2}>
                <Grid item>
                    <Typography
                        sx={{
                            textAlign: 'start',
                            color: '#000',
                            fontFamily: 'Roboto Slab',
                            fontWeight: 'bold',
                            fontSize: '20px',
                        }}
                    >
                        Capacity Utilization
                    </Typography>
                </Grid>

    <Grid item>
        <TextField
            type="datetime-local"
            variant="outlined"
            size="small"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
           InputLabelProps={{
        shrink: true,
    }}
    inputProps={{
        step: 60,
        style: {
            padding: '6px 8px',   // smaller padding
            fontSize: '10px',     // smaller font
        },
    }}
    sx={{
        width: 160,              // custom width
        '& .MuiOutlinedInput-root': {
            height: 30,          // custom height for the entire input box
        },
        ml:5
    }}
        />
    </Grid>

    <Grid item>
        <FormControl size="small" 
        
        // sx={{ width: 120 }}
        sx={{
        width: 120,
        '& .MuiInputBase-root': {
            height: 30,         // custom height
            fontSize: '8px',   // custom font
        },
    }}
        
        >
            <InputLabel id="shift-label">SHIFT</InputLabel>
            <Select
                labelId="shift-label"
                id="shift-select"
                value={selectShift}
                label="SHIFT"
                onChange={(e) => handleShiftChange(e.target.value)}
                size="small"
                sx={{ fontSize: '12px' }}
            >
                {plannedShiftData.map((data) => (
                    <MenuItem key={data.id} value={data.shift}>
                        {data.shift}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
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
                                <Bar dataKey="Actual" fill="#413ea0" />
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
                                    <Tabs
                                        value={value}
                                        onChange={handleChange}
                                        aria-label="basic tabs example"
                                        indicatorColor="primary"
                                        sx={{
                                            '.MuiTabs-indicator': {
                                                backgroundColor: '#dc3545', // Tab line color (e.g., red)
                                            },
                                        }}
                                    >
                                        <Tab label="Performance" {...a11yProps(0)}
                                            sx={{
                                                color: '#000000', // Inactive tab color (e.g., black)
                                                fontWeight: 'bold',
                                                '&.Mui-selected': {
                                                    color: '#dc3545', // Active tab color (e.g., red)
                                                },
                                            }}
                                        />
                                        <Tab label="Downtime Trends" {...a11yProps(1)}
                                            sx={{
                                                color: '#000000', // Inactive tab color (e.g., black)
                                                fontWeight: 'bold',
                                                '&.Mui-selected': {
                                                    color: '#dc3545', // Active tab color (e.g., red)
                                                },
                                            }}
                                        />
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
                                        <ButtonGroup
                                            size="small"
                                            aria-label="large button group"
                                            sx={{
                                                borderColor: '#000000', // Applies to the group container's border
                                                '& .MuiButtonGroup-grouped': {
                                                    borderColor: '#000000', // Applies to the borders of individual buttons within the group
                                                }
                                            }}
                                        >
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
                                    data={pieData}
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
                                        <Bar dataKey="IdleTime" stackId="a" fill="#F4CE14" />
                                        <Bar dataKey="DownTime" stackId="a" fill="#FF0000" />
                                        <Bar dataKey="UpTime" stackId="a" fill="#3ABEF9" />
                                    </BarChart>
                                </ResponsiveContainer>

                                <Grid container justifyContent={'space-between'} spacing={1} style={{ marginTop: '30px' }} >
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '8px', backgroundColor: '#ff3d57' }} >
                                            <Typography style={{ color: '#000000', fontWeight: 'bold', textShadow: '2px 2px 4px #FFFFFF' }}> Downtime : {totalDowntime} </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '8px', backgroundColor: '#ffca00' }} >
                                            <Typography style={{ color: '#000000', fontWeight: 'bold', textShadow: '2px 2px 4px #FFFFFF' }}> Idletime : {totalIdletime} </Typography>
                                        </Paper>
                                    </Grid>
                                    <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                                        <Paper elevation={3} style={{ padding: '8px', backgroundColor: '#3ABEF9' }} >
                                            {/* {parseFloat(totalUptime.toFixed(2))} */}
                                            <Typography style={{ color: '#000000', fontWeight: 'bold', textShadow: '2px 2px 4px #FFFFFF' }}> Uptime : {totalUptime} </Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </CustomTabPanel>
                        </SwipeableViews>
                    </Item>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Item style={{ height: '480px' }}>
                        <Typography style={{ width: '100%', textAlign: 'start', color: '#000000', fontFamily: 'Roboto Slab', fontWeight: 'bold', fontSize: '20px', marginBottom: '18px' }}>
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
                selectedMachineId={machineId}
                machineName={machineCardData?.machine_name}
            />
        </Box>
    );
}
export default InnerCardBody;
