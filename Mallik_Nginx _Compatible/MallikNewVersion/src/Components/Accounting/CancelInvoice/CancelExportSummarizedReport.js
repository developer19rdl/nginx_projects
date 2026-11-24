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
import { CancelExportInvoiceSummary, CustomerDropShowdata } from "../../../ApiService/LoginPageService";
import NotificationBar from "../../GlobleFiles/ServiceNotificationBar";

/**
 * Pure Utility Function to calculate date ranges based on quick filter selection.
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
    'INV No',
    'INV Date',
    'Vehicle No',
    'Cust PONO',
    'Cust PO Date',
    'Cust Code',
    'Cust Name',
    'GST No',
    'HSN Code',
    'Commudity',
    'UOM',
    'Total Qty',
    'Assble Value',
    'Less Disc Amt',
    'Less Others',
    'Packing',
    'Transportation Amt',
    'Customer Amt',
    'Amount GST Payable',
    'CGSTPER',
    'CGST Amt',
    'SGST Per',
    'SGST Amt',
    'IGST Per',
    'IGST Amt',
    'UTGST Per',
    'UTGST Amt',
    'TCS Per',
    'TCS Amt',
    'Round Off',
    'Gross Amount'
];

/**
 * CancelExportSummarizedReport Component
 * Fully optimized React component leveraging hooks (useCallback, useMemo),
 * robust error notifications, and high-performance ExcelJS export.
 */
const CancelExportSummarizedReport = () => {
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

    // Quick Date Preset Change Handler
    const handleRadioChange = useCallback((event) => {
        const val = event.target.value;
        setSelectedFilterRadio(val);
        const { fromDate: fDate, toDate: tDate } = calculateDateRange(val);
        if (fDate && tDate) {
            setFromDate(fDate);
            setTodate(tDate);
        }
    }, []);

    // Initial Date Range Setup & Window Resize Listener
    useEffect(() => {
        const { fromDate: initialFrom, toDate: initialTo } = calculateDateRange('Today');
        setFromDate(initialFrom);
        setTodate(initialTo);

        const handleResize = () => setScreenHeight(window.innerHeight);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch API Handlers
    const handleGetReportSuccess = useCallback((dataObject) => {
        setLoader(false);
        const data = dataObject?.data || [];
        setReportData(data);
        if (data.length === 0) {
            showNotification("No summarized records found for the selected criteria.", "info");
        }
    }, [showNotification]);

    const handleGetReportException = useCallback((error) => {
        setLoader(false);
        showNotification(error?.message || "Failed to fetch summarized report data.", "error");
    }, [showNotification]);

    const handleReportView = useCallback(() => {
        if (!fromDate || !toDate) {
            showNotification("Please select valid From and To dates.", "warning");
            return;
        }
        setLoader(true);
        CancelExportInvoiceSummary(
            {
                from: fromDate,
                to: toDate,
                customer: customerSelect,
            },
            handleGetReportSuccess,
            handleGetReportException
        );
    }, [fromDate, toDate, customerSelect, handleGetReportSuccess, handleGetReportException, showNotification]);

    // Customer Dropdown Handlers
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

    // Optimized Excel Download Handler
    const handleReportDownload = useCallback(async () => {
        if (!reportData || reportData.length === 0) {
            showNotification("No summary data available to download.", "warning");
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Cancel Export Summary Report');

            // Add Header Row
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

            reportData.forEach((data) => {
                const row = [
                    data.invNo ?? '',
                    data.date ?? '',
                    data.vechileNO ?? '',
                    data.poNo ?? '',
                    data.poDate ?? '',
                    data.cCode ?? '',
                    data.cName ?? '',
                    data.gstNo ?? '',
                    data.hsnCode ?? '',
                    data.itemLedger ?? '',
                    data.uom ?? '',
                    data.totalQty ?? 0,
                    data.taxableValueforGST ?? 0,
                    data.lessDisc ?? 0,
                    data.lessOther ?? 0,
                    data.packingForw ?? 0,
                    data.transportCharges ?? 0,
                    data.custMeterialValue ?? 0,
                    data.amtOfGstPay ?? 0,
                    data.CGSTPer ?? 0,
                    data.CGST ?? 0,
                    data.SGSTPer ?? 0,
                    data.SGST ?? 0,
                    data.IGSTPer ?? 0,
                    data.IGST ?? 0,
                    data.UTGSTPer ?? 0,
                    data.UTGST ?? 0,
                    data.tcsPer ?? 0,
                    data.tcs ?? 0,
                    data.roundOff ?? 0,
                    data.totalValue ?? 0
                ];

                const addedRow = worksheet.addRow(row);

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
            });

            // Alignment & Borders
            worksheet.eachRow((row) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' }
                    };
                    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });
            });

            // Column Width Auto-calculation
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
                'Cancel_Export_Summarized_Report.xlsx'
            );
            showNotification("Summarized report downloaded successfully!", "success");
        } catch (err) {
            showNotification("Failed to export Excel report.", "error");
        }
    }, [reportData, showNotification]);

    return (
        <div style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginLeft: '5px', marginTop: '10px', marginBottom: '10px' }}>
                <Typography sx={{ fontFamily: 'Roboto Slab', fontWeight: 'bold' }} variant="h5">
                    Cancel Export Summarized Report
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
                        {/* Preset Radios */}
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

                        {/* Customer Filter */}
                        <Grid item xs={12} sm={6} md={2}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    multiple
                                    id="customer-summary-autocomplete"
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

                        {/* Date Inputs */}
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
                                            reportData.map((data, index) => (
                                                <tr key={index} style={data.invNo === 'Grand Total' ? { backgroundColor: 'lightgreen', fontWeight: 'bold' } : {}}>
                                                    <td>{data.invNo}</td>
                                                    <td>{data.date}</td>
                                                    <td>{data.vechileNO}</td>
                                                    <td>{data.poNo}</td>
                                                    <td>{data.poDate}</td>
                                                    <td>{data.cCode}</td>
                                                    <td>{data.cName}</td>
                                                    <td>{data.gstNo}</td>
                                                    <td>{data.hsnCode}</td>
                                                    <td>{data.itemLedger}</td>
                                                    <td>{data.uom}</td>
                                                    <td>{data.totalQty}</td>
                                                    <td>{data.taxableValueforGST}</td>
                                                    <td>{data.lessDisc}</td>
                                                    <td>{data.lessOther}</td>
                                                    <td>{data.packingForw}</td>
                                                    <td>{data.transportCharges}</td>
                                                    <td>{data.custMeterialValue}</td>
                                                    <td>{data.amtOfGstPay}</td>
                                                    <td>{data.CGSTPer}</td>
                                                    <td>{data.CGST}</td>
                                                    <td>{data.SGSTPer}</td>
                                                    <td>{data.SGST}</td>
                                                    <td>{data.IGSTPer}</td>
                                                    <td>{data.IGST}</td>
                                                    <td>{data.UTGSTPer}</td>
                                                    <td>{data.UTGST}</td>
                                                    <td>{data.tcsPer}</td>
                                                    <td>{data.tcs}</td>
                                                    <td>{data.roundOff}</td>
                                                    <td>{data.totalValue}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={TABLE_HEADERS.length} style={{ textAlign: 'center', padding: '20px' }}>
                                                    No Summarized Data Available
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

export default CancelExportSummarizedReport;
