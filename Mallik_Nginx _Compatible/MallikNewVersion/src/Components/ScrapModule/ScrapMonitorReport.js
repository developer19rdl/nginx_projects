import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    Grid,
    LinearProgress,
    TextField,
    Typography
} from "@mui/material";
import {
    SupervisorJcGetMachine,
    SupervisorJcGetMaterial,
    ScrapMstGetThickness,
    ScrapMonitorReport as ScrapMonitorReportApi
} from "../../ApiService/LoginPageService";
import { ScrapMonitorReportCSV } from "../../ApiService/DownloadCsvReportsService";
import ScrapMonitorReportTitle from "./ScrapMonitorReportTitle";
import NotificationBar from "../GlobleFiles/ServiceNotificationBar";
import "./ScrapMonitorReport.css";

// 35 Table Headers matching exact Excel Reference Sheet
const TABLE_HEADERS = [
    "SL NO",
    "MACHINE",
    "DATE",
    "KANBAN DATE",
    "MRP NO",
    "NESTING NO",
    "THICKNESS",
    "SHEET QTY",
    "GRN NO",
    "WT/SHEET",
    "TOTAL SHEET(QTY)",
    "PRODUCED SHEET QTY",
    "TOTAL WT",
    "MATERIAL",
    "PART NO",
    "PART QTY",
    "PART GROSS WT",
    "PART NET WT",
    "PART SCRAP WT",
    "SHEET UTILIZED(in Kgs)",
    "Button scrap generated",
    "TOTAL BUTTON SCRAP/SHEET",
    "SHEET UTILIZED/SH",
    "SKELETON SCRAP/SHEET",
    "CUT SHEET QTY",
    "CUT SHEET WT",
    "TOTAL SCRAP/SHEET",
    "TOTAL BUTTON SCRAP",
    "TOTAL SKELETON SCRAP",
    "TOTAL CUT SHEET GENERATED WT(in Kgs)",
    "TOTAL SHEET UTILIZED WT(in Kgs)",
    "TOTAL SCRAP GENERATED(Kgs)",
    "TOTAL SCRAP WITHOUT BUTTON",
    "SCRAP PERCENTAGE",
    "SCRAP EXCLUDE BUTTON"
];

// Helper function to format GRN field safely
const formatGrn = (grnVal) => {
    if (!grnVal) return "-";
    if (Array.isArray(grnVal)) return grnVal.join(", ");
    const str = String(grnVal);
    if (str.length > 25) {
        return <span title={str}>{str.substring(0, 22) + "..."}</span>;
    }
    return str;
};

