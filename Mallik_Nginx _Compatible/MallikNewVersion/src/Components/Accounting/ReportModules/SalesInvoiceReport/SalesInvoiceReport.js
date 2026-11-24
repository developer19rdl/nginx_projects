import React, { useState, useEffect } from "react";
import { Autocomplete, Box, Button, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, FormLabel, Grid, InputLabel, LinearProgress, MenuItem, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import './SalesInvoiceReport.css';
import { ScrapMstGetMaterial, MachineShowData, ScrapReportAnalysisReport, CustomerDropShowdata, GetSaleInvoiceReport } from "../../../../ApiService/LoginPageService";
import NotificationBar from "../../../GlobleFiles/ServiceNotificationBar";
import { ScrapAnalysisReportDownload } from "../../../../ApiService/DownloadCsvReportsService";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const SalesInvoiceReport = () => {

    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setTodate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [selectedFilterRadio, setSelectedFilterRadio] = useState('Today');
    const [loader, setLoader] = useState(false);
    const [rawMaterial, setRawMaterial] = useState('');
    const [rawMaterialList, setRawMaterialList] = useState([]);
    const [machinList, setMachineList] = useState([]);
    const [machine, setMachine] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [customerSelect, setCustomerSelect] = useState([]);
    const [customerSelectList, setCustomerSelectList] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedToDate, setSelectedToDate] = useState('');

    const handleRadioChange = (event) => {
        setSelectedFilterRadio(event.target.value);

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

        // selectedDate,selectedToDate
        setFromDate(fromDate ? fromDate.toISOString().split('T')[0] : '');
        setTodate(toDate ? toDate.toISOString().split('T')[0] : '');
    };

    useEffect(() => {
        handleRadioChange({ target: { value: 'Today' } });

        const handleResize = () => {
            setScreenHeight(window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        ScrapMstGetMaterial(handleScrapMstGetMaterialSuccess, handleScrapMstGetMaterialException);
        MachineShowData(handleMachineShowDataSuccess, handleMachineShowDataExceprion);
    }, [])

    const handleReportView = () => {
        setLoader(true)
        GetSaleInvoiceReport(
            {
                from: fromDate,
                to: toDate,
                customer: customerSelect
            }, handleGetReportSuccess, handleGetReportException)
    }

    const handleGetReportSuccess = (dataObject) => {
        setLoader(false)
        setReportData(dataObject?.data || [])
    }
    const handleGetReportException = () => {
        setLoader(false)
    }



    const handleReportDownload = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        // Header row
        const headers = [
            'INV No', 'INV Date', 'Cust Name', 'GST No', 'INV Issue Date',
            'DC No', 'DC Date', 'Mode Of Desp', 'Vehicle No', 'Cust PONO Date',
            'CESSONTCSPER', 'CESSONTCSAMT', 'Other Amt', 'Transport Amt', 'TCS Per', 'TCS Amt',
            'SURCHGONTCSPER', 'SURCHGONTCSAMT', 'INSAMT', 'CGSTPER', 'Total In Words', 'ASSBL Value',
            'CGST Amt', 'SGST Per', 'AMMCOST', 'SGST Amt', 'IGST Per', 'IGST Amt',
            'UTGST Per', 'UTGST Amt', 'Less Disc Amt', 'Less Other', 'Amt GST Payable', 'INV Qty'
        ];

        const headerRow = worksheet.addRow(headers);

        // Freeze header
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        // Style header (clean look)
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Add data
        reportData.forEach((data) => {
            data.invDtl.forEach((item) => {
                const row = [
                    data.invNo,
                    data.invDate,
                    data.cName,
                    data.gstNo,
                    data.invIssueDate,

                    item.dcNO,
                    item.dcDate,
                    item.modeOfDispatch,
                    item.vechileNO,
                    item.poNo,

                    Number(item.cessOnTcsPer) || 0,
                    Number(item.cessOnTcs) || 0,
                    Number(item.lessOther) || 0,
                    Number(item.transportCharges) || 0,
                    Number(item.tcsPer) || 0,
                    Number(item.tcs) || 0,
                    Number(item.subChargeOnTcsPer) || 0,
                    Number(item.subChargeOnTcs) || 0,
                    Number(item.insurance) || 0,
                    Number(item.CGSTPer) || 0,

                    item.totalInWords,

                    Number(item.taxableValueforGST) || 0,
                    Number(item.CGST) || 0,
                    Number(item.SGSTPer) || 0,
                    Number(item.ammortisationCost) || 0,
                    Number(item.SGST) || 0,
                    Number(item.IGSTPer) || 0,
                    Number(item.IGST) || 0,
                    Number(item.UTGSTPer) || 0,
                    Number(item.UTGST) || 0,
                    Number(item.lessDisc) || 0,
                    Number(item.lessOther) || 0,
                    Number(item.amtOfGstPay) || 0,
                    Number(item.invQty) || 0
                ];

                const addedRow = worksheet.addRow(row);

                // Highlight Grand Total row
                if (data.invNo === 'Grand Total') {
                    addedRow.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'C6EFCE' }
                        };
                        cell.font = { bold: true };
                    });
                }

                // Dark row condition
                if (item.PartNo === '') {
                    addedRow.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '4A4947' }
                        };
                        cell.font = { color: { argb: 'FFFFFF' } };
                    });
                }

                // Alignment (clean)
                addedRow.eachCell((cell) => {
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true
                    };
                });

                // Apply number format (important)
                const numberColumns = [
                    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
                    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34
                ];

                numberColumns.forEach((colIndex) => {
                    addedRow.getCell(colIndex).numFmt = '#,##0.00';
                });
            });
        });

        // Auto column width (nice UX)
        worksheet.columns.forEach((column) => {
            let maxLength = 10;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const length = cell.value ? cell.value.toString().length : 10;
                if (length > maxLength) {
                    maxLength = length;
                }
            });
            column.width = maxLength + 2;
        });

        // Export file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Invoice_Report.xlsx');
    };


    const handleDownloadSuccess = () => {
        setLoader(false)
        setNotification({
            status: true,
            type: 'success',
            message: "Download Success",
        });
    }
    const handleDownloadException = () => {
        setLoader(false)
        setNotification({
            status: true,
            type: 'error',
            message: "Failed to download",
        });
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // MATERIAL
    const handleScrapMstGetMaterialSuccess = (dataObject) => {
        setRawMaterialList(dataObject?.data || []);
    }
    const handleScrapMstGetMaterialException = () => {
    }
    const options2 = rawMaterialList.map(item => ({
        id: item?.id,
        label: item?.material
    }));

    const handleRawMaterialChange = (selectedValue) => {
        setRawMaterial(selectedValue?.label || '');
    };


    //MACHINE
    const handleMachineShowDataSuccess = (dataObject) => {
        setMachineList(dataObject?.data || []);

    }
    const handleMachineShowDataExceprion = () => {
    }

    const options = machinList.map(item => ({
        id: item?.id,
        label: item?.machineName
    }));

    const handleAutocompleteChange = (selectedValue) => {
        setMachine(selectedValue?.id || '');
    };

    //////////////////////////////////////////////////////
    const handleChangeCustomer = (e) => {
        if (e !== null) {
            CustomerDropShowdata(
                { code: e.target.value },
                handleCustomerDropshow,
                handleCustomerDropshowException
            );
        }
    };

    const handleCustomerDropshow = (dataObject) => {
        setCustomerSelectList(dataObject?.data || []);
    };

    const handleCustomerDropshowException = (error, errorMessage) => { };

    // function onCustomerSelectChange(selectedValue, value) {
    //     setCustomerSelect(selectedValue?.id);
    // }

    const handleSearchItemChange = (value) => {
        if (value !== null) {
            const idArray = value.map((item) => item.id)
            setCustomerSelect(idArray)
        }
    }

    // MULTI SELECTION AUTOCOMPLETE
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <div style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                    variant="h5">
                    Sales Invoice Report
                </Typography>
            </div>
            <Card sx={{ minWidth: 275 }}>
                {loader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <CardContent>
                    <Grid container alignItems={'center'} spacing={2}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <FormControl style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40px', borderRadius: '5px' }}>
                                <RadioGroup
                                    aria-label="options"
                                    name="options"
                                    value={selectedFilterRadio}
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
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={2} lg={2}>
                            <FormControl style={{ width: '100%' }}>
                                <Autocomplete
                                    multiple
                                    id="checkboxes-tags-demo"
                                    options={customerSelectList}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.cCode}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox
                                                icon={icon}
                                                checkedIcon={checkedIcon}
                                                style={{ marginRight: 8 }}
                                                checked={selected}
                                            />
                                            {option.cCode}
                                        </li>
                                    )}
                                    size="small"
                                    renderInput={(params) => <TextField {...params} label="Search Customer" onChange={handleChangeCustomer} />}
                                    onChange={(event, value) => handleSearchItemChange(value)}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={8} md={2} lg={2}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                type="date"
                                label="From"
                                variant="outlined"
                                style={{ marginRight: '10px' }}
                                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                                size="small"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8} md={2} lg={2}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                type="date"
                                label="To"
                                variant="outlined"
                                style={{ marginRight: '10px' }}
                                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                                size="small"
                                value={toDate}
                                onChange={(e) => setTodate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={8} md={3} lg={3}>
                            <Button disabled={loader === true} variant="contained" style={{ backgroundColor: '#002D68', marginRight: '15px', marginTop: '2px' }} onClick={handleReportView}>
                                {loader ? (
                                    <CircularProgress size={24} style={{ color: 'white' }} />
                                ) : 'View'}
                            </Button>
                            <Button variant="contained" style={{ backgroundColor: '#002D68', marginTop: '2px' }} onClick={handleReportDownload}>Download</Button>
                        </Grid>

                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            {/* {reportData.length > 0 ? */}
                            <Box sx={{ height: screenHeight - 310, width: '100%', overflow: 'auto' }}>

                                <table border="1" style={{ borderCollapse: "collapse", width: "100%", zoom: '80%' }} id="customers">
                                    <thead>
                                        <tr>
                                            <th style={{ whiteSpace: 'nowrap' }}>INV No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>INV Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Cust Name</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>GST No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>INV Issue Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DC No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DC Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Mode Of Desp</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Vehicle No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Cust PONO Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>CESSONTCSPER</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>CESSONTCSAMT</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Other Amt</th>
                                            {/* <th style={{ whiteSpace: 'nowrap' }}>PANDFAMT</th> */}
                                            <th style={{ whiteSpace: 'nowrap' }}>Tarnsport Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>TCS Per</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>TCS Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SURCHGONTCSPER</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SURCHGONTCSAMT</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>INSAMT</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>CGSTPER</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>TOtal In Words</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>ASSBL Value</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>CGST Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SGST Per</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>AMMCOST</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>SGST Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>IGST Per</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>IGST Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>UTGST Per</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>UTGST Amt</th>
                                            {/* <th style={{ whiteSpace: 'nowrap' }}>Less Disc Per</th> */}
                                            <th style={{ whiteSpace: 'nowrap' }}>Less Disc Amt</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Less Other</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Amt GST Payable</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>INV Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData && reportData.map((data, Key) => (
                                            data.invDtl.map((item, index) => (
                                                <tr sty
                                                    key={`${Key}-${index}`}
                                                    style={data.invNo === 'Grand Total' ? { backgroundColor: 'lightgreen' } : {}}
                                                >



                                                    {
                                                        index === 0 &&
                                                        <>
                                                            <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invNo}</td>
                                                            <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invDate}</td>
                                                            <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.cName}</td>
                                                            <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.gstNo}</td>
                                                            <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invIssueDate}</td>
                                                        </>
                                                    }
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.dcNO}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.dcDate}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.modeOfDispatch}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.vechileNO}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.poNo}
                                                    </td>
                                                    {/* <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.poNo}
                                                    </td> */}
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.cessOnTcsPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.cessOnTcs}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.lessOther}
                                                    </td>

                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.transportCharges}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.tcsPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.tcs}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.subChargeOnTcsPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.subChargeOnTcs}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.insurance}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.CGSTPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.totalInWords}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.taxableValueforGST}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.CGST}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.SGSTPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.ammortisationCost}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.SGST}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.IGSTPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.IGST}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.UTGSTPer}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.UTGST}
                                                    </td>

                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.lessDisc}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.lessOther}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.amtOfGstPay}
                                                    </td>
                                                    <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>
                                                        {item.invQty}
                                                    </td>
                                                </tr>
                                            ))
                                        ))}
                                    </tbody>
                                </table>
                            </Box>

                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div >
    )
}
export default SalesInvoiceReport;