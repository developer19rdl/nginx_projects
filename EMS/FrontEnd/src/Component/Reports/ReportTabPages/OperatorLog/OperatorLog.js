import React, { useState } from "react";
import './OperatorLog.css';
import { FormControl, FormControlLabel, Radio, RadioGroup, Typography, Button, Grid, TextField, LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Select from '@mui/material/Select';
import { AddOpearatorLog, OperatorLogDropDown } from "../../../../Services/NodeJsApiServices";

const OperatorLog = () => {
    const [selectedValue, setSelectedValue] = useState('');
    const [selectFromDate, setSelectFromDate] = useState('');
    const [selectedTodate, setSelectedTodate] = useState('');
    const [machineOperator, SetMachineOperator] = useState('');
    const [machineoperatList, SetMachineOperatList] = useState([]);
    const [operatorData, setOperatorData] = useState([]);
    const [loader, setLoader] = useState(false);

    const handleChange = (event) => {
        setSelectedValue(event.target.value);
        OperatorLogDropDown({
            filterType: event.target.value
        }, handleDropDownSuccess, handleDropDownException);
        setOperatorData([]);
        setSelectFromDate('');
        setSelectedTodate('');
        SetMachineOperatList([]);
    };
    const handleDropDownSuccess = (dataObject) => {
        SetMachineOperatList(dataObject.data)
    };

    const handleDropDownException = () => {

    };

    const handleSubmit = (e) => {
        setLoader(true);
        e.preventDefault();
        AddOpearatorLog({
            filterType: selectedValue,
            [selectedValue === "operator" ? "operatorId" : "id"]: machineOperator,
            fromDate: selectFromDate,
            toDate: selectedTodate,
        }, handleaddOperatorSuccess, handleaddOperatorException)
    };



    const handleaddOperatorSuccess = (dataObject) => {
        setOperatorData(dataObject.data || []);
        // downloadPDF(data, 'data.pdf', customHeaders);
        setLoader(false);

    };

    const handleDownloadCsv = () => {
        const customHeaders = {
            operatorID: 'Operator ID',
            operatorName: 'Operator Name',
            machine_tag: 'Machine Tag',
            login_date: 'Login Date',
            login_time: 'Login Time',
            logout_time: 'Logout Time',
            departmentName: 'Department Name',
            department_id: 'Department ID',
            machineId: 'Machine ID',
            total_Time: 'Total Time'
        };
        downloadCSV(operatorData, 'data.csv', customHeaders);

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

    const handleaddOperatorException = () => {
        setLoader(false);
    };


    const handlepdfFileSave = () => {
        let info = []
        operatorData.forEach((element, index, array) => {
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

    return (
        <>
            <div className="operator_bottomContainer">
                <div className="operator_headerContainer">
                    <span>{selectedValue === "operator" ? "OPERATOR" : "MACHINE"} LOG REPORT</span>
                </div>
                <div className="operator_bottm_date_containet">

                    {/* <div className="operator_from_date_Container">
                    <div className="operator_from_date_header">
                        <span>Date From:</span>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={selectedDate || ''}
                            onChange={handleDateChange}
                            className="operator_datePicker"
                        />
                    </div>
                </div>
                <div className="operator_to_date_Container">
                    <div className="operator_from_date_header">
                        <span>Date To:</span>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={selectedDate || ''}
                            onChange={handleDateChange}
                            className="operator_datePicker"
                        />
                    </div>
                </div>
                <div className="operator_to_date_Container">
                    <div className="operator_from_date_header">
                        <span>Select {selectedValue === "Operator" ? "Operator" : "Machine"}:</span>
                    </div>
                    <div>
                        <Box sx={{ minWidth: 180 }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Select {selectedValue === "Operator" ? "Operator" : "Machine"}</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={age}
                                    label="Age"
                                    onChange={handleSelectChange}
                                >
                                    <MenuItem value={10}>Ten</MenuItem>
                                    <MenuItem value={20}>Twenty</MenuItem>
                                    <MenuItem value={30}>Thirty</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </div>
                </div>
                <div className="operator_button_container">
                    <Button variant="contained">Search</Button>
                </div>
 */}
                    <Grid container spacing={5} paddingLeft={'10px'} paddingRight={'10px'}>
                        <Grid item xs={12} sm={12} md={3.4} lg={3.4} xl={3.4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <RadioGroup
                                    aria-label="options"
                                    name="options"
                                    value={selectedValue}
                                    onChange={handleChange}
                                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                >
                                    <FormControlLabel
                                        value="operator"
                                        control={<Radio />}
                                        label="Operator"
                                    />
                                    <FormControlLabel
                                        value="machine"
                                        control={<Radio />}
                                        label="Machine"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
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

                        <Grid item xs={12} sm={12} md={2.4} lg={2.4} xl={2.4} style={{ display: 'flex', alignItems: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label"> {selectedValue === "operator" ? "Operator" : "Machine"}</InputLabel>
                                <Select
                                    size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label={selectedValue === "operator" ? "Operator" : "Machine"}
                                    value={machineOperator}
                                    onChange={(e) => SetMachineOperator(e.target.value)}
                                >
                                    {machineoperatList && machineoperatList.map((item) => (
                                        selectedValue === "operator" ?
                                            <MenuItem value={item.operatorId} key={item.Id}>{item.fieldName}</MenuItem>
                                            :
                                            <MenuItem value={item.Id} key={item.Id}>{item.fieldName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={1.4} lg={1.4} xl={1.4} display={'flex'} alignItems={'center'} >
                            <div className="operator_button_container" >
                                <Button variant="contained" size="small" onClick={handleSubmit} >Search</Button>
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
                operatorData && operatorData.length > 0 &&
                <div className="energy_table_bottomContainer">
                    <div className="energy_headerContainer">
                        <span> {selectedValue === "operator" ? "OPERATOR" : "MACHINE"} Log Report [ ]</span>
                    </div>
                    <div className="energy_table_sub_bottomContainer">
                        <table id="customers">
                            <tr>
                                <th>Operator Name</th>
                                <th>Operator Id</th>
                                <th>Machine</th>
                                <th>Department</th>
                                <th>Login Date</th>
                                <th>Login Time</th>
                                <th>Logout Time</th>
                                <th>Total</th>
                                {selectedValue === 'operator' && <th>Performance</th>}
                                {selectedValue === 'operator' && <th>Quality</th>}
                            </tr>

                            {operatorData && operatorData.map((item, key) => (
                                <tr key={key}>
                                    <td className="tableData" >{item.operatorName}</td>
                                    <td className="tableData" >{item.operatorID}</td>
                                    <td className="tableData" >{item.machine_tag}</td>
                                    <td className="tableData" >{item.departmentName}</td>
                                    <td className="tableData" >{item.login_date}</td>
                                    <td className="tableData" >{item.login_time}</td>
                                    <td className="tableData" >{item.logout_time}</td>
                                    <td className="tableData" >{item.total_Time}</td>
                                    {selectedValue === 'operator' && <td className="tableData">{item.performance}</td>}
                                    {selectedValue === 'operator' && <td className="tableData">{item.quality}</td>}
                                </tr>
                            ))}

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