const ScrapMonitorReport = () => {
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);

    // State Declarations
    const [viewloading, setViewLoading] = useState(false);
    const [downloadloading, setDownloadLoading] = useState(false);
    const [screenHeight, setScreenHeight] = useState(window.innerHeight);

    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    const [machine, setMachine] = useState("");
    const [rawMaterial, setRawMaterial] = useState("");
    const [thickness, setThickness] = useState("");

    const [machineList, setMachineList] = useState([]);
    const [rawMaterialList, setRawMaterialList] = useState([]);
    const [thicknessList, setThicknessList] = useState([]);

    const [reportData, setReportData] = useState([]);
    const [loader, setLoader] = useState(false);
    const [paginationLoading, setPaginationLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [openNotification, setNotification] = useState({
        status: false,
        type: "error",
        message: ""
    });

    // Resize handler
    useEffect(() => {
        const handleResize = () => setScreenHeight(window.innerHeight);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Load Dropdown Options
    useEffect(() => {
        SupervisorJcGetMachine(
            (res) => setMachineList(res?.data || []),
            () => setMachineList([])
        );
        SupervisorJcGetMaterial(
            (res) => setRawMaterialList(res?.data || []),
            () => setRawMaterialList([])
        );
        ScrapMstGetThickness(
            (res) => setThicknessList(res?.data || []),
            () => setThicknessList([])
        );
    }, []);

    // Memoized Dropdown Options
    const machineOptions = useMemo(() => {
        return machineList.map((item) => {
            const label = item?.Machine_name || item?.machineName || item?.label || item?.id || String(item);
            return { id: item?.id ?? label, label: String(label) };
        });
    }, [machineList]);

    const materialOptions = useMemo(() => {
        return rawMaterialList.map((item) => {
            const label = item?.Material_Name || item?.materialName || item?.material || item?.label || item?.id || String(item);
            return { id: item?.id ?? label, label: String(label) };
        });
    }, [rawMaterialList]);

    const thicknessOptions = useMemo(() => {
        return thicknessList.map((item) => {
            const label = item?.thickness || item?.Thickness || item?.label || item?.id || String(item);
            return { id: item?.id ?? label, label: String(label) };
        });
    }, [thicknessList]);

    // Fetch Paginated Report Data
    const fetchReportData = useCallback((requestedPage = 1, isPagination = false) => {
        setLoader(true);
        if (isPagination) {
            setPaginationLoading(true);
        } else {
            setViewLoading(true);
        }

        const payload = {
            machine: machine || "",
            material: rawMaterial || "",
            thickness: thickness || "",
            from: fromDate || "",
            to: toDate || ""
        };

        ScrapMonitorReportApi(
            payload,
            requestedPage,
            (dataObject) => {
                try {
                    const list = dataObject?.data || [];
                    setReportData(list);
                    setCurrentPage(dataObject?.currentPage || requestedPage);
                    setTotalPages(dataObject?.totalPages || 1);
                    setTotalRecords(dataObject?.totalRecords || list.length || 0);

                    if (list.length === 0) {
                        setNotification({
                            status: true,
                            type: "warning",
                            message: "No records found for selected criteria."
                        });
                    }
                } catch (err) {
                    setNotification({
                        status: true,
                        type: "error",
                        message: "Error processing report data."
                    });
                } finally {
                    setLoader(false);
                    if (isPagination) {
                        setPaginationLoading(false);
                    } else {
                        setViewLoading(false);
                    }
                }
            },
            () => {
                setLoader(false);
                if (isPagination) {
                    setPaginationLoading(false);
                } else {
                    setViewLoading(false);
                }
                setNotification({
                    status: true,
                    type: "error",
                    message: "Failed to fetch report data."
                });
            }
        );
    }, [machine, rawMaterial, thickness, fromDate, toDate]);

    // Handle View Report (Resets to page 1)
    const handleReportView = useCallback(() => {
        setCurrentPage(1);
        fetchReportData(1, false);
    }, [fetchReportData]);

    // Pagination Controls Handlers (Previous / Reverse & Next / Forward)
    const handlePreviousPage = useCallback(() => {
        if (currentPage > 1 && !paginationLoading && !viewloading) {
            fetchReportData(currentPage - 1, true);
        }
    }, [currentPage, paginationLoading, viewloading, fetchReportData]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages && !paginationLoading && !viewloading) {
            fetchReportData(currentPage + 1, true);
        }
    }, [currentPage, totalPages, paginationLoading, viewloading, fetchReportData]);

    // Handle Report Download (Direct Download API Call)
    const handleReportDownload = useCallback(() => {
        setDownloadLoading(true);
        setLoader(true);

        const payload = {
            machine: machine || "",
            material: rawMaterial || "",
            thickness: thickness || "",
            from: fromDate || "",
            to: toDate || ""
        };

        ScrapMonitorReportCSV(
            payload,
            () => {
                setDownloadLoading(false);
                setLoader(false);
                setNotification({
                    status: true,
                    type: "success",
                    message: "Download Success"
                });
            },
            () => {
                setDownloadLoading(false);
                setLoader(false);
                setNotification({
                    status: true,
                    type: "error",
                    message: "Failed to download report."
                });
            }
        );
    }, [machine, rawMaterial, thickness, fromDate, toDate]);

    const handleCloseNotification = useCallback(() => {
        setNotification((prev) => ({ ...prev, status: false }));
    }, []);

    const isActionDisabled = viewloading || downloadloading || paginationLoading;

    return (
        <div style={{ margin: "10px" }}>
            <ScrapMonitorReportTitle />
            <NotificationBar
                openNotification={openNotification.status}
                type={openNotification.type}
                notificationContent={openNotification.message}
                handleClose={handleCloseNotification}
            />

            <Card sx={{ minWidth: 275 }}>
                {loader && (
                    <Box sx={{ width: "100%" }}>
                        <LinearProgress />
                    </Box>
                )}
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        {/* Machine Autocomplete */}
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <FormControl style={{ width: "100%" }}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={machineOptions}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.label || "")}
                                    value={machineOptions.find((m) => m.label === machine || m.id === machine) || (machine ? { id: machine, label: machine } : null)}
                                    onChange={(event, value) => {
                                        setMachine(value ? (typeof value === "string" ? value : value.label || value.id || "") : "");
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Search By Machine" />}
                                />
                            </FormControl>
                        </Grid>

                        {/* Raw Material Autocomplete */}
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <FormControl style={{ width: "100%" }}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={materialOptions}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.label || "")}
                                    value={materialOptions.find((m) => m.label === rawMaterial || m.id === rawMaterial) || (rawMaterial ? { id: rawMaterial, label: rawMaterial } : null)}
                                    onChange={(event, value) => {
                                        setRawMaterial(value ? (typeof value === "string" ? value : value.label || value.id || "") : "");
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Search By Material" />}
                                />
                            </FormControl>
                        </Grid>

                        {/* Thickness Autocomplete */}
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <FormControl style={{ width: "100%" }}>
                                <Autocomplete
                                    fullWidth
                                    size="small"
                                    options={thicknessOptions}
                                    getOptionLabel={(option) => (typeof option === "string" ? option : option.label || "")}
                                    value={thicknessOptions.find((t) => t.label === thickness || t.id === thickness) || (thickness ? { id: thickness, label: thickness } : null)}
                                    onChange={(event, value) => {
                                        setThickness(value ? (typeof value === "string" ? value : value.label || value.id || "") : "");
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Search By Thickness" />}
                                />
                            </FormControl>
                        </Grid>

                        {/* From Date */}
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="From"
                                variant="outlined"
                                size="small"
                                InputLabelProps={{ shrink: true, style: { color: "#000000", fontWeight: "bold" } }}
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </Grid>

                        {/* To Date */}
                        <Grid item xs={12} sm={6} md={2} lg={2}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To"
                                variant="outlined"
                                size="small"
                                InputLabelProps={{ shrink: true, style: { color: "#000000", fontWeight: "bold" } }}
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </Grid>

                        {/* View & Download Buttons */}
                        <Grid item xs={12} sm={12} md={2} lg={2} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: "#002D68" }}
                                disabled={isActionDisabled}
                                onClick={handleReportView}
                            >
                                {viewloading ? (
                                    <CircularProgress size={24} style={{ color: "white" }} />
                                ) : (
                                    "VIEW"
                                )}
                            </Button>
                            <Button
                                variant="contained"
                                style={{ backgroundColor: "#002D68" }}
                                disabled={isActionDisabled}
                                onClick={handleReportDownload}
                            >
                                {downloadloading ? (
                                    <CircularProgress size={24} style={{ color: "white" }} />
                                ) : (
                                    "DOWNLOAD"
                                )}
                            </Button>
                        </Grid>

                        {/* HTML Report Table matching #customers layout */}
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            {reportData.length > 0 ? (
                                <>
                                    <Box sx={{ height: Math.max(screenHeight - 310, 400), width: "100%", overflow: "auto" }}>
                                    <table
                                        border="1"
                                        style={{ borderCollapse: "collapse", width: "100%", zoom: "100%" }}
                                        id="customers"
                                    >
                                        <thead>
                                            <tr>
                                                {TABLE_HEADERS.map((header) => (
                                                    <th key={header} style={{ whiteSpace: "nowrap" }}>
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((data, keyIdx) => {
                                                const parts = data.partsList && data.partsList.length > 0 ? data.partsList : [{}];
                                                const rowSpanVal = parts.length;
                                                const rowKey = data.id || `row-${keyIdx}`;

                                                return parts.map((item, partIdx) => (
                                                    <tr key={`${rowKey}-part-${partIdx}`}>
                                                        {partIdx === 0 && (
                                                            <>
                                                                <td style={{ whiteSpace: "nowrap", textAlign: "center" }} rowSpan={rowSpanVal}>
                                                                    {data.sNo ?? data.slNo ?? data.slno ?? (keyIdx + 1)}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Machine_name || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.date || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Kanbandate || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.mrpNo || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap", fontWeight: "bold" }} rowSpan={rowSpanVal}>
                                                                    {data.Nesting_no || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Thickness || "-"}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Sheet_qty ?? 1}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {formatGrn(data.grn || data.GRN_No)}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalWeight ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Sheet_qty ?? 1}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Sheet_qty ?? 1}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalWeight ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.Material_Name || "-"}
                                                                </td>
                                                            </>
                                                        )}

                                                        {/* Part Specific Columns */}
                                                        <td style={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                                                            {item.Part_no || item.itemCode || "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.Part_no || item.itemCode ? 1 : "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.grossWeight || "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.netWeight || "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.scrapWeight || "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.sheetUtilizedKg ?? data.totalSheetUtilizedWt ?? "-"}
                                                        </td>
                                                        <td style={{ whiteSpace: "nowrap" }}>
                                                            {item.buttonScrapGenerated ?? data.totalButtonScrap ?? "-"}
                                                        </td>

                                                        {/* Sheet Summary Columns */}
                                                        {partIdx === 0 && (
                                                            <>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalButtonScrapPerSheet ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.sheetUtilizedPerSheet ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.skeletonScrapPerSheet ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.cutSheetQty ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.cutSheetWt ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalScrapPerSheet ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalButtonScrap ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalSkeletonScrap ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalCutSheetGeneratedWt ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalSheetUtilizedWt ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap", color: "#c62828", fontWeight: "bold" }} rowSpan={rowSpanVal}>
                                                                    {data.totalScrapGenerated ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.totalScrapWithoutButton ?? 0}
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.scrapPercentage ?? 0}%
                                                                </td>
                                                                <td style={{ whiteSpace: "nowrap" }} rowSpan={rowSpanVal}>
                                                                    {data.scrapExcludeButton ?? 0}
                                                                </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ));
                                            })}
                                        </tbody>
                                    </table>
                                </Box>
                                {reportData.length > 0 && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginTop: "12px",
                                            padding: "8px 16px",
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: "4px",
                                            border: "1px solid #e0e0e0"
                                        }}
                                    >
                                        <Typography variant="body2" style={{ fontWeight: "bold", color: "#002D68" }}>
                                            Total Records: {totalRecords}
                                        </Typography>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                style={{ backgroundColor: currentPage <= 1 || viewloading || paginationLoading ? "#a0a0a0" : "#002D68" }}
                                                disabled={currentPage <= 1 || viewloading || paginationLoading}
                                                onClick={handlePreviousPage}
                                            >
                                                PREVIOUS
                                            </Button>

                                            <Typography variant="body2" style={{ fontWeight: "bold", padding: "0 8px", display: "flex", alignItems: "center", gap: "6px" }}>
                                                {paginationLoading && <CircularProgress size={16} style={{ color: "#002D68" }} />}
                                                Page {currentPage} of {totalPages}
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                style={{ backgroundColor: currentPage >= totalPages || viewloading || paginationLoading ? "#a0a0a0" : "#002D68" }}
                                                disabled={currentPage >= totalPages || viewloading || paginationLoading}
                                                onClick={handleNextPage}
                                            >
                                                NEXT
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </>
                            ) : (
                                !loader && (
                                    <Typography variant="body2" color="textSecondary" align="center" style={{ marginTop: "20px" }}>
                                        No data available. Please select filters and click VIEW.
                                    </Typography>
                                )
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </div>
    );
};

export default ScrapMonitorReport;
