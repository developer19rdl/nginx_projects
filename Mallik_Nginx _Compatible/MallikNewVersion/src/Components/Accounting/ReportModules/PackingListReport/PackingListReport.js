import React, { useState, useEffect } from "react";
import { Autocomplete, Box, Button, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, Grid, LinearProgress, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import '../ExportInvoiceReport/ExportInvoiceReport.css';

import { ScrapMstGetMaterial, MachineShowData, CustomerDropShowdata, GetPackingListReport } from "../../../../ApiService/LoginPageService";
import NotificationBar from "../../../GlobleFiles/ServiceNotificationBar";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const PackingListReport = () => {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setTodate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [selectedFilterRadio, setSelectedFilterRadio] = useState('Today');
    const [loader, setLoader] = useState(false);
    const [rawMaterialList, setRawMaterialList] = useState([]);
    const [machinList, setMachineList] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [customerSelect, setCustomerSelect] = useState([]);
    const [customerSelectList, setCustomerSelectList] = useState([]);

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
                toDate.setDate(0);
                break;
            default:
                fromDate = null;
                toDate = null;
        }

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
    }, []);

    const handleReportView = () => {
        setLoader(true);
        GetPackingListReport(
            {
                from: fromDate,
                to: toDate,
                customer: customerSelect
            }, handleGetReportSuccess, handleGetReportException)
    };

    const handleGetReportSuccess = (dataObject) => {
        setLoader(false);
        setReportData(dataObject?.data || []);
    };
    const handleGetReportException = () => {
        setLoader(false);
    };

    const handleReportDownload = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Report');

        const headers = [
            'PL No', 'PL Date', 'Cust Name', 'GST No', 'Invoice Issue Date',
            'Mode Of Desp', 'Vehicle No', 'Export Invoice No',
            'Part No', 'Part Name', 'UOM', 'PL Qty', 'Per Part Weight',
            'Net Weight', 'Gross Weight', 'No of Packages', 'Box Dimension',
            'HSN Code', 'PO Line Item'
        ];

        const headerRow = worksheet.addRow(headers);
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];

        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        reportData.forEach((data) => {
            const details = data.plDtl || data.items || data.plItemData || data.invDtl || [];
            details.forEach((item) => {
                const row = [
                    data.plNo || data.plNumber || '',
                    data.date || data.plDate || '',
                    data.cName || data.customerName || '',
                    data.gstNo || '',
                    item.modelOfDis || item.modeOfDispatch || '',
                    data.vechileNO || data.vehicleNo || '',
                    item.invNo || '',
                    item.itemCode || item.partNo || '',
                    item.itemName || item.partName || '',
                    item.uom || '',
                    Number(item.plQty) || 0,
                    Number(item.perPartWeight) || 0,
                    Number(item.netWeight) || 0,
                    Number(item.grossWeight || item.totGrossWeight) || 0,
                    Number(item.noOfPackages || item.noOfBox) || 0,
                    item.boxDimension || '',
                    item.hsnCode || '',
                    item.poLineItem || '',
                ];

                const addedRow = worksheet.addRow(row);

                if (data.plNo === 'Grand Total') {
                    addedRow.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'C6EFCE' }
                        };
                        cell.font = { bold: true };
                    });
                }

                addedRow.eachCell((cell) => {
                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true
                    };
                });

                const numberColumns = [14, 15, 16, 17, 18];
                numberColumns.forEach((colIndex) => {
                    addedRow.getCell(colIndex).numFmt = '#,##0.00';
                });
            });
        });

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

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, 'Packing_List_Report.xlsx');
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleScrapMstGetMaterialSuccess = (dataObject) => {
        setRawMaterialList(dataObject?.data || []);
    };
    const handleScrapMstGetMaterialException = () => { };

    const handleMachineShowDataSuccess = (dataObject) => {
        setMachineList(dataObject?.data || []);
    };
    const handleMachineShowDataExceprion = () => { };

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
    const handleCustomerDropshowException = () => { };

    const handleSearchItemChange = (value) => {
        if (value !== null) {
            const idArray = value.map((item) => item.id);
            setCustomerSelect(idArray);
        }
    };

    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;

    return (
        <div style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                    variant="h5">
                    Packing List Report
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
                                    {['Today', 'Yesterday', 'This week', 'Last week', 'This month', 'Last month', 'Custom'].map((item) => (
                                        <FormControlLabel
                                            key={item}
                                            value={item}
                                            control={<Radio
                                                sx={{
                                                    color: '#686D76',
                                                    '&.Mui-checked': {
                                                        color: '#000000',
                                                    }
                                                }}
                                            />}
                                            label={item}
                                        />
                                    ))}
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
                            <Box sx={{ height: screenHeight - 310, width: '100%', overflow: 'auto' }}>
                                <table border="1" style={{ borderCollapse: "collapse", width: "100%", zoom: '80%' }} id="purchase">
                                    <thead>
                                        <tr>
                                            <th style={{ whiteSpace: 'nowrap' }}>PL No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>PL Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Cust Name</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>GST No</th>
                                            {/* <th style={{ whiteSpace: 'nowrap' }}>Invoice Issue Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DC No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>DC Date</th> */}
                                            <th style={{ whiteSpace: 'nowrap' }}>Mode Of Desp</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Vehicle No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Export Invoice No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Part No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Part Name</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>UOM</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>PL Qty</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Per Part Weight</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Net Weight</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Gross Weight</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>No of Packages</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Box Dimension</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>HSN Code</th>
                                            {/* <th style={{ whiteSpace: 'nowrap' }}>PO No</th> */}
                                            <th style={{ whiteSpace: 'nowrap' }}>PO Line Item</th>
                                            {/* <th style={{ whiteSpace: 'nowrap' }}>Contract No</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData && reportData.map((data, Key) => {
                                            const details = data.plDtl || data.items || data.plItemData || data.invDtl || [];
                                            return details.map((item, index) => {
                                                const isDarkRow = item.itemCode === "" && item.partNo === "";
                                                const cellStyle = {
                                                    backgroundColor: isDarkRow ? '#4a4947' : '#ffffff',
                                                    color: isDarkRow ? '#ffffff' : '#000000'
                                                };
                                                return (
                                                    <tr
                                                        key={`${Key}-${index}`}
                                                        style={data.plNo === 'Grand Total' ? { backgroundColor: 'lightgreen' } : {}}
                                                    >
                                                        {index === 0 &&
                                                            <>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={details.length}>{data.plNo || data.plNumber}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={details.length}>{data.date || data.plDate}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={details.length}>{data.cName || data.customerName}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={details.length}>{data.gstNo}</td>
                                                                {/* <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={details.length}>{data.invoIssuDate}</td> */}
                                                            </>
                                                        }
                                                        {/* <td style={cellStyle}>{item.dcNO || item.dcNo}</td>
                                                        <td style={cellStyle}>{item.dcDate}</td> */}
                                                        <td style={cellStyle}>{item.modelOfDis || item.modeOfDispatch}</td>
                                                        <td style={cellStyle}>{data.vechileNO || data.vehicleNo}</td>
                                                        <td style={cellStyle}>{item.invNo}</td>
                                                        <td style={cellStyle}>{item.itemCode || item.partNo}</td>
                                                        <td style={cellStyle}>{item.itemName || item.partName}</td>
                                                        <td style={cellStyle}>{item.uom}</td>
                                                        <td style={cellStyle}>{item.plQty}</td>
                                                        <td style={cellStyle}>{item.perPartWeight}</td>
                                                        <td style={cellStyle}>{item.netWeight}</td>
                                                        <td style={cellStyle}>{item.grossWeight}</td>
                                                        <td style={cellStyle}>{item.noOfPackages}</td>
                                                        <td style={cellStyle}>{item.boxDimension}</td>
                                                        <td style={cellStyle}>{item.hsnCode}</td>
                                                        {/* <td style={cellStyle}>{item.poNo}</td> */}
                                                        <td style={cellStyle}>{item.poLineItem}</td>
                                                        {/* <td style={cellStyle}>{item.contractNo}</td> */}
                                                    </tr>
                                                );
                                            });
                                        })}
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
        </div>
    )
};

export default PackingListReport;
