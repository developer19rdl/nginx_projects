import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    LinearProgress,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './Cancel_Export_Invoice_Report.css';
import {
    CustomerDropShowdata,
    CancelExportInvoiceReport,
    PartNoSelectShow
} from "../../ApiService/LoginPageService";
import NotificationBar from "../GlobleFiles/ServiceNotificationBar";

/**
 * Pure Utility Function to calculate date ranges based on quick filter selection.
 * Keeps logic side-effect free and reusable.
 * 
 * @param {string} filterPreset - Selected filter key (Today, Yesterday, etc.)
 * @returns {{ fromDate: string, toDate: string }} Formatted date strings (YYYY-MM-DD)
 */
const calculateDateRange = (filterPreset) => {
    let from = new Date();
    let to = new Date();

    switch (filterPreset) {
        case 'Today':
            break;
        case 'Yesterday':
            from.setDate(from.getDate() - 1);
            to = new Date(from);
            break;
        case 'This week':
            from.setDate(from.getDate() - from.getDay());
            break;
        case 'Last week':
            from.setDate(from.getDate() - from.getDay() - 7);
            to = new Date(from);
            to.setDate(to.getDate() + 6);
            break;
        case 'This month':
            from.setDate(1);
            break;
        case 'Last month':
            from.setMonth(from.getMonth() - 1);
            from.setDate(1);
            to = new Date(from);
            to.setMonth(to.getMonth() + 1);
            to.setDate(0);
            break;
        default:
            return { fromDate: '', toDate: '' };
    }

    const formatDate = (date) => date ? date.toISOString().split('T')[0] : '';
    return { fromDate: formatDate(from), toDate: formatDate(to) };
};

const ICON = <CheckBoxOutlineBlankIcon fontSize="small" />;
const CHECKED_ICON = <CheckBoxIcon fontSize="small" />;

const TABLE_HEADERS = [
    'INV No', 'INV Date', 'Cust Name', 'GST No', 'INV Issue Date',
    'INV Qty', 'Item Code', 'Item Name',
    'DC No', 'DC Date', 'Mode Of Desp', 'Vehicle No', 'Cust PONO Date',
    'CESSONTCSPER', 'CESSONTCSAMT', 'Other Amt', 'Transport Amt',
    'TCS Per', 'TCS Amt', 'SURCHGONTCSPER', 'SURCHGONTCSAMT',
    'INSAMT', 'CGSTPER', 'Total In Words', 'ASSBL Value',
    'CGST Amt', 'SGST Per', 'AMMCOST', 'SGST Amt',
    'IGST Per', 'IGST Amt', 'UTGST Per', 'UTGST Amt',
    'Less Disc Amt', 'Less Other', 'Amt GST Payable', 'Total Value'
];

/**
 * Cancel_Export_Invoice_Report Component
 * Optimized with useCallback, useMemo, robust notification state, clean error handling,
 * and automated Excel workbook formatting.
 */
