import React, { useState, useEffect } from "react";
import './IdleTimeAnalysis.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress,  List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Chart } from "react-google-charts";
import { GetOeeMachineList,CapacityMeasureView, GetOperatorList, GetProductionOperatorTableData, GetProductionTableReport, GetProdTypeBasedMachineList, GetmachineWiseEfficiencyGraphReport, GetMachineWiseEfficiencyGraphReport, GetMachineWiseTargetVsProductionReport, GetOverTimeCostImpact, GetIdleTimeAnalysisReport, GetConsolidateIdleTimeReport } from '../../../../Services/NodeJsApiServices'
import { ConsolidateIdleTimeAnalysis, DownloadIdleTimeAnalysis, DownloadProductionImpactAnalysis, DownloadProductionXl } from "../../../../Services/DownloadCsvReportsService";


const IdleTimeAnalysis = () => {
    const [selectedRadio, setSelectedRadio] = useState('');
    const [selectDateFrom, setSelectDateFrom] = useState('')
    const [selectDateTo, setSelectDateTo] = useState('')
    const [idleTimeAnalysis, setIdleTimeAnalysis] = useState([]);

    const [idleTimeConsAnalysis, setIdleTimeConsAnalysis] = useState([]);
    const [loader, setLoader] = useState(false);
    const [capacityMeasureList,setcapacityMeasureList]=useState([]);
    const [idleOrConsIdle, setIdleOrConsIdle] = useState('')

    
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
    

        
            if (idleOrConsIdle === 'idleTime') {

                GetIdleTimeAnalysisReport({
                    startDate: selectDateFrom,
                    endDate: selectDateTo,
                    capacityMeasureType
                }, handleTableReportSuccess, handleTableReportFailure)
               
            } else if (idleOrConsIdle === 'totalIdleTime') {
                GetConsolidateIdleTimeReport({
                    startDate: selectDateFrom,
                    endDate: selectDateTo,
                    capacityMeasureType
                }, handleTableConsolidateReportSuccess, handleTableConsolidateReportFailure)
            }
                
        }

    // MACHINE TABLE DATA SUCCESS
    const handleTableReportSuccess = (dataObject) => {
        setIdleTimeAnalysis(dataObject?.data || []);
        setLoader(false)
    }

    const handleTableReportFailure = () => {
        setLoader(false)
    }

    const handleTableConsolidateReportSuccess = (dataObject) => {
        setIdleTimeConsAnalysis(dataObject?.data || []);
        setLoader(false)
    }

    const handleTableConsolidateReportFailure = () => {
        setLoader(false)
    }




    const DownloadIdleTimeSuccess = () => { };
    const DownloadIdleTimeException = () => { };

    const ConsolidateIdleTimeSuccess = () => { };
    const ConsolidateIdleTimeException = () => { };
      
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


    const transformData = (data) => {
        const rowMap = {}; // group by machine
        const allParams = new Set();
    
        data.forEach(item => {
            allParams.add(item.parameterName);
            if (!rowMap[item.machineName]) {
                rowMap[item.machineName] = {};
            }
            rowMap[item.machineName][item.parameterName] = item.totalHours;
        });
    
        const parameterList = Array.from(allParams); // dynamic column headers
        const tableRows = Object.entries(rowMap).map(([machineName, paramData], index) => {
            return {
                slNo: index + 1,
                machineName,
                parameters: parameterList.map(param => paramData[param] || '0')
            };
        });
    
        return { parameterList, tableRows };
    };
    
    const { parameterList, tableRows } = transformData(idleTimeAnalysis);

      const handleTotalIdleOrConsIdleSelection = (event) => {
            const selectedValue = event.target.value;
            setIdleOrConsIdle(selectedValue);
    
            
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
                                                        value={idleOrConsIdle}
                                                        onChange={handleTotalIdleOrConsIdleSelection}
                                                        sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}
                                                    >
                                                        <FormControlLabel value="totalIdleTime" control={<Radio
                                                            sx={{
                                                                color: '#686D76', // unselected color
                                                                '&.Mui-checked': {
                                                                    color: '#000000', // selected color
                                                                }
                                                            }}
                                                        />} label="TOTAL IDLETIME" />
                                                        <FormControlLabel value="idleTime" control={<Radio
                                                            sx={{
                                                                color: '#686D76', // unselected color
                                                                '&.Mui-checked': {
                                                                    color: '#000000', // selected color
                                                                }
                                                            }}
                                                        />} label="IDLETIME" />
                                                    </RadioGroup>
                                                </FormControl>
                                            </div>
                                        </div>
                    

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
                       
            { loader ?
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                :
            (idleTimeAnalysis && idleTimeAnalysis.length > 0) ||  (idleTimeConsAnalysis && idleTimeConsAnalysis.length > 0)  ? (
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer" style={{ marginBottom: '-25px' }}>
                        <span>Production Status</span>
                    </div>

                    <div className="energy_table_sub_bottomContainer">

                    {idleOrConsIdle === 'idleTime' ?
                      
                        <table id="OeeCustomers">
                        <thead>
                            <tr>
                            <th colSpan={parameterList.length + 3} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                IDLE TIME ANALYSIS - MANUFACTURING
                            </th>
                            </tr>
                            <tr>
                            <th>SL NO</th>
                            <th>Production Cells</th>
                            {parameterList.map((param, idx) => (
                                <th key={idx}>{param}</th>
                            ))}
                            <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, idx) => {
                            const total = row.parameters.reduce((sum, val) => sum + parseFloat(val || 0), 0);
                            return (
                                <tr key={idx}>
                                    <td>{row.slNo}</td>
                                    <td>{row.machineName}</td>
                                    {row.parameters.map((val, i) => (
                                        <td key={i}>{val}</td>
                                    ))}
                                    <td>{total.toFixed(2)}</td>
                                </tr>
                            );
                            })}
                            <tr>
                            <td colSpan={parameterList.length + 3} className="bottomButtonContainer">
                                <Grid container spacing={2} justifyContent="center">
                                <Grid item>
                                    <Button
                                    variant="contained"
                                    onClick={() => {
                                        DownloadIdleTimeAnalysis(
                                        {
                                            startDate: selectDateFrom,
                                            endDate: selectDateTo,
                                            capacityMeasureType,
                                        },
                                        DownloadIdleTimeSuccess,
                                        DownloadIdleTimeException
                                        );
                                    }}
                                    >
                                    Download CSV
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained">Download PDF</Button>
                                </Grid>
                                </Grid>
                            </td>
                            </tr>
                        </tbody>
                        </table>

                    :
                        <table id="OeeCustomers">
                        <thead>
                            <tr>
                            <th colSpan={5} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}>
                                IDLE TIME ANALYSIS
                            </th>
                            </tr>
                            <tr>
                            <th>SL NO</th>
                            <th>Machine Name</th>
                            <th>Available Hours</th>
                            <th>Idle Time (Hr)</th>
                            <th>Idle Time (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {idleTimeConsAnalysis.map((row, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{row.machineName}</td>
                                <td>{row.availableHours}</td>
                                <td>{row.idleTimeHr}</td>
                                <td>{row.idleTimePercent}</td>
                            </tr>
                            ))}
                            <tr>
                            <td colSpan={5} className="bottomButtonContainer">
                                <Grid container spacing={2} justifyContent="center">
                                <Grid item>
                                    <Button
                                    variant="contained"
                                    onClick={() => {
                                        ConsolidateIdleTimeAnalysis(
                                        {
                                            startDate: selectDateFrom,
                                            endDate: selectDateTo,
                                            capacityMeasureType
                                        },
                                        ConsolidateIdleTimeSuccess,
                                        ConsolidateIdleTimeException
                                        );
                                    }}
                                    >
                                    Download CSV
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained">Download PDF</Button>
                                </Grid>
                                </Grid>
                            </td>
                            </tr>
                        </tbody>
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
export default IdleTimeAnalysis;