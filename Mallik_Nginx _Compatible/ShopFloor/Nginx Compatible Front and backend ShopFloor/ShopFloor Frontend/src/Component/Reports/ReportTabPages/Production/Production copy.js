import React, { useState, useEffect } from "react";
import './Production.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress, Tooltip, List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Chart } from "react-google-charts";
import { GetOeeMachineList, GetOperatorList, GetProductionOperatorTableData, GetProductionTableReport } from '../../../../Services/NodeJsApiServices'
import { DownloadProductionXl } from "../../../../Services/DownloadCsvReportsService";

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
    title: "OEE PARAMETER CONTRIBUTION",
    is3D: true,
};

export const options1 = {
    title: "MAJOR DOWNTIME(in minutes) CONTRIBUTORS",
    is3D: true,
};

const ProductionCopy = () => {
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
    const [operatorOrMachine, setOperatorOrMachine] = useState('')
    const [operatorList, setOperatorList] = useState([]);
    const [selectedOperator, setSelectedOperator] = useState('');
    const [operatorTableData, setOperatorTableData] = useState([]);

    // useEffect(() => {
    //     GetOeeMachineList(handleGetMachineSuccess, handleGetMachineFailed);
    //     GetOperatorList({ filterType: "operator" }, handleGetOperatorSuccess, handleGetOperatorFailed);
    // }, [])

    // MACHINE LIST
    const handleGetMachineSuccess = (dataObject) => {
        setMachineList(dataObject?.data || []);
    }
    const handleGetMachineFailed = (errorObject, errorMessage) => { }

    // OPERATOR LIST
    const handleGetOperatorSuccess = (dataObject) => {
        setOperatorList(dataObject?.data || []);
    }
    const handleGetOperatorFailed = () => { }

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
        setLoader(true)
        if (operatorOrMachine === 'machine') {
            GetProductionTableReport({
                startDate: selectDateFrom,
                endDate: selectDateTo,
                machineId: selectedMachineId
            }, handleTableReportSuccess, handleTableReportFailure)
        } else {
            GetProductionOperatorTableData({
                fromDate: selectDateFrom,
                toDate: selectDateTo,
                Operator_Name: selectedOperator
            }, handleOperatorTableDataSucess, handleOperatorTableException)
        }
    }

    // MACHINE TABLE DATA SUCCESS
    const handleTableReportSuccess = (dataObject) => {
        setOeeTableReportList(dataObject?.data || []);

        console.log("resons------------drhydrtRashmitha", dataObject?.data || [])
        setLoader(false)
    }
    const handleTableReportFailure = () => {
        setLoader(false)
    }

    // OPERATOR TABLE DATA SUCCESS
    const handleOperatorTableDataSucess = (dataObject) => {
        setOperatorTableData(dataObject?.data || []);
    }
    const handleOperatorTableException = () => { }

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




    const allDates = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].Capacity);

    let toolTipAllDates = ['Date'];
    allDates && allDates.length > 0 && allDates.forEach(item => {
        for (let i = 1; i <= 4; i++) {
            toolTipAllDates.push(item);
        }
    });

    const allKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0]);
    const allShiftsData = [];

    allKeys.length > 0 && allKeys.forEach(key => {
        const shiftValues = [];
        oeeTableReportList.forEach(category => {
            Object.values(category[key]).forEach(shifts => {
                Object.values(shifts).forEach(shiftValue => {
                    shiftValues.push(shiftValue);
                });
            });
        });
        allShiftsData.push([key, ...shiftValues]);
    });

    ////Download CSV

    const DownloadProductionSuccess = () => { };
    const DownloadProductionException = () => { };

    const handleMachineOperatorSelection = (event) => {
        const selectedValue = event.target.value;
        setOperatorOrMachine(selectedValue);
    
        if (selectedValue === 'machine') {
            GetOeeMachineList(handleGetMachineSuccess, handleGetMachineFailed);
        } else if (selectedValue === 'operator') {
            GetOperatorList({ filterType: "operator" }, handleGetOperatorSuccess, handleGetOperatorFailed);
        }
    };
    

    return (
        <>
            <div className="oee_bottomContainer">
                {/* <div className="oee_headerContainer">
                    <span>OEE REPORT </span>
                </div> */}
                <div className="oee_bottm_date_containet">

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ paddingLeft: '20px', paddingRight: '7px', border: '1px solid gray', borderRadius: '5px', backgroundColor: '#EEEEEE' }}>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={operatorOrMachine}
                                onChange={handleMachineOperatorSelection}
                                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
                            >
                                <FormControlLabel value="machine" control={<Radio 
                                sx={{
                                    color: '#686D76', // unselected color
                                    '&.Mui-checked': {
                                        color: '#000000', // selected color
                                    }
                                }}
                                />} label="Machine" />
                                <FormControlLabel value="operator" control={<Radio 
                                sx={{
                                    color: '#686D76', // unselected color
                                    '&.Mui-checked': {
                                        color: '#000000', // selected color
                                    }
                                }}
                                />} label="Operator" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </div>


                    < div className="oee_radio_Container">
                        <RadioGroup
                            aria-label="options"
                            // size="small"
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
                        {
                            operatorOrMachine === 'machine' ?
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
                                :
                                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="demo-simple-select-label">Operator</InputLabel>
                                        <Select
                                            size="small"
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            label="Operator"
                                            value={selectedOperator}
                                            onChange={(e) => setSelectedOperator(e.target.value)}
                                        >
                                            {operatorList && operatorList.map((item) => (
                                                <MenuItem value={item.fieldName} key={item.Id}>{item.fieldName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                        }
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
                                onClick={handleSearchClick}>Search</Button>
                            </div>
                        </Grid>
                    </Grid>


                </div>
            </div >

            {/* {!loader && oeeTableReportList && oeeTableReportList.length > 0 && ( */}
            {!loader && oeeTableReportList && oeeTableReportList.length > 0 || operatorTableData && operatorTableData.length > 0 ? (
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer" style={{marginBottom:'-25px'}}>
                        <span>Production Status</span>
                    </div>

                    <div className="energy_table_sub_bottomContainer">
                        {operatorOrMachine === 'machine' ?
                            <table id="OeeCustomers">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        {Object.keys(oeeTableReportList[0].Capacity).map(date => (
                                            <th key={date} colSpan={4}>{date}</th>
                                        ))}
                                        <th>Total</th>
                                    </tr>
                                    <tr>
                                        <th></th>
                                        {Object.keys(oeeTableReportList[0].Capacity).map(date => (
                                            <>
                                                <th>Shift 1</th>
                                                <th>Shift 2</th>
                                                <th>Shift 3</th>
                                                <th>Shift 4</th>
                                            </>
                                        ))}
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allShiftsData && allShiftsData.map((item, key) => (
                                        <tr key={key}>
                                            {item.map((value, index) => (
                                                <Tooltip
                                                    key={index}
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
                                                    <td>{value}</td>
                                                </Tooltip>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* <tr style={{ backgroundColor: 'limegreen', borderColor: '#000000' }}>
                    {allDates.map(date => (
                        <td key={date} colSpan={4} style={{ color: '#ffffff', fontWeight: 'bold', borderColor: '#000000' }}>
                            {Object.values(oeeTableReportList[0].Capacity[date]).reduce((acc, val) => acc + val, 0)}
                        </td>
                    ))}
                    <td></td>
                </tr> */}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={Object.keys(oeeTableReportList[0].Capacity).length * 4 + 1} className="bottomButtonContainer">
                                            <Grid container spacing={2} justifyContent={'center'}>
                                                <Grid item>
                                                    <Button variant="contained"
                                                        onClick={() => {
                                                            DownloadProductionXl({ startdate: selectDateFrom, enddate: selectDateTo, machineid: selectedMachineId },
                                                                DownloadProductionSuccess,
                                                                DownloadProductionException
                                                            );
                                                        }}
                                                    >Download CSV</Button>
                                                </Grid>
                                                <Grid item>
                                                    <Button variant="contained">Download PDF</Button>
                                                </Grid>
                                            </Grid>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                            :
                            <table id="customers">
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>MRP Id</th>
                                    <th>Job Card No</th>
                                    <th>Part No</th>
                                    <th>Quantity</th>
                                    <th>Rejected Qty</th>
                                    <th>Shift</th>
                                    <th>Machine Name</th>
                                    <th>Count</th>
                                </tr>

                                {operatorTableData && operatorTableData.map((item, key) => (
                                    <tr key={key}>
                                        <td className="tableData" >{item.date}</td>
                                        <td className="tableData" >{item.time}</td>
                                        <td className="tableData" >{item.MRP}</td>
                                        <td className="tableData" >{item.Jobcard_Number}</td>
                                        <td className="tableData" >{item.Part_Number}</td>
                                        <td className="tableData" >{item.Qty}</td>
                                        <td className="tableData" >{item.rejected_qty}</td>
                                        <td className="tableData" >{item.Shift}</td>
                                        <td className="tableData" >{item.Machine_Name}</td>
                                        <td className="tableData" >{item.count}</td>
                                    </tr>
                                ))}

                                <tr>
                                    <td colSpan={17} className="bottomButtonContainer">
                                        <Grid container spacing={2} justifyContent={'center'}>
                                            <Grid item>
                                                <Button variant="contained" /*onClick={handleDownloadCsv}*/ >Download CSV</Button>
                                            </Grid>
                                            <Grid item>
                                                <Button variant="contained" /*onClick={handlepdfFileSave}*/>Download PDF</Button>
                                            </Grid>
                                        </Grid>
                                    </td>
                                </tr>
                            </table>
                        }
                    </div>
                </div>
            )
                :
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '30px' }}>
                    <Typography>No Data Found</Typography>
                </div>
            }


        </>
    )
}
export default ProductionCopy;