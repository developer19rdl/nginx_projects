import React, { useState } from "react";
import './WeldingWire.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from '@mui/material/Select';
import { AddOpearatorLog, OperatorLogDropDown, WeldingWireConsumption } from "../../../../Services/NodeJsApiServices";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const OperatorLog = () => {
    const [selectFromDate, setSelectFromDate] = useState('');
    const [selectedTodate, setSelectedTodate] = useState('');
    const [weldingData, setWeldingData] = useState([]);

    const [totMeter, setTotMeter] = useState('');
    const [totWireKg, setTotWireKg] = useState('');

    const [loader, setLoader] = useState(false);




    const handleSubmit = (e) => {
        setLoader(true);
        e.preventDefault();
        WeldingWireConsumption({

            fromDate: selectFromDate,
            toDate: selectedTodate,
        }, handleWeldingWireConsumptionSuccess, handleWeldingWireConsumptionException)
    };



    const handleWeldingWireConsumptionSuccess = (dataObject) => {
        setWeldingData(dataObject.data || []);
        setTotMeter(dataObject.dtRangeTotMeter)
        setTotWireKg(dataObject.dtRangeTotWireKg)
        // downloadPDF(data, 'data.pdf', customHeaders);
        setLoader(false);

    };

    const handleDownloadCsv = () => {
        const customHeaders = {
            date: 'Date',
            weldMeter: 'Welding Wire Consumption In Meter',
            kgWireUse: 'Machine Tag',
        };
        downloadCSV(weldingData, 'data.csv', customHeaders);

    }
    // const downloadPDF = (data, filename, customHeaders) => {
    //     const doc = new jsPDF(); // Initialize jsPDF

    //     const tableRows = [];
    //     const headers = Object.values(customHeaders); // Get headers from customHeaders

    //     // Push headers
    //     tableRows.push(headers);

    //     // Push data
    //     data.forEach(row => {
    //         const rowData = Object.values(row);
    //         tableRows.push(rowData);
    //     });

    //     // Set up auto table
    //     doc.autoTable({
    //         head: tableRows.splice(0, 1), // First row is header
    //         body: tableRows,
    //     });

    //     // Save the PDF
    //     doc.save(filename);
    // };



    const downloadCSV = (data, filename, customHeaders) => {
        // Convert JSON data to CSV format
        const csvData = convertToCSV(data, customHeaders);
        // Create a Blob with the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const convertToCSV = (data, customHeaders) => {
        if (data.length === 0) {
            return '';
        }
        // Use custom headers if provided, otherwise extract headers from the first data object
        const headers = customHeaders ? Object.keys(customHeaders) : Object.keys(data[0]);
        const csvRows = [];
        // Add the headers as the first row
        const headerRow = headers.map(header => customHeaders ? customHeaders[header] : header).join(',');
        csvRows.push(headerRow);
        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => {
                const key = header; // Use the original key
                const value = row[key]; // Get the value using the original key
                const escaped = (value !== undefined ? '' + value : '').replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });
        return csvRows.join('\n');
    };

    const handleWeldingWireConsumptionException = () => {
        setLoader(false);
    };


    const handlepdfFileSave = () => {
        let info = []
        weldingData.forEach((element, index, array) => {
            info.push([element.operatorName, element.operatorID, element.machine_tag, element.departmentName, element.login_date, element.login_time, element.logout_time, element.total_Time])
        });
        const doc = new jsPDF();

        // Text to display
        const text = 'Opearator Log Report';
        // Calculate the x-coordinate for centering the text
        const pageWidth = doc.internal.pageSize.getWidth();
        const textWidth = doc.getTextWidth(text);
        const xCoordinate = (pageWidth - textWidth) / 2;
        // Add centered text above the table
        doc.text(text, xCoordinate, 10);
        // Define the second header row
        const secondHeaderRow = [['Operator Name', 'Operator Id	', 'Machine', 'Department', 'Login Date', 'Login Time', 'Logout Time', 'Total']];
        // Combine both header rows into one array
        const headerRows = [/*...firstHeaderRow,*/ ...secondHeaderRow];
        doc.autoTable({
            theme: 'striped',
            head: headerRows,
            body: info,
            headStyles: {
                fillColor: [173, 216, 230], // Header background color
                textColor: [0, 0, 0], // Header text color
                // halign: 'center', // Header text alignment
                // valign: 'middle', // Vertical alignment
                // lineWidth: 0.5, // Border width
                // lineColor: [0, 0, 0], // Border color
            },
        });

        doc.save('sample.pdf');

    };

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
    return (
        <>
            <div className="operator_bottomContainer">
                <div className="operator_headerContainer">
                    <span style={{ fontWeight: 'bold', color: 'black' }}>Welding Wire Consumption</span>
                </div>
                <div className="operator_bottm_date_containet">
                    <Grid container spacing={5} paddingLeft={'10px'} paddingRight={'10px'}>
                        <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label=" From Date"
                                type="date"
                                variant="outlined"
                                value={selectFromDate}
                                onChange={(e) => setSelectFromDate(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} style={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                id="outlined-basic"
                                label=" To Date"
                                type="date"
                                variant="outlined"
                                value={selectedTodate}
                                onChange={(e) => setSelectedTodate(e.target.value)}
                                InputLabelProps={
                                    {
                                        shrink: true
                                    }
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={1.4} lg={1.4} xl={1.4} display={'flex'} alignItems={'center'} >
                            <div className="operator_button_container" >
                                <Button variant="contained" size="small"

                                disabled ={!selectFromDate || !selectedTodate }
                                    sx={{
                                        backgroundColor: 'black',

                                    }}
                                    onClick={handleSubmit} >Search</Button>
                            </div>
                        </Grid>
                    </Grid>
                </div>
            </div>
            {loader ?
                <Box sx={{ width: '100%' }}>
                    <LinearProgress />
                </Box>
                :
                weldingData && weldingData.length > 0 &&
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer">
                        <span> Welding Wire Consumption Report</span>
                    </div>
                    <div className="energy_table_sub_bottomContainer">
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <ResponsiveContainer width={730} height={250}>
                                <LineChart width={730} height={250} data={weldingData}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line strokeWidth={3} dot={false} type="monotone" dataKey="weldMeter" stroke="#8884d8" />
                                    <Line strokeWidth={3} dot={false} type="monotone" dataKey="kgWireUse" stroke="#82ca9d" />
                                    <Line strokeWidth={3} dot={false} type="monotone" dataKey="weldingMeterByKg" stroke="#FF8000" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <table id="customers">
                            <tr>
                                <th>Date</th>
                                <th>Welding Wire Consumption In Meter</th>
                                <th>Wire Consumption in Kg </th>
                                <th>Kg Per Meter For Welding</th>
                                {/* <th>Total</th> */}
                            </tr>
                            {weldingData && weldingData.map((item, key) => (
                                <tr key={key}>
                                    <td className="tableData" >{item.date}</td>
                                    <td className="tableData" >{item.weldMeter}</td>
                                    <td className="tableData" >{item.kgWireUse}</td>
                                    <td className="tableData" >{item.weldingMeterByKg}</td>

                                </tr>
                            ))}
                            <tr >
                                <th className="tableData" ></th>
                                <th className="tableData" >{totMeter}</th>
                                <th className="tableData" >{totWireKg}</th>
                            </tr>

                            <tr>
                                <td colSpan={17} className="bottomButtonContainer">
                                    <Grid container spacing={2} justifyContent={'center'}>
                                        <Grid item>
                                            <Button variant="contained" onClick={handleDownloadCsv} >Download CSV</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button variant="contained" onClick={handlepdfFileSave}>Download PDF</Button>
                                        </Grid>
                                    </Grid>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>}
        </>
    )
}
export default OperatorLog;