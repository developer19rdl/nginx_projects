import React, { useState, useEffect } from "react";
import './Alerts.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress } from '@mui/material';
import { GetAlertReport, showAlertMachineDropDown } from "../../../../Services/NodeJsApiServices";
import { DataGrid } from "@mui/x-data-grid";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const Alerts = () => {
   
        const [fromDate, setFromDate] = useState('');
        const [toDate, setToDate] = useState('');
        const [loader, setLoader] = useState(false);
        const [alertData, setAlertData] = useState([]);  
        const [machineList,setMachineList]=  useState([]);
        const [machineID,setMachineID]=  useState('');

        const handleMachineDropDownSuccess = (data) => {    
            console.log("Machine DropDown Data", data);
            setMachineList(data.data);  
        }   

        const handleMachineDropDownException = (data) => {    
            console.log("Machine DropDown Error", data);
        }       


        useEffect(() => {
            showAlertMachineDropDown(handleMachineDropDownSuccess, handleMachineDropDownException)  
           
        }, []);     
            const handleSubmit = () => {
                setLoader(true)
                GetAlertReport({
                    machineId: machineID,

                    fromDate: fromDate,
                    toDate: toDate
                }, handleReportSuccess, handleReportException)
        
        
           
            }

            const handleReportSuccess = (data) => {
                setLoader(false)
                setAlertData(data.data);    
                console.log("Alert Report Data", data);
            }   
            const handleReportException = (data) => {
                setLoader(false)
                console.log("Alert Report Error", data);
            }   

            const columns = [
                // { field: 'id', headerName: 'ID', width: 70 },   
                {field : 'formattedDateTime', headerName: 'DateTime', width: 180 },
                { field: 'machine_name', headerName: 'Asset Name', width: 100 },
                { field: 'machine_tag', headerName: 'Asset Id', width: 100 },
                { field: 'tagName', headerName: 'Sensor Parameter', width: 150 },
                { field: 'value', headerName: 'Value', width: 100 },
                { field: 'warningMin', headerName: 'Warning Min', width: 100 },
                { field: 'warningMax', headerName: 'Warning Max', width: 100 },
                { field: 'outOfRangeMin', headerName: 'Out Of Range Min', width: 100 },
                { field: 'outOfRangeMax', headerName: 'Out Of Range Max', width: 100 },
                { field: 'criticalMin', headerName: 'Critical Min', width: 100 },
                { field: 'criticalMax', headerName: 'Critical Max', width: 100 },
                { field: 'latchTypeDescription', headerName: 'Alert Type', width: 100 },
                { field: 'alertMessage', headerName: 'Alert Message', width: 200 },     
                // { field: 'alertDate', headerName: 'Alert Date', width: 200 },
            ];  

           const handleDownloadExcel = async () => {
                if (!alertData.length) return;

                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet("Alert Report");

                // ✅ Define headers (same as your screen)
                const headers = [
                    "DateTime",
                    "Asset Name",
                    "Asset Id",
                    "Sensor Parameter",
                    "Value",
                    "Warning Min",
                    "Warning Max",
                    "Out Of Range Min",
                    "Out Of Range Max",
                    "Critical Min",
                    "Critical Max",
                    "Alert Type",
                    "Alert Message"
                ];

                // Add header row
                worksheet.addRow(headers);

                // ✅ Add data rows
                alertData.forEach((item) => {
                    worksheet.addRow([
                        item.formattedDateTime || "",
                        item.machine_name || "",
                        item.machine_tag || "",
                        item.tagName || "",
                        item.value || "",
                        item.warningMin || "",
                        item.warningMax || "",
                        item.outOfRangeMin || "",
                        item.outOfRangeMax || "",
                        item.criticalMin || "",
                        item.criticalMax || "",
                        item.latchTypeDescription || "",
                        item.alertMessage || "",
                    ]);
                });

                // ✅ Style header row
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
                headerRow.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF000000" }, // black background
                };
                headerRow.alignment = { horizontal: "center", vertical: "middle" };

                // ✅ Auto-fit column width
                worksheet.columns.forEach((col) => {
                    let maxLength = 0;
                    col.eachCell({ includeEmpty: true }, (cell) => {
                        const cellValue = cell.value ? cell.value.toString() : "";
                        maxLength = Math.max(maxLength, cellValue.length);
                    });
                    col.width = maxLength < 15 ? 15 : maxLength;
                });

                // ✅ Add borders to all cells
                worksheet.eachRow((row) => {
                    row.eachCell((cell) => {
                        cell.border = {
                            top: { style: "thin" },
                            left: { style: "thin" },
                            bottom: { style: "thin" },
                            right: { style: "thin" },
                        };
                    });
                });

                // ✅ Save file
                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer]), `Alert_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            };
   

         return (
          <>
                  <div className="generator_bottomContainer">
                      <div className="generator_headerContainer">
                          <span style={{ color: '#000000', fontWeight: 'bold' }}>ALERTS REPORT</span>
                      </div>
      
                      <Grid container alignItems={'center'} spacing={2} padding={2} columnGap={5} >

                         <Grid item xs={12} sm={12} md={1.5} lg={1.5} xl={1.5}>
                            <FormControl fullWidth>
                                <TextField
                                    id="outlined-select-currency-native"
                                    select
                                    // label="Machine"
                                value={machineID}
                                onChange={(e) => {
                                    setMachineID(e.target.value);
                            }}  
                                    SelectProps={{
                                        native: true,
                                    }}
                                >
                                    <option value={''}>--Select Machine--</option>
                                    {machineList && machineList.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.machineName}
                                        </option>
                                    ))}
                                </TextField>
                            </FormControl>          
                              
                          </Grid>




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
                         {alertData.length > 0 &&
                           <Grid item xs={12} sm={12} md={2} lg={2} xl={2}>
                                <Button 
                                    sx={{
                                        backgroundColor: 'grey', 
                                        }}  
                                    variant="contained" 
                                    onClick={() => {
                                        // Export to CSV functionality
                                        handleDownloadExcel();
                                    
                                }}>
                                  DOWNLOAD CSV</Button>
                          </Grid>  
}
                      </Grid>
                             <Grid container alignItems={'center'} spacing={2} padding={2} columnGap={5} >
                                {loader && <LinearProgress />}
                                 <DataGrid  
                                    autoHeight
                                    rows={alertData}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5, 10, 20]}
                                    disableSelectionOnClick
                                    getRowId={(row) => row.id}
                                />                  
                             </Grid>
             </div>

  
        </>
    )
}
export default Alerts;