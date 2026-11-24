import React, { useState, useEffect } from "react";
import { Autocomplete, Box, Button, Card, CardContent, Checkbox, CircularProgress, FormControl, FormControlLabel, Grid, LinearProgress, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import '../ExportInvoiceReport/ExportInvoiceRegisterReport.css';

import { ScrapMstGetMaterial, MachineShowData, CustomerDropShowdata, GetPackingListRegisterReport } from "../../../../ApiService/LoginPageService";
import NotificationBar from "../../../GlobleFiles/ServiceNotificationBar";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const PackingListRegisterReport = () => {
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setTodate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [rawMaterialList, setRawMaterialList] = useState([]);
    const [machinList, setMachineList] = useState([]);
    const [openNotification, setNotification] = useState({
        status: false,
        message: '',
    });
    const [customerSelect, setCustomerSelect] = useState([]);
    const [customerSelectList, setCustomerSelectList] = useState([]);
    const [selectedFilterRadio, setSelectedFilterRadio] = useState('Today');

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
        GetPackingListRegisterReport(
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
        const worksheet = workbook.addWorksheet('Packing List Register');

        const headers = [
            'PL No', 'PL Date', 'Vehicle No', 'Invoice Issue Date', 'DC No', 'DC Date',
            'Cust Code', 'Cust Name', 'GST No',
            'Total Qty', 'Total Net Weight', 'Total Gross Weight', 'Total Packages',
            'Mode of Dispatch', 'Transaction Type', 'Remarks'
        ];

        worksheet.addRow(headers);

        reportData.forEach((data) => {
            worksheet.addRow([
                data.plNo || data.plNumber || '',
                data.date || data.plDate || '',
                data.vechileNO || data.vehicleNo || '',
                data.invoIssuDate || '',
                data.dcNO || data.dcNo || '',
                data.dcDate || '',
                data.cCode || data.customerCode || '',
                data.cName || data.customerName || '',
                data.gstNo || '',
                Number(data.totalQty || data.totQty || data.qty) || 0,
                Number(data.totNetWeight || data.netWeight) || 0,
                Number(data.totGrossWeight || data.grossWeight) || 0,
                Number(data.totalPackages || data.totPackages || data.noOfPackages) || 0,
                data.modelOfDis || data.modeOfDispatch || '',
                data.trType || data.transactionType || '',
                data.remrk1 || data.remarks || data.remrk2 || ''
            ]);
        });

        worksheet.columns.forEach((col) => {
            let maxLength = 10;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : '';
                maxLength = Math.max(maxLength, value.length);
            });
            col.width = maxLength + 2;
        });

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Packing_List_Register_Report.xlsx');
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

    return (
        <div style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}>
                <Typography
                    sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                    variant="h5">
                    Packing List Register Report
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
                                            <th style={{ whiteSpace: 'nowrap' }}>Vehicle No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Invoice Issue Date</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Cust Code</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Cust Name</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>GST No</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Total Qty</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Total Net Weight</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Total Gross Weight</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Total Packages</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Mode of Dispatch</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Transaction Type</th>
                                            <th style={{ whiteSpace: 'nowrap' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData && reportData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{data.plNo || data.plNumber}</td>
                                                <td>{data.date || data.plDate}</td>
                                                <td>{data.vechileNO || data.vehicleNo}</td>
                                                <td>{data.invoIssuDate}</td>
                                                <td>{data.cCode || data.customerCode}</td>
                                                <td>{data.cName || data.customerName}</td>
                                                <td>{data.gstNo}</td>
                                                <td>{data.totalQty || data.totQty || data.qty}</td>
                                                <td>{data.totNetWeight || data.netWeight}</td>
                                                <td>{data.totGrossWeight || data.grossWeight}</td>
                                                <td>{data.totalPackages || data.totPackages || data.noOfPackages}</td>
                                                <td>{data.modelOfDis || data.modeOfDispatch}</td>
                                                <td>{data.trType || data.transactionType}</td>
                                                <td>{data.remrk1 || data.remarks || data.remrk2}</td>
                                            </tr>
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
        </div>
    )
};

export default PackingListRegisterReport;
