import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  PurchaseReportSearchSupplier,
  PurchaseOrderGroup,
  GetPriceRevisionData,
} from "../../../ApiService/LoginPageService";
import "./PriceRevisionHistoryReport.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NotificationBar from "../../GlobleFiles/ServiceNotificationBar";

const PriceRevisionHistoryReport = () => {
  const [supplierList, setSupplierList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setTodate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [poReportData, setPoReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);
  const [openNotification, setNotification] = useState({
    status: false,
    type: "error",
    message: "",
  });

  useEffect(() => {
    const handleResize = () => setScreenHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // SUPPLIER SEARCH
  const handleSupplierChange = (e) => {
    PurchaseReportSearchSupplier(
      { code: e.target.value },
      handleSearchSupplierSucessShow,
      handleSearchSupplierExceptionShow
    );
  };





  const handleClose = () => {
    setNotification({
      status: false,
      type: "",
      message: "",
    });
  };

  const handleSearchSupplierSucessShow = (dataObject) => {
    setSupplierList(dataObject?.data || []);
  };
  const handleSearchSupplierExceptionShow = (errorObject, errorMessage) => { };

  const handleSupplierSelect = (value) => {
    if (value !== null) {
      const ids = value.map((item) => item.id);
      setSelectedSupplier(ids);
    }
  };

  const handleReportView = () => {
    setLoading(true);
    GetPriceRevisionData({ spName: selectedSupplier, fromDate: fromDate, toDate: toDate }, handleGetReportSuccess, handleGetReportException)
  };

  const handleGetReportSuccess = (dataObject) => {
    setPoReportData(dataObject?.data || []);
    setLoading(false);
  };
  const handleGetReportException = () => {
    setLoading(false);
  };

  /////////////////////////////////////

  const arrayToWorksheet = (array) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("PO Summary Report");

    if (array.length === 0) return workbook;

    // Define columns dynamically based on keys
    const columns = Object.keys(array[0]).map((key) => ({
      header: key.toUpperCase(), // Convert headers to uppercase
      key: key,
      width: 20,
    }));

    worksheet.columns = columns;

    // Add data rows
    array.forEach((row) => worksheet.addRow(row));

    // Style the header row (bold + center aligned)
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // Center align all data rows
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
    });

    return workbook;
  };

  const downloadExcelFile = async (workbook, filename) => {
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), filename);
  };

  const handleDownload = () => {
    if (poReportData.length === 0) return;

    const formattedData = poReportData.map((item) => ({
      "Supplier Code": item.spCode,
      "Supplier Name": item.suppName,
      "Item Code": item.itemCode,
      "Item Name": item.itemName,
      "Item Group": item.itemGroup,
      "Previous Rate": Number(Number(item.preRate).toFixed(3)),
      "New Rate": Number(Number(item.newRate).toFixed(3)),
      "Remarks": item.category,
      "Changed Date": item.changedBy,
    }));

    const workbook = arrayToWorksheet(formattedData);
    downloadExcelFile(workbook, "Price_Revision_History_Report.xlsx");
  };

  const isValidDateInRange = (value) => {
    return true; // Simplified for this report
  };




  useEffect(() => {
    // Initialize with the current financial year based on today's date
    const today = new Date();
    const currentYear = today.getFullYear();
    const isAfterApril = today.getMonth() >= 3; // Checks if month is April or later (0-indexed)

    // Set the initial financial year range
    const initialFromDate = isAfterApril
      ? `${currentYear}-04-01`
      : `${currentYear - 1}-04-01`;
    const initialToDate = isAfterApril
      ? `${currentYear + 1}-03-31`
      : `${currentYear}-03-31`;

    setFromDate(initialFromDate);
    // setTodate(initialToDate);
  }, []);

  const handleFromDateChange = (e) => {
    const selectedFromDate = e.target.value;
    setFromDate(selectedFromDate);

    const fromYear = new Date(selectedFromDate).getFullYear();
    const isAfterApril = new Date(selectedFromDate).getMonth() >= 3;

    const financialYearEnd = isAfterApril
      ? `${fromYear + 1}-03-31`
      : `${fromYear}-03-31`;

    // setTodate(financialYearEnd);
  };



  // const columns = [
  //   { field: "spCode", headerName: "Supplier Code", width: 150, align: "center", headerAlign: "center", headerClassName: "super-app-theme--header" },
  //   { field: "suppName", headerName: "Supplier Name", flex: 1, minWidth: 200, align: "center", headerAlign: "center", headerClassName: "super-app-theme--header" },
  //   { field: "itemName", headerName: "Item Name", flex: 1, minWidth: 200, align: "left", headerAlign: "center", headerClassName: "super-app-theme--header" },
  //   {
  //     field: "preRate",
  //     headerName: "Previous Rate",
  //     width: 130,
  //     type: "number",
  //     align: "center",
  //     headerAlign: "center",
  //     headerClassName: "super-app-theme--header",
  //   },
  //   {
  //     field: "newRate",
  //     headerName: "New Rate",
  //     width: 130,
  //     type: "number",
  //     align: "center",
  //     headerAlign: "center",
  //     headerClassName: "super-app-theme--header",
  //   },
  //   { field: "remarks", headerName: "Remarks", flex: 1, minWidth: 120, align: "left", headerClassName: "super-app-theme--header" },
  //   { field: "changedBy", headerName: "Changed Date", width: 150, headerClassName: "super-app-theme--header" },
  // ];
  const columns = [
    {
      field: "spCode",
      headerName: "Supplier Code",
      minWidth: 140,
      flex: 1,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
    },
    {
      field: "suppName",
      headerName: "Supplier Name",
      minWidth: 260,
      flex: 1.6,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "itemCode",
      headerName: "Item Code",
      minWidth: 180,
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "itemName",
      headerName: "Item Name",
      minWidth: 320,
      flex: 2.2,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "itemGroup",
      headerName: "Item Group",
      minWidth: 180,
      flex: 1.2,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "preRate",
      headerName: "Previous Rate",
      minWidth: 120,
      flex: 0.8,
      type: "number",
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
    },
    {
      field: "newRate",
      headerName: "New Rate",
      minWidth: 120,
      flex: 0.8,
      type: "number",
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
    },
    {
      field: "category",
      headerName: "Remarks",
      minWidth: 160,
      flex: 1.2,
      align: "center",
      headerClassName: "super-app-theme--header",
      renderCell: (params) => (
        <div style={{ whiteSpace: "normal", lineHeight: "1.4", textAlign: "center" }}>
          {params.value}
        </div>
      ),
    },
    {
      field: "changedBy",
      headerName: "Changed Date",
      minWidth: 140,
      flex: 1,
      align: "center",
      headerAlign: "center",
      headerClassName: "super-app-theme--header",
    },
  ];

  return (
    <div style={{ margin: "10px" }}>
      <Box
        sx={{
          backgroundColor: "#002d68",
          padding: "10px 15px",
          borderRadius: "8px",
          marginBottom: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          sx={{
            fontFamily: "Roboto Slab",
            fontWeight: "bold",
            color: "#ffffff",
          }}
          variant="h5"
        >
          Price Revision History Report
        </Typography>
      </Box>
      <Card sx={{ minWidth: 275 }}>
        {loading &&
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        }
        <CardContent>
          <Grid container alignItems={"center"} spacing={2}>
            <Grid
              item
              xs={12}
              sm={2}
              md={2}
              lg={2}
            >
              <TextField
                fullWidth
                id="outlined-basic"
                type="date"
                label="From"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  style: { color: "#000000", fontWeight: "bold" },
                }}
                size="small"
                value={fromDate}
                onChange={handleFromDateChange}
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={2}
              md={2}
              lg={2}
            >
              <TextField
                fullWidth
                id="outlined-basic"
                type="date"
                label="To"
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  style: { color: "#000000", fontWeight: "bold" },
                }}
                size="small"
                value={toDate}
                onChange={(e) => setTodate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={3} md={3} lg={3}>
              <Autocomplete
                multiple
                disablePortal
                fullWidth
                options={supplierList}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    label="Select Supplier"
                    onChange={handleSupplierChange}
                  />
                )}
                onChange={(event, value) => handleSupplierSelect(value)}
              />
            </Grid>
            {/* <Grid item xs={12} sm={3} md={3} lg={3}>
              <Autocomplete
                fullWidth
                size="small"
                multiple
                id="item-group-dropdown"
                options={itemGroupLists}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField {...params} label="Selected Item Group" />
                )}
                onChange={(event, value) => handleGroupChange(value)}
              />
            </Grid> */}

            <Grid item xs={12} sm={2} md={2} lg={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<VisibilityIcon />}
                style={{
                  backgroundColor: "#1976d2",
                  borderRadius: "8px",
                  height: "40px",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                onClick={handleReportView}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "View"}
              </Button>
            </Grid>
            <Grid item xs={12} sm={2} md={2} lg={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FileDownloadIcon />}
                style={{
                  backgroundColor: "#2e7d32",
                  borderRadius: "8px",
                  height: "40px",
                }}
                disabled={poReportData.length === 0}
                onClick={handleDownload}
              >
                Excel
              </Button>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <Box
                sx={{
                  height: screenHeight - 350,
                  width: "100%",
                  mt: 2,
                  "& .super-app-theme--header": {
                    backgroundColor: "#93bce6",
                    color: "#1c1919",
                    fontWeight: "bold",
                  },
                }}
              >
                {/* <DataGrid
                  rows={poReportData.map((item, index) => ({ ...item, id: index }))}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  rowHeight={45}
                  columnHeaderHeight={50}
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid #f0f0f0",
                    },
                  }}
                /> */}
                <DataGrid
                  rows={poReportData.map((item, index) => ({ ...item, id: index }))}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 25, 50]}
                  disableSelectionOnClick
                  getRowHeight={() => "auto"}
                  columnHeaderHeight={50}
                  sx={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    "& .MuiDataGrid-cell": {
                      border: '1px solid #969696',
                      borderBottom: "1px solid #f0f0f0",
                      whiteSpace: "normal !important",
                      wordBreak: "break-word",
                      lineHeight: "1.4 !important",
                      display: "flex",
                      alignItems: "center",
                      paddingTop: "8px",
                      paddingBottom: "8px",
                    },
                    "& .MuiDataGrid-cell--alignCenter": {
                      justifyContent: "center",
                      textAlign: "center",
                    },
                    "& .MuiDataGrid-cell--alignLeft": {
                      justifyContent: "flex-start",
                      textAlign: "left",
                    },
                    "& .MuiDataGrid-cell--alignRight": {
                      justifyContent: "flex-end",
                      textAlign: "right",
                    },
                    "& .MuiDataGrid-row": {
                      maxHeight: "none !important",
                    },
                  }}
                />
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
  );
};
export default PriceRevisionHistoryReport;
