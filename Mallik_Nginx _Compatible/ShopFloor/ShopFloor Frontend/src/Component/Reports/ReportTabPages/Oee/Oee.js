import React, { useState, useEffect } from "react";
import './Oee.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress, Tooltip, List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Chart } from "react-google-charts";
import { GetOeeDowntimePieReport, GetOeeFactorPieReport, GetOeeMachineList, GetOeeTableReport } from '../../../../Services/NodeJsApiServices'

export const data = [
    ["Task", "Hours per Day"],
    ["Utilization", 36.3],
    ["Performance", 27.4],
    ["Quality", 36.3],
];

export const data1 = [
    ["Task", "Hours per Day"],
    ["Tool setting time", 61.5],
    ["Non availability of Compressed air", 22.9],
    ["Non availability of programming", 13.8],
    ["Non availability of Fork lift operator", 1.8],
];

export const options = {
    title: "OEE",
    is3D: true,
    pieSliceText: "labelAndValue",
};

export const options1 = {
    title: "MAJOR DOWNTIME(in minutes) CONTRIBUTORS",
    is3D: true,
    pieSliceText: "labelAndValue",
};

const Oee = () => {
    const [selectedValue, setSelectedValue] = useState('date');
    const [selectedRadio, setSelectedRadio] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectDateFrom, setSelectDateFrom] = useState('')
    const [selectDateTo, setSelectDateTo] = useState('')
    const [age, setAge] = React.useState('');
    const [machineList, setMachineList] = useState([])
    const [selectedMachine, setSelectedMachine] = useState('');
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [oeeTableReportList, setOeeTableReportList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [tableVisible, setTableVisible] = useState(false);
    const [oeeFatorPie, setOeeFactorPie] = useState([]);
    const [oeeMajorDowntimePie, setOeeMajorDowntimePie] = useState([]);

    useEffect(() => {
        GetOeeMachineList(handleGetMachineSuccess, handleGetMachineFailed)
    }, [])

    const handleGetMachineSuccess = (dataObject) => {
        setMachineList(dataObject?.data || []);

    }
    const handleGetMachineFailed = (errorObject, errorMessage) => {

    }

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleRadioChange = (event) => {
        setSelectedRadio(event.target.value);

        let fromDate = new Date();
        let toDate = new Date();

        switch (event.target.value) {
            case 'Today':
                fromDate = new Date();
                toDate = new Date();
                break;
            case 'Yesterday':
                fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 1);
                toDate = new Date(fromDate);
                break;
            case 'This week':
                fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - fromDate.getDay());
                toDate = new Date();
                break;
            case 'Last week':
                fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - fromDate.getDay() - 7);
                toDate = new Date(fromDate);
                toDate.setDate(toDate.getDate() + 6);
                break;
            case 'This month':
                fromDate = new Date();
                fromDate.setDate(1);
                toDate = new Date();
                break;
            case 'Last month':
                fromDate = new Date();
                fromDate.setMonth(fromDate.getMonth() - 1);
                fromDate.setDate(1);
                toDate = new Date(fromDate);
                toDate.setMonth(toDate.getMonth() + 1);
                toDate.setDate(0); // Last day of the previous month
                break;
            default:
                fromDate = null;
                toDate = null; // For 'Custom' or other cases where a specific date isn't predefined
        }

        setSelectDateFrom(fromDate ? fromDate.toISOString().split('T')[0] : '');
        setSelectDateTo(toDate ? toDate.toISOString().split('T')[0] : '');
    };

    const handleSearchClick = () => {
        setTableVisible(false)
        setLoader(true)
        // GetOeeTableReport({
        //     startDate: selectDateFrom,
        //     endDate: selectDateTo,
        //     machineId: selectedMachineId
        // }, handleTableReportSuccess, handleTableReportFailure)

        // PIE CHART API
        GetOeeFactorPieReport({
            fromDate: selectDateFrom,
            toDate: selectDateTo,
            machineId: selectedMachineId
        }, handleOeeFactorPieReportSuccess, handleOeeFactorPieReportFailure)
        GetOeeDowntimePieReport({
            fromDate: selectDateFrom,
            toDate: selectDateTo,
            machineId: selectedMachineId
        }, handleOeeDowntimeSuccess, handleOeeDowntimeFailure)
    }

    //PIE DOWNTIME
    const handleOeeDowntimeSuccess = (dataObject) => {
        setLoader(false)
        console.log(dataObject.data)
        const transformedData = dataObject?.data.map((item, index) => [`${item.downtimeReasons} : ${item.downTimeDuration}`, parseFloat(item.downTimeDuration)]);
        const data = [
            ["Dwontime Reason", "Duration"], // Header row
            ...transformedData // Spread the transformed data
        ];
        setOeeMajorDowntimePie(data);
    }
    const handleOeeDowntimeFailure = () => { }

    // FACTOR PIE HANDLER
    const handleOeeFactorPieReportSuccess = (dataObject) => {
        console.log("dataObjectdataObject", dataObject)
        setLoader(false)
        // const machineData = dataObject?.data[0];
        const data = [
            ["Task", "Hours per Day"],
            [`Utilization ${dataObject?.data.availability}`, parseFloat(dataObject?.data.availability)],
            [`Performance ${dataObject?.data.performance}`, parseFloat(dataObject?.data.performance)],
            [`Quality ${dataObject?.data.quality}`, parseFloat(dataObject?.data.quality)],
        ];
        setOeeFactorPie(data);
    }
    const handleOeeFactorPieReportFailure = () => { }

    // OEE SEARCH HANDLER
    const handleTableReportSuccess = (dataObject) => {
        setOeeTableReportList(dataObject?.data || []);
        setLoader(false)
    }
    const handleTableReportFailure = () => {
        setLoader(false)
    }

    // EXTRACT ALL THE DATES
    const allDates = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].utilizationFactor["Major Maintanance"]);

    // REPEATE THE DATES 4 TIMES
    let toolTipAllDates = [];
    allDates && allDates.length > 0 && allDates.map(item => {
        for (let i = 1; i <= 4; i++) {
            toolTipAllDates.push(item);
        }
    })
    toolTipAllDates.unshift('Date');

    // UTILIZATION FACTOR CODE - DONT TOUCH THIS CODE
    const allKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].utilizationFactor);
    const allShiftsData = [];

    allKeys.length > 0 && allKeys.forEach(key => {
        // Skip "TotalUtilizationPerDay"
        if (key !== "TotalUtilizationPerDay") {
            const shiftValues = [];
            const category = oeeTableReportList.length > 0 && oeeTableReportList[0].utilizationFactor[key];
            Object.values(category).forEach(shifts => {
                Object.values(shifts).forEach(shiftValue => {
                    shiftValues.push(shiftValue);
                });
            });
            allShiftsData.push([key, ...shiftValues]);
        }
    });
    // ENDS HERE

    // PERFORMANCE FACTOR CODE - DONT TOUCH THIS CODE
    const PerformanceKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].performanceFactor);
    const PerformanceFactorData = [];

    PerformanceKeys.length > 0 && PerformanceKeys.forEach(key => {
        // Skip "TotalPerformancePerDay"
        if (key !== "TotalPerformancePerDay") {
            const shiftValues = [];
            const category = oeeTableReportList.length > 0 && oeeTableReportList[0].performanceFactor[key];
            Object.values(category).forEach(shifts => {
                Object.values(shifts).forEach(shiftValue => {
                    shiftValues.push(shiftValue);
                });
            });
            PerformanceFactorData.push([key, ...shiftValues]);
        }
    });
    // ENDS HERE

    // QUALITYPERFORMANCE FACTOR CODE - DONT TOUCH THIS CODE
    const QualityPerformanceKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].qualityPerformanceFactor);
    const QualityPerformanceFactorData = [];

    QualityPerformanceKeys.length > 0 && QualityPerformanceKeys.forEach(key => {
        // Skip "TotalQualityPerDay"
        if (key !== "TotalQualityPerDay") {
            const shiftValues = [];
            const category = oeeTableReportList.length > 0 && oeeTableReportList[0].qualityPerformanceFactor[key];
            Object.values(category).forEach(shifts => {
                Object.values(shifts).forEach(shiftValue => {
                    shiftValues.push(shiftValue);
                });
            });
            QualityPerformanceFactorData.push([key, ...shiftValues]);
        }
    });
    // ENDS HERE

    // OEE FACTOR CODE - DONT TOUCH THIS CODE
    const OeeFactorKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].oeeFactor);
    const OeeFactorData = [];

    OeeFactorKeys.length > 0 && OeeFactorKeys.forEach(key => {
        // Skip "TotalOeePerDay"
        if (key !== "TotalOeePerDay") {
            const shiftValues = [];
            const category = oeeTableReportList.length > 0 && oeeTableReportList[0].oeeFactor[key];
            Object.values(category).forEach(shifts => {
                Object.values(shifts).forEach(shiftValue => {
                    shiftValues.push(shiftValue);
                });
            });
            OeeFactorData.push([key, ...shiftValues]);
        }
    });
    // ENDS HERE

    /////Min And Max date  Calculate function///////////
    const calculateOneMonthFrom = (date) => {
        const selectedDate = new Date(date);
        const oneMonthFromSelectedDate = new Date(selectedDate);
        oneMonthFromSelectedDate.setMonth(oneMonthFromSelectedDate.getMonth() + 1);
        const year = oneMonthFromSelectedDate.getFullYear();
        const month = String(oneMonthFromSelectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(oneMonthFromSelectedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <>
            <div className="oee_bottomContainer">
                <div className="oee_bottm_date_containet">
                    < div className="oee_radio_Container">
                        <RadioGroup
                            aria-label="options"
                            name="options"
                            value={selectedRadio}
                            onChange={handleRadioChange}
                            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
                        >
                            <FormControlLabel
                                value="Today"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="Today"
                            />
                            <FormControlLabel
                                value="Yesterday"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="Yesterday"
                            />
                            <FormControlLabel
                                value="This week"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="This week"
                            />
                            <FormControlLabel
                                value="Last week"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="Last week"
                            />
                            <FormControlLabel
                                value="This month"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="This month"
                            />
                            <FormControlLabel
                                value="Last month"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="Last month"
                            />
                            <FormControlLabel
                                value="Custom"
                                control={<Radio
                                    sx={{
                                        color: '#686D76', // unselected color
                                        '&.Mui-checked': {
                                            color: '#000000', // selected color
                                        }
                                    }}
                                />}
                                label="Custom"
                            />
                        </RadioGroup>
                    </div>

                    <Grid container spacing={5} paddingLeft={'45px'} paddingRight={'25px'} paddingTop={"25px"} >
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Machine / Assembly Line</InputLabel>
                                <Select
                                    size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Machine / Assembly Line"
                                    value={selectedMachineId}
                                    onChange={(e) => setSelectedMachineId(e.target.value)}
                                >
                                    {machineList && machineList.map((item) => (
                                        <MenuItem value={item.id} key={item.id}>{item.machine_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label="Date From"
                                type="date"
                                variant="outlined"
                                value={selectDateFrom}
                                onChange={(e) => setSelectDateFrom(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                                inputProps={{
                                    max: calculateOneMonthFrom(selectDateTo), // Set max date based on selectDateTo
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label="Date To"
                                type="date"
                                variant="outlined"
                                value={selectDateTo}
                                onChange={(e) => setSelectDateTo(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                                inputProps={{
                                    min: selectDateFrom, // Set min date based on selectDateFrom
                                    max: calculateOneMonthFrom(selectDateFrom), // Set max date based on selectDateFrom
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div className="oee_button_container">
                                <Button variant="contained" size="small"
                                    sx={{
                                        backgroundColor: 'black',

                                    }}
                                    disabled={!selectDateFrom || !selectDateTo || !selectedMachineId}

                                    // disabled
                                    onClick={handleSearchClick}>Search</Button>
                            </div>
                        </Grid>

                        {/* -----------------------------------------------------------------------PIE CHART-------------------------------------------------------------------------------------- */}
                        {/* <Grid container spacing={2} alignItems={'center'} style={{ marginTop: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: '10px' }}>
                            <Grid item xs={6}>
                                <Chart
                                    chartType="PieChart"
                                    data={data}
                                    options={options}
                                    width={"100%"}
                                    height={"400px"}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Chart
                                    chartType="PieChart"
                                    data={data1}
                                    options={options1}
                                    width={"100%"}
                                    height={"400px"}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Button variant="contained">VIEW OEE REPORT</Button>
                            </Grid>
                        </Grid> */}
                        {oeeFatorPie && oeeFatorPie.length > 0 &&
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                                <Chart
                                    chartType="PieChart"
                                    data={oeeFatorPie}
                                    options={options}
                                    width={"100%"}
                                    height={"400px"}
                                />
                            </Grid>
                        }
                        {oeeMajorDowntimePie && oeeMajorDowntimePie.length > 0 &&
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                                <Chart
                                    chartType="PieChart"
                                    data={oeeMajorDowntimePie}
                                    options={options1}
                                    width={"100%"}
                                    height={"400px"}
                                />
                            </Grid>
                        }
                        {oeeFatorPie.length > 0 && oeeMajorDowntimePie.length > 0 &&
                            <Grid item xs={12} sm={12} md={12} lg={12} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Button variant="contained"
                                    onClick={() => {
                                        setTableVisible(!tableVisible)
                                        !tableVisible && setLoader(true);
                                        !tableVisible && GetOeeTableReport({
                                            startDate: selectDateFrom,
                                            endDate: selectDateTo,
                                            machineId: selectedMachineId
                                        }, handleTableReportSuccess, handleTableReportFailure)
                                    }}
                                >{tableVisible ? 'HIDE OEE REPORT' : 'VIEW OEE REPORT'}</Button>
                            </Grid>
                        }
                        {/* -----------------------------------------------------------------------PIE CHART-------------------------------------------------------------------------------------- */}

                    </Grid>


                </div>
            </div >
            {loader ?
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                :
                oeeTableReportList && oeeTableReportList.length > 0 && tableVisible &&
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer">
                        <span>Downtime Report []</span>
                    </div>

                    <div className="energy_table_sub_bottomContainer">

                        <table id="OeeCustomers">
                            <tr>
                                <th style={{ borderColor: '#000000' }}>Date</th>
                                {allDates && allDates.map((item, key) => (
                                    <th colSpan={4} key={key} style={{ borderColor: '#000000' }}>{item}</th>))}
                                <th rowSpan={1} style={{ borderColor: '#000000' }}></th>
                            </tr>

                            <tr>
                                <th style={{ borderColor: '#000000' }}></th>
                                {allDates && allDates.map((item, key) => (
                                    <>
                                        <th style={{ borderColor: '#000000' }}>1st</th>
                                        <th style={{ borderColor: '#000000' }}>2nd</th>
                                        <th style={{ borderColor: '#000000' }}>3rd</th>
                                        <th style={{ borderColor: '#000000' }}>4th</th>
                                    </>
                                ))}
                                <th style={{ borderColor: '#000000' }}>Total</th>
                            </tr>

                            {/* UTILIZATION FACTOR TABLE DATA */}
                            <tr>
                                <th style={{ borderColor: '#000000' }}>Utilization Factor</th>
                                <th colSpan={allDates.length * 4} style={{ borderColor: '#000000' }}></th>
                                <th style={{ borderColor: '#000000' }}></th>
                            </tr>

                            {allShiftsData && allShiftsData.map((item, key) => (
                                <tr key={key}>
                                    {item.map((value, index) => (
                                        <Tooltip
                                            placement="top"
                                            arrow
                                            followCursor
                                            title={
                                                index === 0 ? null :
                                                    <List>
                                                        <ListItem>
                                                            <ListItemText primary={item[0]} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={value} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={toolTipAllDates[index]} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                    </List>
                                            }
                                        >
                                            <td key={index}>{value}</td>
                                        </Tooltip>
                                    ))}
                                </tr>
                            ))}

                            <tr style={{ backgroundColor: 'limegreen', borderColor: '#000000' }}>
                                <td style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>Total U% per day</td>
                                {oeeTableReportList.length > 0 && oeeTableReportList[0].utilizationFactor.TotalUtilizationPerDay.map((item) => (
                                    <td colSpan={4} style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>{item}</td>
                                ))}
                            </tr>

                            {/* PERFORMANCE FACTOR */}
                            <tr>
                                <th style={{ borderColor: '#000000' }}>Performance Factor</th>
                                <th colSpan={allDates.length * 4} style={{ borderColor: '#000000' }}></th>
                                <th style={{ borderColor: '#000000' }}></th>
                            </tr>

                            {PerformanceFactorData && PerformanceFactorData.map((item, key) => (
                                <tr key={key}>
                                    {item.map((value, index) => (
                                        <Tooltip
                                            placement="top"
                                            followCursor
                                            arrow
                                            title={
                                                index === 0 ? null :
                                                    <List>
                                                        <ListItem>
                                                            <ListItemText primary={item[0]} style={{ textAlign: 'center', fontSize: 100 }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={value} style={{ textAlign: 'center', fontSize: 100 }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={toolTipAllDates[index]} style={{ textAlign: 'center', fontSize: 100 }} />
                                                        </ListItem>
                                                    </List>
                                            }
                                        >
                                            <td key={index}>{value}</td>
                                        </Tooltip>
                                    ))}
                                </tr>
                            ))}

                            <tr style={{ backgroundColor: 'limegreen' }}>
                                <td style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>Total Performance Per Day</td>
                                {oeeTableReportList.length > 0 && oeeTableReportList[0].performanceFactor.TotalPerformancePerDay.map((item) => (
                                    <td colSpan={4} style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>{item}</td>
                                ))}
                            </tr>

                            {/* QualityPerformanceFactorData */}
                            <tr>
                                <th style={{ borderColor: '#000000' }}> Quality Performance Factor</th>
                                <th colSpan={allDates.length * 4} style={{ borderColor: '#000000' }}></th>
                                <th style={{ borderColor: '#000000' }}></th>
                            </tr>

                            {QualityPerformanceFactorData && QualityPerformanceFactorData.map((item, key) => (
                                <tr key={key}>
                                    {item.map((value, index) => (
                                        <Tooltip
                                            placement="top"
                                            followCursor
                                            arrow
                                            title={
                                                index === 0 ? null :
                                                    <List>
                                                        <ListItem>
                                                            <ListItemText primary={item[0]} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={value} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={toolTipAllDates[index]} style={{ textAlign: 'center' }} />
                                                        </ListItem>
                                                    </List>
                                            }
                                        >
                                            <td key={index}>{value}</td>
                                        </Tooltip>
                                    ))}
                                </tr>
                            ))}

                            <tr style={{ backgroundColor: 'limegreen' }}>
                                <td style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>Total Quality Per Day</td>
                                {oeeTableReportList.length > 0 && oeeTableReportList[0].qualityPerformanceFactor.TotalQualityPerDay.map((item) => (
                                    <td colSpan={4} style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>{item}</td>
                                ))}
                            </tr>

                            {/* Oee FactorData */}
                            <tr>
                                <th style={{ borderColor: '#000000' }}> OEE FACTOR</th>
                                <th colSpan={allDates.length * 4} style={{ borderColor: '#000000' }}></th>
                                <th style={{ borderColor: '#000000' }}></th>
                            </tr>

                            {OeeFactorData && OeeFactorData.map((item, key) => (
                                <tr key={key}>
                                    {item.map((value, index) => (
                                        <Tooltip
                                            placement="top"
                                            followCursor
                                            arrow
                                            title={
                                                index === 0 ? null :
                                                    <List>
                                                        <ListItem>
                                                            <ListItemText primary={item[0]} style={{ textAlign: 'center', fontSize: '1px' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={value} style={{ textAlign: 'center', fontSize: '1px' }} />
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListItemText primary={toolTipAllDates[index]} style={{ textAlign: 'center', fontSize: '1px' }} />
                                                        </ListItem>
                                                    </List>
                                            }
                                        >
                                            <td key={index}>{value}</td>
                                        </Tooltip>
                                    ))}
                                </tr>
                            ))}

                            {/* ENDS HERE */}

                            <tr style={{ backgroundColor: 'limegreen' }}>
                                <td style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>Total OEE Per Day</td>
                                {oeeTableReportList.length > 0 && oeeTableReportList[0].oeeFactor.TotalOeePerDay.map((item) => (
                                    <td colSpan={4} style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>{item}</td>
                                ))}
                            </tr>

                            <tr>
                                <td colSpan={allDates.length * 4 + 1} className="bottomButtonContainer" style={{ borderColor: '#000000' }}>
                                    <Grid container spacing={2} justifyContent={'center'}>
                                        <Grid item>
                                            <Button variant="contained">Download CSV</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button variant="contained">Download PDF</Button>
                                        </Grid>
                                    </Grid>
                                </td>
                            </tr>
                        </table>

                    </div>
                </div>
            }
        </>
    )
}
export default Oee;