const Cancel_Export_Invoice_Report = () => {
    // Layout and Filter States
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setTodate] = useState('');
    const [selectedFilterRadio, setSelectedFilterRadio] = useState('Today');

    // Data & Loading States
    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);

    // Dropdown Selection States
    const [customerSelect, setCustomerSelect] = useState([]);
    const [customerSelectList, setCustomerSelectList] = useState([]);
    const [partNo, setPartNo] = useState([]);
    const [partNoList, setPartNoList] = useState([]);

    // Notification State
    const [notification, setNotification] = useState({
        status: false,
        type: 'info',
        message: '',
    });

    const showNotification = useCallback((message, type = 'error') => {
        setNotification({ status: true, type, message });
    }, []);

    const handleCloseNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, status: false }));
    }, []);

    // Handle Quick Date Radio Filter Changes
    const handleRadioChange = useCallback((event) => {
        const val = event.target.value;
        setSelectedFilterRadio(val);
        const { fromDate: fDate, toDate: tDate } = calculateDateRange(val);
        if (fDate && tDate) {
            setFromDate(fDate);
            setTodate(tDate);
        }
    }, []);

    // Initialize Default Date Range & Handle Window Resize
    useEffect(() => {
        const { fromDate: initialFrom, toDate: initialTo } = calculateDateRange('Today');
        setFromDate(initialFrom);
        setTodate(initialTo);

        const handleResize = () => setScreenHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // API Handlers for Data Fetching
    const handleGetReportSuccess = useCallback((dataObject) => {
        setLoader(false);
        const data = dataObject?.data || [];
        setReportData(data);
        if (data.length === 0) {
            showNotification("No records found for the selected filter criteria.", "info");
        }
    }, [showNotification]);

    const handleGetReportException = useCallback((error) => {
        setLoader(false);
        showNotification(error?.message || "Failed to fetch report data. Please try again.", "error");
    }, [showNotification]);

    const handleReportView = useCallback(() => {
        if (!fromDate || !toDate) {
            showNotification("Please select valid From and To dates.", "warning");
            return;
        }
        setLoader(true);
        CancelExportInvoiceReport(
            {
                from: fromDate,
                to: toDate,
                customer: customerSelect,
                item: partNo
            },
            handleGetReportSuccess,
            handleGetReportException
        );
    }, [fromDate, toDate, customerSelect, partNo, handleGetReportSuccess, handleGetReportException, showNotification]);

    // Customer Selection Change Handlers
    const handleChangeCustomer = useCallback((e) => {
        if (e?.target?.value !== undefined) {
            CustomerDropShowdata(
                { code: e.target.value },
                (dataObject) => setCustomerSelectList(dataObject?.data || []),
                () => { }
            );
        }
    }, []);

    const handleSearchCustomerChange = useCallback((value) => {
        if (value) {
            setCustomerSelect(value.map((item) => item.id));
        }
    }, []);

    // Part Number Selection Change Handlers
    const handlePartNoInputChange = useCallback((e) => {
        if (e?.target?.value !== undefined) {
            PartNoSelectShow(
                { code: e.target.value, id: customerSelect },
                (dataObject) => setPartNoList(dataObject?.data || []),
                () => { }
            );
        }
    }, [customerSelect]);

    const onPartNoSelectChange = useCallback((value) => {
        if (value) {
            setPartNo(value.map((item) => item.id));
        }
    }, []);

    // Optimized Excel Export Handler
    const handleReportDownload = useCallback(async () => {
        if (!reportData || reportData.length === 0) {
            showNotification("No data available to download.", "warning");
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cancel Export Report');

            // Add Styled Header Row
            const headerRow = worksheet.addRow(TABLE_HEADERS);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '002D68' }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            });

            worksheet.views = [{ state: 'frozen', ySplit: 1 }];
            let currentRow = 2;

            reportData.forEach((data) => {
                const startRow = currentRow;
                const items = data.invDtl || [];

                items.forEach((item, index) => {
                    worksheet.addRow([
                        index === 0 ? data.invNo : '',
                        index === 0 ? data.invDate : '',
                        index === 0 ? data.cName : '',
                        index === 0 ? data.gstNo : '',
                        index === 0 ? data.invIssueDate : '',
                        item.invQty ?? 0,
                        item.itemCode ?? '',
                        item.itemName ?? '',
                        item.dcNO ?? '',
                        item.dcDate ?? '',
                        item.modeOfDispatch ?? '',
                        item.vechileNO ?? '',
                        item.poNo ?? '',
                        item.cessOnTcsPer ?? 0,
                        item.cessOnTcs ?? 0,
                        item.lessOther ?? 0,
                        item.transportCharges ?? 0,
                        item.tcsPer ?? 0,
                        item.tcs ?? 0,
                        item.subChargeOnTcsPer ?? 0,
                        item.subChargeOnTcs ?? 0,
                        item.insurance ?? 0,
                        item.CGSTPer ?? 0,
                        item.totalInWords ?? '',
                        item.taxableValueforGST ?? 0,
                        item.CGST ?? 0,
                        item.SGSTPer ?? 0,
                        item.ammortisationCost ?? 0,
                        item.SGST ?? 0,
                        item.IGSTPer ?? 0,
                        item.IGST ?? 0,
                        item.UTGSTPer ?? 0,
                        item.UTGST ?? 0,
                        item.lessDisc ?? 0,
                        item.lessOther ?? 0,
                        item.amtOfGstPay ?? 0,
                        item.totalValue ?? 0
                    ]);

                    currentRow++;
                });

                const endRow = currentRow - 1;
                if (items.length > 1) {
                    [1, 2, 3, 4, 5].forEach(col => {
                        worksheet.mergeCells(startRow, col, endRow, col);
                    });
                }
            });

            // Styling Borders and Auto-width
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                });
            });

            worksheet.columns.forEach((column) => {
                let maxLen = 12;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const len = cell.value ? cell.value.toString().length : 0;
                    if (len > maxLen) maxLen = len;
                });
                column.width = Math.min(maxLen + 3, 40);
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(
                new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
                'Cancel_Export_Invoice_Report.xlsx'
            );
            showNotification("Report downloaded successfully!", "success");
        } catch (err) {
            showNotification("Failed to export Excel report.", "error");
        }
    }, [reportData, showNotification]);

    return (
        <div style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}>
                <Typography sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }} variant="h5">
                    Cancel Export Invoice Report
                </Typography>
            </div>
            <Card sx={{ minWidth: 275 }}>
                {loader && (
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                )}
                <CardContent>
                    <Grid container alignItems="center" spacing={2}>
                        {/* Preset Radio Buttons */}
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

                        {/* Customer Search Autocomplete */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    multiple
                                    id="customer-autocomplete"
                                    options={customerSelectList}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.cCode || ''}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox icon={ICON} checkedIcon={CHECKED_ICON} style={{ marginRight: 8 }} checked={selected} />
                                            {option.cCode}
                                        </li>
                                    )}
                                    renderTags={(value, getTagProps) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexGrow: 1,
                                                flexShrink: 0,
                                                width: 'calc(100% - 30px)',
                                                maxWidth: 'calc(100% - 30px)',
                                                overflowX: 'auto',
                                                overflowY: 'hidden',
                                                whiteSpace: 'nowrap',
                                                alignItems: 'center',
                                                py: 0.2,
                                                '&::-webkit-scrollbar': {
                                                    height: '3px'
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: '#90caf9',
                                                    borderRadius: '3px'
                                                }
                                            }}
                                        >
                                            {value.map((option, index) => (
                                                <Chip
                                                    size="small"
                                                    label={option.cCode}
                                                    {...getTagProps({ index })}
                                                    key={option.id || index}
                                                    sx={{ flexShrink: 0, mr: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            maxHeight: '40px',
                                            overflow: 'hidden',
                                            flexWrap: 'nowrap',
                                            paddingRight: '30px !important',
                                            '& .MuiAutocomplete-input': {
                                                flex: '0 0 auto !important',
                                                flexGrow: '0 !important',
                                                minWidth: '25px !important',
                                                width: '25px !important'
                                            }
                                        }
                                    }}
                                    size="small"
                                    renderInput={(params) => <TextField {...params} label="Search Customer" onChange={handleChangeCustomer} />}
                                    onChange={(_, val) => handleSearchCustomerChange(val)}
                                />
                            </FormControl>
                        </Grid>

                        {/* Part Number Search Autocomplete */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    multiple
                                    id="partno-autocomplete"
                                    options={partNoList}
                                    disableCloseOnSelect
                                    getOptionLabel={(option) => option.label || ''}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props}>
                                            <Checkbox icon={ICON} checkedIcon={CHECKED_ICON} style={{ marginRight: 8 }} checked={selected} />
                                            {option.label}
                                        </li>
                                    )}
                                    renderTags={(value, getTagProps) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                flexGrow: 1,
                                                flexShrink: 0,
                                                width: 'calc(100% - 30px)',
                                                maxWidth: 'calc(100% - 30px)',
                                                overflowX: 'auto',
                                                overflowY: 'hidden',
                                                whiteSpace: 'nowrap',
                                                alignItems: 'center',
                                                py: 0.2,
                                                '&::-webkit-scrollbar': {
                                                    height: '3px'
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: '#90caf9',
                                                    borderRadius: '3px'
                                                }
                                            }}
                                        >
                                            {value.map((option, index) => (
                                                <Chip
                                                    size="small"
                                                    label={option.label}
                                                    {...getTagProps({ index })}
                                                    key={option.id || index}
                                                    sx={{ flexShrink: 0, mr: 0.5 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '40px',
                                            maxHeight: '40px',
                                            overflow: 'hidden',
                                            flexWrap: 'nowrap',
                                            paddingRight: '30px !important',
                                            '& .MuiAutocomplete-input': {
                                                flex: '0 0 auto !important',
                                                flexGrow: '0 !important',
                                                minWidth: '25px !important',
                                                width: '25px !important'
                                            }
                                        }
                                    }}
                                    size="small"
                                    renderInput={(params) => <TextField {...params} label="Search Part No" onChange={handlePartNoInputChange} />}
                                    onChange={(_, val) => onPartNoSelectChange(val)}
                                />
                            </FormControl>
                        </Grid>

                        {/* From Date Input */}
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="From"
                                variant="outlined"
                                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                                size="small"
                                value={fromDate}
                                onChange={(e) => {
                                    setSelectedFilterRadio('Custom');
                                    setFromDate(e.target.value);
                                }}
                            />
                        </Grid>

                        {/* To Date Input */}
                        <Grid item xs={12} sm={6} md={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To"
                                variant="outlined"
                                InputLabelProps={{ shrink: true, style: { color: '#000000', fontWeight: 'bold' } }}
                                size="small"
                                value={toDate}
                                onChange={(e) => {
                                    setSelectedFilterRadio('Custom');
                                    setTodate(e.target.value);
                                }}
                            />
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} sm={12} md={3}>
                            <Button
                                disabled={loader}
                                variant="contained"
                                style={{ backgroundColor: '#002D68', marginRight: '15px' }}
                                onClick={handleReportView}
                            >
                                {loader ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'View'}
                            </Button>
                            <Button variant="contained" style={{ backgroundColor: '#002D68' }} onClick={handleReportDownload}>
                                Download
                            </Button>
                        </Grid>

                        {/* Data Grid Table */}
                        <Grid item xs={12}>
                            <Box sx={{ height: Math.max(screenHeight - 310, 300), width: '100%', overflow: 'auto' }}>
                                <table border="1" style={{ borderCollapse: "collapse", width: "100%", zoom: '80%' }} id="customers">
                                    <thead>
                                        <tr>
                                            {TABLE_HEADERS.map((h) => (
                                                <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.length > 0 ? (
                                            reportData.map((data, Key) => (
                                                data.invDtl?.map((item, index) => (
                                                    <tr
                                                        key={`${Key}-${index}`}
                                                        style={data.invNo === 'Grand Total' ? { backgroundColor: 'lightgreen' } : {}}
                                                    >
                                                        {index === 0 && (
                                                            <>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invNo}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invDate}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.cName}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.gstNo}</td>
                                                                <td style={{ width: '150px', whiteSpace: 'nowrap' }} rowSpan={data.invDtl.length}>{data.invIssueDate}</td>
                                                            </>
                                                        )}
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.invQty}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.itemCode}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.itemName}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.dcNO}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.dcDate}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.modeOfDispatch}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.vechileNO}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.poNo}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.cessOnTcsPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.cessOnTcs}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.lessOther}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.transportCharges}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.tcsPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.tcs}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.subChargeOnTcsPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.subChargeOnTcs}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.insurance}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.CGSTPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.totalInWords}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.taxableValueforGST}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.CGST}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.SGSTPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.ammortisationCost}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.SGST}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.IGSTPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.IGST}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.UTGSTPer}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.UTGST}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.lessDisc}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.lessOther}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.amtOfGstPay}</td>
                                                        <td style={{ backgroundColor: item.PartNo === "" ? '#4a4947' : '#ffffff', color: item.PartNo === "" ? '#ffffff' : '#000000' }}>{item.totalValue}</td>
                                                    </tr>
                                                ))
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={TABLE_HEADERS.length} style={{ textAlign: 'center', padding: '20px' }}>
                                                    No Data Available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <NotificationBar
                handleClose={handleCloseNotification}
                notificationContent={notification.message}
                openNotification={notification.status}
                type={notification.type}
            />
        </div>
    );
};

export default Cancel_Export_Invoice_Report;
