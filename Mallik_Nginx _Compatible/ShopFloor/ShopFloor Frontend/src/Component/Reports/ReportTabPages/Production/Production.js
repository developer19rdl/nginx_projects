import React, { useState, useEffect } from "react";
import './Production.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress,  List, ListItem, ListItemText } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { Chart } from "react-google-charts";
import { GetOeeMachineList,CapacityMeasureView, GetOperatorList, GetProductionOperatorTableData, GetProductionTableReport, GetProdTypeBasedMachineList, GetmachineWiseEfficiencyGraphReport, GetMachineWiseEfficiencyGraphReport, GetMachineWiseTargetVsProductionReport } from '../../../../Services/NodeJsApiServices'
import { DownloadProductionXl } from "../../../../Services/DownloadCsvReportsService";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  ComposedChart,
  Bar,
  ResponsiveContainer
} from "recharts";

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

const Production = () => {
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
    const [capacityMeasureList,setcapacityMeasureList]=useState([]);
    const [machineUnitMap, setMachineUnitMap] = useState({});           
    const [machineWiseGraphData, setMachineWiseGraphData] = useState([]);

    
    const [machineTargetProdData, setMachineTargetProdData] = useState([]);

  const [graphMaxValue, setGraphMaxValue] = useState(0);
  const [graphProdTargetMaxValue, setGraphProdTargetMaxValue] = useState(0);
    const [month, setMonth] = useState('');
    
 const [capacityMeasureType, setCapacityMeasureType] = useState('');
    useEffect(() => {
        CapacityMeasureView(handelcapacityMesure,handelexceptionCapacity)
    }, [])

    const handelcapacityMesure=(dataObject)=>{
        setcapacityMeasureList(dataObject.data)
    }

    const handelexceptionCapacity=()=>{
        
    }
    

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

    const handleChangeCapacityType =(e) => {
        const selectedCapacityType = e.target.value;
        setCapacityMeasureType(selectedCapacityType);
        GetProdTypeBasedMachineList( {prodType:selectedCapacityType},handleGetMachineSuccess, handleGetMachineFailed);
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
        setLoader(true)
        if (operatorOrMachine === 'machine') {
            GetProductionTableReport({
                startDate: selectDateFrom,
                endDate: selectDateTo,
                machineId: selectedMachineId === 'all' ? "" : selectedMachineId,
                capacityMeasureType : capacityMeasureType === 'all' ? "" : capacityMeasureType,
                month
            }, handleTableReportSuccess, handleTableReportFailure)

              GetMachineWiseEfficiencyGraphReport(
                {
                    startDate: selectDateFrom,
                    endDate: selectDateTo,
                    machineId:  selectedMachineId === 'all' ? "" : selectedMachineId,
                    capacityMeasureType,
                    month
                },
                handleMachineWiseEfficiencySucess,
                handleMachineWiseEfficiencyException
                )

                GetMachineWiseTargetVsProductionReport(
                {
                    startDate: selectDateFrom,
                    endDate: selectDateTo,
                    machineId:  selectedMachineId === 'all' ? "" : selectedMachineId,
                    capacityMeasureType,
                    month
                },
                handleMachineWiseProdTargetSucess,
                handleMachineWiseProdTargetException
            )
        } else {
            GetProductionOperatorTableData({
                fromDate: selectDateFrom,
                toDate: selectDateTo,
                Operator_Name: selectedOperator
            }, handleOperatorTableDataSucess, handleOperatorTableException)
        }
    }

      const getMonthBounds = (monthValue) => {
        if (!monthValue) {
            return { minDate: '', maxDate: '' };
        }

        // monthValue is 'YYYY-MM'
        const year = parseInt(monthValue.substring(0, 4));
        const month = parseInt(monthValue.substring(5, 7)); // month is 1-indexed (1-12)

        // 1. Calculate the first day of the month (Min Date)
        // We use Date.UTC to create a date object representing the start of the month 
        // at midnight UTC, which prevents timezone issues when formatting.
        const firstDay = new Date(Date.UTC(year, month - 1, 1));
        
        // toISOString() will now correctly return 'YYYY-MM-01T...'
        const minDate = firstDay.toISOString().substring(0, 10); // Format to 'YYYY-MM-DD'

        // 2. Calculate the last day of the month (Max Date)
        // Go to the next month (month) and set the day to 0 in UTC.
        const lastDay = new Date(Date.UTC(year, month, 0));
        
        // toISOString() will now correctly return 'YYYY-MM-30T...' or 'YYYY-MM-31T...'
        const maxDate = lastDay.toISOString().substring(0, 10); // Format to 'YYYY-MM-DD'

        return { minDate, maxDate };
    };

    const { minDate, maxDate } = getMonthBounds(month);

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setMonth(newMonth);

        if (newMonth) {
            // 1. Calculate the bounds for the newly selected month
            const { minDate: newMinDate, maxDate: newMaxDate } = getMonthBounds(newMonth);

            // 2. Automatically set the "From Date" to the 1st of the month
            setSelectedValue(newMinDate); 
            setSelectDateFrom(newMinDate);
            setSelectDateTo(newMaxDate);

            // 3. Automatically set the "To Date" to the last day of the month
            setSelectedDate(newMaxDate); 
        } else {
            // Clear dates if month is cleared
            setSelectedValue('');
            setSelectedDate('');
        }
  };





    //download
    const handleDownloadClick = () =>{

    }

    // MACHINE TABLE DATA SUCCESS
    const handleTableReportSuccess = (dataObject) => {
        setOeeTableReportList(dataObject?.data || []);
          setMachineUnitMap(dataObject.machineUnitMap || {});

        console.log("resons------------drhydrtRashmitha", dataObject?.data || [])
        setLoader(false)
    }
    const handleTableReportFailure = () => {
        setLoader(false)
    }


      const handleMachineWiseEfficiencySucess = (dataObject) => {
        setMachineWiseGraphData(dataObject?.data)
        setGraphMaxValue(dataObject?.maxValue)
      }
      const handleMachineWiseEfficiencyException = () => { }


      const handleMachineWiseProdTargetSucess = (dataObject) => {
        setMachineTargetProdData(dataObject?.data)
        setGraphProdTargetMaxValue(dataObject?.maxValue)
      }
      const handleMachineWiseProdTargetException = () => { }








    // OPERATOR TABLE DATA SUCCESS
    const handleOperatorTableDataSucess = (dataObject) => {
        setOperatorTableData(dataObject?.data || []);
         setLoader(false)
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




    // const allDates = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0].Capacity);

    // let toolTipAllDates = ['Date'];
    // allDates && allDates.length > 0 && allDates.forEach(item => {
    //     for (let i = 1; i <= 4; i++) {
    //         toolTipAllDates.push(item);
    //     }
    // });

    // const allKeys = oeeTableReportList.length > 0 && Object.keys(oeeTableReportList[0]);
    // const allShiftsData = [];

    // allKeys.length > 0 && allKeys.forEach(key => {
    //     const shiftValues = [];
    //     oeeTableReportList.forEach(category => {
    //         Object.values(category[key]).forEach(shifts => {
    //             Object.values(shifts).forEach(shiftValue => {
    //                 shiftValues.push(shiftValue);
    //             });
    //         });
    //     });
    //     allShiftsData.push([key, ...shiftValues]);
    // });

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

  

    const machines = Object.keys(oeeTableReportList.length > 0 && oeeTableReportList[0]);
    const metrics = Array.from(
        new Set(
            machines.flatMap((machine) => Object.keys(oeeTableReportList.length > 0 && oeeTableReportList[0][machine]))
        )
    );
   

    const dates = Array.from(
        new Set(
            machines.flatMap((machine) =>
                metrics.flatMap((metric) =>
                    Object.keys(
                        (oeeTableReportList.length > 0 &&
                            oeeTableReportList[0][machine]?.[metric]) || {}
                    ).filter((key) => !key.toLowerCase().includes("summary"))
                )
            )
        )
    );
    
    
    
    const shifts = Array.from(
        new Set(
            machines.flatMap((machine) =>
                metrics.flatMap((metric) =>
                    dates.flatMap((date) =>
                        Object.keys(oeeTableReportList.length > 0 && oeeTableReportList[0][machine][metric]?.[date] || {})
                    )
                )
            )
        )
    );
console.log("operatorOrMachine",operatorOrMachine);
// const handleDownloadExcel = async () => {
//   if (!oeeTableReportList || oeeTableReportList.length === 0) {
//     alert('No data to export!');
//     return;
//   }

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet('Production Report');

//   // 🔸 Create header row structure dynamically
//   let headerRow1 = ['MACHINE', 'METRICS'];
//   let headerRow2 = ['', ''];

//   dates.forEach(date => {
//     headerRow1.push(...Array(shifts.length).fill(date));
//     shifts.forEach(shift => headerRow2.push(shift));
//   });

//   headerRow1.push('SUMMARY');
//   headerRow2.push('');

//   worksheet.addRow(headerRow1);
//   worksheet.addRow(headerRow2);

//   // 🔸 Merge cells for date headers (1st row)
//   let colIndex = 3;
//   dates.forEach(() => {
//     worksheet.mergeCells(1, colIndex, 1, colIndex + shifts.length - 1);
//     colIndex += shifts.length;
//   });

//   worksheet.mergeCells('A1:A2');
//   worksheet.mergeCells('B1:B2');
//   worksheet.mergeCells(1, colIndex, 2, colIndex); // Merge "SUMMARY"

//   // 🔸 Style header rows
//   [1, 2].forEach(rowNum => {
//     worksheet.getRow(rowNum).eachCell(cell => {
//       cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: 'FF002D68' },
//       };
//       cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' },
//       };
//     });
//   });

//   // 🔸 Add table data rows
//   machines.forEach(machine => {
//     const machineMetrics = Object.keys(oeeTableReportList[0][machine]);

//     machineMetrics.forEach((metric, index) => {
//       const row = [];

//       // First column: Machine name (only once per block)
//       if (index === 0) {
//         row.push(machine);
//       } else {
//         row.push('');
//       }

//       // Second column: Metric or Unit
//       row.push(metric === "Output" ? (machineUnitMap[machine] || "Output") : metric);

//       // Add all date-shift data
//       dates.forEach(date => {
//         shifts.forEach(shift => {
//           const value =
//             oeeTableReportList[0][machine][metric]?.[date]?.[shift] ?? '';
//           row.push(value);
//         });
//       });

//       // Add summary value
//       const summary =
//         Object.entries(oeeTableReportList[0][machine][metric] || {}).find(
//           ([key]) => key.toLowerCase().endsWith("summary")
//         )?.[1] || '';
//       row.push(summary);

//       worksheet.addRow(row);
//     });

//     // Merge machine name cells vertically
//     const startRow = worksheet.lastRow.number - machineMetrics.length + 1;
//     const endRow = worksheet.lastRow.number;
//     worksheet.mergeCells(`A${startRow}:A${endRow}`);
//     worksheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
//   });

//   // 🔸 Add border & center alignment for all cells
//   worksheet.eachRow(row => {
//     row.eachCell(cell => {
//       cell.alignment = { horizontal: 'center', vertical: 'middle' };
//       cell.border = {
//         top: { style: 'thin' },
//         left: { style: 'thin' },
//         bottom: { style: 'thin' },
//         right: { style: 'thin' },
//       };
//     });
//   });

//   // 🔸 Auto-fit columns
//   worksheet.columns.forEach(col => {
//     let maxLength = 10;
//     col.eachCell({ includeEmpty: true }, cell => {
//       const len = cell.value ? cell.value.toString().length : 10;
//       if (len > maxLength) maxLength = len;
//     });
//     col.width = maxLength < 15 ? 15 : maxLength;
//   });

//   // 🔸 Freeze headers
//   worksheet.views = [{ state: 'frozen', ySplit: 2 }];

//   // 🔸 Download
//   const buffer = await workbook.xlsx.writeBuffer();
//   saveAs(new Blob([buffer]), `Production_Report_${new Date().toLocaleDateString()}.xlsx`);
// };
const handleDownloadExcel = async () => {
  if (!oeeTableReportList || oeeTableReportList.length === 0) {
    alert('No data to export!');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Production Report');

  // 🔹 Create header structure
  let headerRow1 = ['MACHINE', 'METRICS'];
  let headerRow2 = ['', ''];

  dates.forEach(date => {
    headerRow1.push(...Array(shifts.length).fill(date));
    shifts.forEach(shift => headerRow2.push(shift));
  });

  headerRow1.push('SUMMARY');
  headerRow2.push('');

  worksheet.addRow(headerRow1);
  worksheet.addRow(headerRow2);

  // 🔹 Merge cells for grouped headers
  let colIndex = 3;
  dates.forEach(() => {
    worksheet.mergeCells(1, colIndex, 1, colIndex + shifts.length - 1);
    colIndex += shifts.length;
  });
  worksheet.mergeCells('A1:A2');
  worksheet.mergeCells('B1:B2');
  worksheet.mergeCells(1, colIndex, 2, colIndex);

  // 🔹 Style header rows
  [1, 2].forEach(rowNum => {
    worksheet.getRow(rowNum).eachCell(cell => {
      cell.font = { bold: true, color: { argb: '1f1f1f' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'aad1e3' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // 🔹 Helper: convert cell value to number if applicable
  const parseNumber = (val) => {
    if (val === null || val === undefined || val === '') return '';
    // Try parsing
    const num = parseFloat(val);
    return !isNaN(num) ? num : val; // if number-like, return as number
  };

  // 🔹 Fill data rows
  machines.forEach(machine => {
    const machineMetrics = Object.keys(oeeTableReportList[0][machine]);

    machineMetrics.forEach((metric, index) => {
      const row = [];

      // Machine name (only once per block)
      row.push(index === 0 ? machine : '');
      // Metric
      row.push(metric === "Output" ? (machineUnitMap[machine] || "Output") : metric);

      // Fill shift data as numbers where possible
      dates.forEach(date => {
        shifts.forEach(shift => {
          const value = oeeTableReportList[0][machine][metric]?.[date]?.[shift] ?? '';
          row.push(parseNumber(value));
        });
      });

      // Add summary (also numeric if possible)
      const summary = Object.entries(oeeTableReportList[0][machine][metric] || {}).find(
        ([key]) => key.toLowerCase().endsWith("summary")
      )?.[1] || '';
      row.push(parseNumber(summary));

      worksheet.addRow(row);
    });

    // Merge machine cells
    const startRow = worksheet.lastRow.number - machineMetrics.length + 1;
    const endRow = worksheet.lastRow.number;
    worksheet.mergeCells(`A${startRow}:A${endRow}`);
    worksheet.getCell(`A${startRow}`).alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // 🔹 Add borders & center alignment
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // 🔹 Auto width columns
  worksheet.columns.forEach(col => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, cell => {
      const len = cell.value ? cell.value.toString().length : 10;
      if (len > maxLength) maxLength = len;
    });
    col.width = Math.min(maxLength + 2, 25);
  });

  // 🔹 Freeze headers
  worksheet.views = [{ state: 'frozen', ySplit: 2 }];

  // 🔹 Download
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `Production_Report_${new Date().toLocaleDateString()}.xlsx`);
};


    return (
        <>
            <div className="oee_bottomContainer">
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
                            {
                                operatorOrMachine === 'machine' ?
                                <>
                                       <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center' } }>
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
                                                    <MenuItem value="all">All</MenuItem>
                                                    {capacityMeasureList.map((data) => (
                                                        <MenuItem key={data.id} value={data.id}>{data.capacityMeasureType}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center' }}>
                                            <FormControl fullWidth>
                                                <InputLabel id="demo-simple-select-label">Machine / Assembly Line</InputLabel>
                                                <Select
                                                    size="small"
                                                    labelId="demo-simple-select-label"
                                                    id="demo-simple-select"
                                                    label="Machine / Assembly Line"
                                                    value={selectedMachineId}
                                                    onChange={(e) => setSelectedMachineId(e.target.value) }

                                                    
                                                >
                                                    <MenuItem value="all">All</MenuItem> {/* 'All' option with empty string value */}
                                                    {machineList && machineList.map((item) => (
                                                        <MenuItem value={item.id} key={item.id}>{item.machine_name}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                         <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center' }}>
                
                                                <TextField
                                                    fullWidth
                                                    size="small"

                                                    label="From Month "
                                                    placeholder='From Month'
                                                    variant="outlined"
                                                    required
                                                    type='month'
                                                    value={month}
                                                    // onChange={(e) => setMonth(e.target.value)}
                                                    onChange={handleMonthChange} 
                                                    InputLabelProps={
                                                    {
                                                        shrink: true
                                                    }
                                                    } 
                                                    />
                                            </Grid>
                                    </>
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


   



                            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center' }}>
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
                                    // inputProps={{
                                    //     max: calculateOneMonthFrom(selectDateTo), // Set max date based on selectDateTo
                                    // }}
                                     inputProps={{
                                        // *** APPLY MONTH MIN/MAX HERE ***
                                        min: minDate,
                                        max: maxDate,
                                        }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center' }}>
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
                                    // inputProps={{
                                    //     min: selectDateFrom, // Set min date based on selectDateFrom
                                    //     max: calculateOneMonthFrom(selectDateFrom), // Set max date based on selectDateFrom
                                    // }}
                                       inputProps={{
                                        // *** COMBINE CONSTRAINTS ***
                                        // Min is the greater of (1) the month's start, or (2) the From Date
                                        min: selectedValue ? selectedValue : minDate,
                                        // Max is the lesser of (1) the month's end, or (2) one month from From Date (if you still need that logic)
                                        // Since the month boundary is stricter, we just use the month's end.
                                        max: maxDate,
                                        }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div className="oee_button_container">
                                    <Button variant="contained" size="small"
                                        sx={{
                                            backgroundColor: 'black',

                                        }}
                                        disabled={!selectDateFrom || !selectDateTo || !operatorOrMachine }
                                        onClick={handleSearchClick}>Search</Button>
                                </div>
                            </Grid>
                    </Grid>

                </div>
                            <Grid container spacing={5} paddingLeft={'45px'} paddingRight={'25px'} paddingTop={"25px"} >

                                {machineWiseGraphData.length > 0  &&
                                  <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                                    <Typography style={{ fontWeight: 'bold', marginBottom: '10px' }}>MACHINE WISE EFFICIENCY</Typography>
                                    <ResponsiveContainer width={"100%"} height={320}>
                                        <BarChart data={machineWiseGraphData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="machineName" />
                                        <YAxis domain={[0, graphMaxValue]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="avgEfficiency" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                  </Grid>
                                }

                              
                                    {machineTargetProdData.length > 0 && (
                                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                        <Typography style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                                        PLAN VS PRODUCTION
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={320}>
                                        <ComposedChart data={machineTargetProdData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="machineName" />
                                            <YAxis domain={[0, Math.max(...machineTargetProdData.map(d => d.maxValue))]} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="production" fill="#8884d8" name="Production" />
                                            <Line type="monotone" dataKey="target" stroke="#FF5733" strokeWidth={2} name="Target" />
                                              {/* <Line type="monotone" dataKey="avgConsum" stroke="#ff7300" /> */}
                                        </ComposedChart>
                                        </ResponsiveContainer>
                                    </Grid>
                                    )}
                             </Grid>
                         </div>
            {/* {!loader && oeeTableReportList && oeeTableReportList.length > 0 && ( */}
            {loader ?
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                : oeeTableReportList && oeeTableReportList.length > 0 || operatorTableData && operatorTableData.length > 0 ? (




                    
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer" style={{ marginBottom: '-25px' }}>
                        <span>Production Status</span>
                    </div>

                    <div className="energy_table_sub_bottomContainer">
                        {operatorOrMachine === 'machine' ?
                            
                            <table border="1" style={{ borderCollapse: "collapse", width: "100%" }}  id="OeeCustomers">
                                <thead>
                                    <tr>
                                        <th rowSpan="2">MACHINE</th>
                                        <th rowSpan="2">Metrics</th>
                                        {dates.map((date) => (
                                            <th colSpan={shifts.length} key={date}>{date}</th>
                                        ))}
                                          <th rowSpan="2">SUMMARY</th>
                                    </tr>
                                    <tr>
                                        {dates.map((date) =>
                                            shifts.map((shift) => <th key={date + shift}>{shift}</th>)
                                        )}
                                    </tr>
                                </thead>
                      <tbody>
                    {machines.map((machine) => {
                        const machineMetrics = Object.keys(oeeTableReportList[0][machine]);
                    return (
                        <React.Fragment key={machine}>
                            {machineMetrics.map((metric, index) => (
                            <tr key={machine + metric}>
                                {index === 0 && (
                                <td rowSpan={machineMetrics.length} style={{ whiteSpace: 'nowrap' }}>
                                    {machine}
                                </td>
                                )}
                                <td>
                                {metric === "Output"
                                    ? (machineUnitMap[machine] || "Output")
                                    : metric}
                                </td>
                                {dates.map((date) =>
                                shifts.map((shift) => (
                                    <td key={machine + metric + date + shift}>
                                    {oeeTableReportList[0][machine][metric]?.[date]?.[shift] || 0}
                                    </td>
                                ))
                                )}
                                <td>
                                {
                                    Object.entries(oeeTableReportList[0][machine][metric] || {}).find(
                                    ([key]) => key.toLowerCase().endsWith("summary")
                                    )?.[1] || 0
                                }
                                </td>
                            </tr>
                            ))}
                        </React.Fragment>
                        );
                    })}
                    </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={Object.keys(oeeTableReportList[0]).length * 4 + 1} className="bottomButtonContainer">
                                            <Grid container spacing={2} justifyContent={'center'}>
                                                <Grid item>
                                                    <Button variant="contained"
                                                        onClick={handleDownloadExcel}
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
                                    {/* <th>MRP Id</th> */}
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
                                        {/* <td className="tableData" >{item.MRP}</td> */}
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
export default Production;