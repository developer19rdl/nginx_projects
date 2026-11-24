import React, { useState, useEffect } from "react";
import './OverTimeCostImpactReport.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress,  List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Chart } from "react-google-charts";
import { GetOeeMachineList,CapacityMeasureView, GetOperatorList, GetProductionOperatorTableData, GetProductionTableReport, GetProdTypeBasedMachineList, GetmachineWiseEfficiencyGraphReport, GetMachineWiseEfficiencyGraphReport, GetMachineWiseTargetVsProductionReport, GetOverTimeCostImpact } from '../../../../Services/NodeJsApiServices'
import { DownloadProductionImpactAnalysis, DownloadProductionXl } from "../../../../Services/DownloadCsvReportsService";


const OverTimeCostImpactReport = () => {
    const [selectedRadio, setSelectedRadio] = useState('');
    const [selectDateFrom, setSelectDateFrom] = useState('')
    const [selectDateTo, setSelectDateTo] = useState('')
    const [oeeTableReportList, setOeeTableReportList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [capacityMeasureList,setcapacityMeasureList]=useState([]);

    
 const [capacityMeasureType, setCapacityMeasureType] = useState('');
    useEffect(() => {
        CapacityMeasureView(handelcapacityMesure,handelexceptionCapacity)
    }, [])

    const handelcapacityMesure=(dataObject)=>{
        setcapacityMeasureList(dataObject.data)
    }

    const handelexceptionCapacity=()=>{
        
    }
    
    const handleChangeCapacityType =(e) => {
        const selectedCapacityType = e.target.value;
        setCapacityMeasureType(selectedCapacityType);
    }

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
      
        setLoader(true);

        GetOverTimeCostImpact({
                startDate: selectDateFrom,
                endDate: selectDateTo,
                capacityMeasureType
            }, handleTableReportSuccess, handleTableReportFailure)


    }

    // MACHINE TABLE DATA SUCCESS
    const handleTableReportSuccess = (dataObject) => {
        setOeeTableReportList(dataObject?.data[0] || []);
        setLoader(false)
    }

    const handleTableReportFailure = () => {
        setLoader(false)
    }

    const DownloadProductionSuccess = () => { };
    const DownloadProductionException = () => { };
      
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
                {/* <div className="oee_headerContainer">
                    <span>OEE REPORT </span>
                </div> */}
                <div className="oee_bottm_date_containet">

                    <div className="oee_radio_Container">
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
                              
                     
                            <Grid item xs={12} sm={12} md={3} lg={3} xl={3} style={{ display: 'flex', justifyContent: 'center' } }>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">
                                        Production Type
                                    </InputLabel>
                                    <Select
                                        size="small"
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        value={capacityMeasureType}
                                        label="Production Type"
                                        // onBlur={() => { validateForNullValue(deviceCategory, 'deviceCategory')}}
                                        onChange={handleChangeCapacityType}
                                
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        {capacityMeasureList.map((data) => (
                                            <MenuItem key={data.id} value={data.id}>{data.capacityMeasureType}</MenuItem>
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
                                    disabled={!selectDateFrom || !selectDateTo  }
                                    onClick={handleSearchClick}>Search</Button>
                            </div>
                        </Grid>
                    </Grid>

                </div>
                <Grid container spacing={5} paddingLeft={'45px'} paddingRight={'25px'} paddingTop={"25px"} >

                             
                                </Grid>
                         </div>
            
            {loader ?
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                : oeeTableReportList && oeeTableReportList.length > 0  ? (
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer" style={{ marginBottom: '-25px' }}>
                        <span>Production Status</span>
                    </div>

                    <div className="energy_table_sub_bottomContainer">
                      
                         <table id="customers">
                            <tr>
                                {/* <th>SL NO</th> */}
                                <th>All Machines and cell</th>
                                <th>Target/ Capacity/Shift</th>
                                <th>Shift's</th>
                                <th>days</th>
                                <th>Total</th>
                                <th>Hours</th>
                                <th>Planned Productivity</th>
                                <th>Actual  Productivity</th>
                                <th>Prod Variance</th>
                                <th>Productivity</th>
                                {/* <th>Extra  OT Hours</th> */}
                                <th>Operator</th>
                                <th>Helpers  </th>
                                <th>Total Manhours</th>
                                <th>Operator</th>
                                <th>Helper</th>
                                {/* <th>OT Machine Hour Cost</th> */}
                                <th>Total Cost(Based On OT Hours &Manpower)</th>
                                <th> Efficiency Loss(Machine Hour Rate Target Data)</th>
                                <th>Total Cost</th>
                                <th>Machine Utilization</th>
                                <th>Manpower Utilization</th>
                                <th>Total Idle Time</th>
                                 <th>Total DownTime</th>
                                <th>Plan v/s Production</th>
                                <th>OEE</th>
                            </tr>
                       
                                {oeeTableReportList && oeeTableReportList.map((item, key) => (
                                    <tr key={key}>
                                        <td className="tableData" >{item.machineName}</td>
                                        <td className="tableData" >{item.targetPerShift}</td>
                                        <td className="tableData" >{item.totalShifts}</td>
                                        <td className="tableData" >{item.totalDays}</td>
                                        <td className="tableData" >{item.total}</td>
                                        <td className="tableData" >{item.totalHours}</td>
                                        <td className="tableData" >{item.plannedProductivity}</td>
                                        <td className="tableData" >{item.actualProductivity}</td>
                                        <td className="tableData" >{item.prodVariance}</td>
                                        <td className="tableData" >{item.productivity}</td>
                                        {/* <td className="tableData" >{item.extraOtHours}</td> */}
                                        <td className="tableData" >{item.operatorCount}</td>
                                        <td className="tableData" >{item.helperCount}</td>
                                        <td className="tableData" >{item.totalExtraManhours}</td>
                                        <td className="tableData" >{item.operatorCost}</td>
                                        <td className="tableData" >{item.helperCost}</td>
                                        {/* <td className="tableData" >{item.helperCost}</td> */}
                                        <td className="tableData" >{item.totalManpowerCost}</td>
                                        <td className="tableData" >{item.efficiencyLossCost}</td>
                                        <td className="tableData" >{item.totalCost}</td>
                                        <td className="tableData" >{item.MachineUtilization}</td>
                                        <td className="tableData" >{item.ManPowerUtilization}</td>
                                        <td className="tableData" >{item.TotalIdleTime}</td>
                                         <td className="tableData" >{item.TotalDownTime}</td>
                                        <td className="tableData" >{item.PlanVsProduction}</td>
                                        <td className="tableData" >{item.OEE}</td>
                                    </tr>
                                ))}
                                           <tr>
                                               <td
                                                 colSpan={19}
                                                 className="bottomButtonContainer"
                                               >
                                                 <Grid container spacing={2} justifyContent={"center"}>
                                                   <Grid item>
                                                     <Button variant="contained"
                                                       onClick={() => {
                                                        DownloadProductionImpactAnalysis({
                                                           fromDate:selectDateFrom,
                                                           toDate: selectDateTo,
                                                           capacityMeasureType
                                                         },
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
                                </table>
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
export default OverTimeCostImpactReport;