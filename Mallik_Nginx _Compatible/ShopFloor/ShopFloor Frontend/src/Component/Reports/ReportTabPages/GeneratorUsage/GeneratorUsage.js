import React, { useState } from "react";
import './GeneratorUsage.css'
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { FetchGeneratorOnLogs, GetGeneratorUsageReport } from "../../../../Services/NodeJsApiServices";
import PowerFailureLogs from "./PowerFailureLogs";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import GeneratorSettings from "./GeneratorSettings";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const GeneratorUsage = () => {
    const [selectedValue, setSelectedValue] = useState('date');
    const [selectedDate, setSelectedDate] = useState(null);
    const [age, setAge] = React.useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [generatorReportList, setGeneratorReportList] = useState([]);
    const [generatorOnReportList, setGeneratorOnReportList] = useState([]);
    const [loader, setLoader] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleSelectChange = (event) => {
        setAge(event.target.value);
    };

    const handleSubmit = () => {
        setLoader(true)
        GetGeneratorUsageReport({
            fromDate: fromDate,
            toDate: toDate
        }, handleReportSuccess, handleReportException)


        FetchGeneratorOnLogs({            
            fromDate: fromDate,
            toDate: toDate
        }, handleReportOnLogsSuccess, handleReportOnLogsException)
    }

    const handleReportSuccess = (dataObject) => {
        setLoader(false)
        setGeneratorReportList(dataObject?.report || [])
    }
    const handleReportException = () => {
        setLoader(false)
    }

     const handleReportOnLogsSuccess = (dataObject) => {
        // setLoader(false)
        setGeneratorOnReportList(dataObject?.data || [])
    }
    const handleReportOnLogsException = () => {
        // setLoader(false)
    }

     const handleSettingsClick = () => {
   setOpenSettingsDialog(true);
    // You can later open a dialog or drawer here for settings
  };

  /*
const handleDownloadExcel = async () => {
  if (!generatorReportList || generatorReportList.length === 0) {
    alert("No data to export!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Generator Usage Report");

  // Define header columns
  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Open Bal[Ltr]", key: "openBalLtr", width: 18 },
    { header: "Consumption[Ltr]", key: "consumptionLtr", width: 20 },
    { header: "Top-up[Ltr]", key: "topupLtr", width: 15 },
    { header: "Clos Bal[Ltr]", key: "closeBalLtr", width: 18 },
    { header: "Open TIME", key: "openTime", width: 18 },
    { header: "Close TIME", key: "closeTime", width: 18 },
    { header: "Running Mins", key: "runningMins", width: 18 },
    { header: "Opening bal kWh", key: "openBalKwh", width: 20 },
    { header: "closing bal kWh", key: "closeBalKwh", width: 20 },
    { header: "Total generated[kwh/Day]", key: "totalGeneratedKwhDay", width: 28 },
  ];

  // Add rows
  generatorReportList.forEach((item) => {
    worksheet.addRow({
      date: item.date,
      openBalLtr: item.openBalLtr,
      consumptionLtr: item.consumptionLtr,
      topupLtr: item.topupLtr,
      closeBalLtr: item.closeBalLtr,
      openTime: item.openTime,
      closeTime: item.closeTime,
      runningMins: item.runningMins,
      openBalKwh: item.openBalKwh,
      closeBalKwh: item.closeBalKwh,
      totalGeneratedKwhDay: item.totalGeneratedKwhDay,
    });
  });

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
  fgColor: { argb: "FFF3FAFA" }, // rgb(243,250,250)
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // Add border to all cells
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  });

  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `Generator_Usage_Report_${fromDate}_to_${toDate}.xlsx`);
};*/

const handleDownloadExcel = async () => {
  if (!generatorReportList || generatorReportList.length === 0) {
    alert("No data to export!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Generator Usage Report");

  // ✅ Strictly 11 columns (A–K)
  worksheet.columns = [
    { header: "Date", key: "date", width: 15 },
    { header: "Open Bal[Ltr]", key: "openBalLtr", width: 18 },
    { header: "Consumption[Ltr]", key: "consumptionLtr", width: 20 },
    { header: "Top-up[Ltr]", key: "topupLtr", width: 15 },
    { header: "Clos Bal[Ltr]", key: "closeBalLtr", width: 18 },
    { header: "Open TIME", key: "openTime", width: 18 },
    { header: "Close TIME", key: "closeTime", width: 18 },
    { header: "Running Mins", key: "runningMins", width: 18 },
    { header: "Opening bal kWh", key: "openBalKwh", width: 20 },
    { header: "closing bal kWh", key: "closeBalKwh", width: 20 },
    { header: "Total generated[kwh/Day]", key: "totalGeneratedKwhDay", width: 28 },
  ];

  // ✅ Add only these keys
  generatorReportList.forEach((item) => {
    worksheet.addRow({
      date: item.date,
      openBalLtr: item.openBalLtr,
      consumptionLtr: item.consumptionLtr,
      topupLtr: item.topupLtr,
      closeBalLtr: item.closeBalLtr,
      openTime: item.openTime,
      closeTime: item.closeTime,
      runningMins: item.runningMins,
      openBalKwh: item.openBalKwh,
      closeBalKwh: item.closeBalKwh,
      totalGeneratedKwhDay: item.totalGeneratedKwhDay,
    });
  });

  // ✅ Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "1f1f1f" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "aad1e3" }, // rgba(156, 126, 126, 1)
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };

  // ✅ Apply borders + alignment
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        left: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
        right: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  });

  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `Generator_Usage_Report_${fromDate}_to_${toDate}.xlsx`);
};



    return (
        <>
            <div className="generator_bottomContainer">
                <div className="generator_headerContainer">
                    <span style={{ color: '#000000', fontWeight: 'bold' }}>GENERATOR USAGE REPORT</span>
                </div>

                <Grid container alignItems={'center'} spacing={2} padding={2} columnGap={5} >
                    <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5}>
                        <TextField
                            id="outlined-basic"
                            label="From Date"
                            variant="outlined"
                            size="small"
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={
                                {
                                    shrink: true
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5}>
                        <TextField
                            id="outlined-basic"
                            label="To Date"
                            variant="outlined"
                            size="small"
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={
                                {
                                    shrink: true
                                }
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
                        <Button 
                        disabled ={!fromDate || !toDate }
                       
                        sx={{
                            backgroundColor: 'black', 
                          }}
                        
                        
                        variant="contained"
                          onClick={handleSubmit}>
                            Submit</Button>
                    </Grid>
                   
                </Grid>
        

            
               
                {loader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <div>
                    <table id="customers">
                        <tr>
                            <th>Date</th>
                            <th>Open Bal[Ltr]</th>
                            <th>Consumption[Ltr]</th>
                            <th>Top-up[Ltr]</th>
                            <th>Clos Bal[Ltr]</th>
                            <th>Open TIME</th>
                            <th>Close TIME</th>
                            <th>Running Mins</th>
                            <th>Opening bal kWh</th>
                            <th>closing bal kWh</th>
                            <th>Total generated[kwh/Day]</th>
                        </tr>
                        {generatorReportList.length > 0 ?
                            generatorReportList.map((item, key) => (
                                <tr key={key}>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.date}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.openBalLtr}</td>
                                    {/* <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.suction}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.return}</td> */}
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.consumptionLtr}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.topupLtr}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.closeBalLtr}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.openTime}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.closeTime}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.runningMins}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.openBalKwh}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.closeBalKwh}</td>
                                    <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} >{item.totalGeneratedKwhDay}</td>
                                </tr>
                            ))
                            :
                            <tr>
                                <td style={{ fontWeight: 'bold', textAlign: 'center', color: '#000000' }} colSpan={9} >No data found</td>
                            </tr>
                        }
                        {generatorReportList.length > 0 &&
                            <tr>
                                <td colSpan={11} className="bottomButtonContainer">
                                    <Grid container spacing={2} justifyContent={'center'}>
                                        <Grid item>
                                            <Button variant="contained"   
                                            onClick={handleDownloadExcel}
                                            >Download CSV</Button>
                                        </Grid>
                                    </Grid>
                                </td>
                            </tr>
                        }
                    </table>
                 
                </div>
                </div>
        </>
    )
}
export default GeneratorUsage;