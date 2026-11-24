import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  DepartmentShowdata,
  FetchAssetTypeSec,
  FetchAsstTypeAsset,
  ServiceDueView,
} from "../../../Services/NodeJsApiServices";
import NotificationBar from "../../../Utility/NotificationBar";

const AmcServiceDue = ({ Arows, setARows, setamCount }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [department, setDepartment] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  const [section, setSection] = useState("");
  const [sectionList, setSectionList] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [assetTypeList, setAssetTypeList] = useState([]);
  const [rows, setRows] = useState([]);
  const [openNotification, setNotification] = useState({
    status: false,
    type: "error",
    message: "",
  });

  const columns = [
    {
      field: "VendorName",
      headerClassName: "super-app-theme--header",
      headerName: "Vendor Name",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MName",
      headerName: "Asset Name",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "PeriodTo",
      headerName: "Service Due Date",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
  ];

  // Load departments and initial service due data on mount
  useEffect(() => {
    DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
    ServiceDueView(
      { fromDate, toDate, Department: department, Section: section, AssetType: assetType },
      handleServiceDueView2,
      handleServiceDueViewException2
    );
  }, []);

  const handleServiceDueView2 = (dataObject) => {
    const data = Array.isArray(dataObject?.data) ? dataObject.data : [];
    setRows(data);
    if (setamCount) setamCount(data.length);
  };

  const handleServiceDueViewException2 = (_errorStatus, errorMessage) => {
    setNotification({ status: true, type: "error", message: errorMessage });
  };

  const handleDepartmentshow = (dataObject) => {
    setDepartmentList(dataObject?.data || []);
  };

  const handleDepartmentshowException = (_error, _errorMessage) => {};

  const onDepartmentChange = (e) => {
    setDepartment(e.target.value);
    setSection("");
    setSectionList([]);
    setAssetType("");
    setAssetTypeList([]);
    FetchAssetTypeSec({ id: e.target.value }, handleSectionSuccess, handleSectionException);
  };

  const handleSectionSuccess = (dataObject) => {
    setSectionList(dataObject?.data || []);
  };

  const handleSectionException = (_error, _errorMessage) => {};

  const onSectionChange = (e) => {
    setSection(e.target.value);
    setAssetType("");
    setAssetTypeList([]);
    FetchAsstTypeAsset({ id: e.target.value }, handleAsseTypeSuccess, handleAsseTypeException);
  };

  const handleAsseTypeSuccess = (dataObject) => {
    setAssetTypeList(dataObject?.data || []);
  };

  const handleAsseTypeException = (_error, _errorMessage) => {};

  const onAssetTypeChange = (e) => {
    setAssetType(e.target.value);
  };

  const onServiceDueReport = () => {
    ServiceDueView(
      { fromDate, toDate, Department: department, Section: section, AssetType: assetType },
      handleServiceDueView,
      handleServiceDueViewException
    );
  };

  const handleServiceDueView = (dataObject) => {
    const data = Array.isArray(dataObject?.data) ? dataObject.data : [];
    if (setARows) setARows(data);
    if (setamCount) setamCount(data.length);
  };

  const handleServiceDueViewException = (_errorStatus, errorMessage) => {
    setNotification({ status: true, type: "error", message: errorMessage });
  };

  const handleClose = () => {
    setNotification({ status: false, type: "", message: "" });
  };

  // Prefer parent-supplied rows (Arows) when available; fall back to local state
  const displayRows = Array.isArray(Arows) && Arows.length > 0 ? Arows : rows;

  return (
    <div>
      <Grid container spacing={2} style={{ marginTop: "10px" }}>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <TextField
            fullWidth
            label="From Date"
            variant="outlined"
            required
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <TextField
            fullWidth
            label="To Date"
            variant="outlined"
            required
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="dept-label">Department</InputLabel>
            <Select
              labelId="dept-label"
              label="Department"
              value={department}
              required
              onChange={onDepartmentChange}
            >
              {departmentList.map((data, index) => (
                <MenuItem value={data.id} key={index}>
                  {data.departmentName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="section-label">Section</InputLabel>
            <Select
              labelId="section-label"
              label="Section"
              value={section}
              required
              onChange={onSectionChange}
            >
              <MenuItem value="">
                <em>{sectionList.length > 0 ? "Select Section" : "Select Department first"}</em>
              </MenuItem>
              {sectionList.map((data, index) => (
                <MenuItem value={data.id} key={index}>
                  {data.Section}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="assettype-label">Asset Type</InputLabel>
            <Select
              labelId="assettype-label"
              label="Asset Type"
              value={assetType}
              onChange={onAssetTypeChange}
            >
              <MenuItem value="">
                <em>{assetTypeList.length > 0 ? "Select Asset Type" : "Select Section first"}</em>
              </MenuItem>
              {assetTypeList.map((data, index) => (
                <MenuItem value={data.id} key={index}>
                  {data.AssetTypeView}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12} sm={2} md={2} lg={2} xl={2}
          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Button
            variant="contained"
            style={{ width: "130px", background: "#051622", color: "white" }}
            onClick={onServiceDueReport}
          >
            View
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2} style={{ marginTop: "18px" }}>
        <Grid item xs={12} md={12} style={{ height: 300, width: "100%" }}>
          <Typography
            variant="h6"
            component="h2"
            align="left"
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              backgroundColor: "#f8f8ff",
              padding: "15px",
              border: "1px solid #e0e0e0",
              color: "#000000",
              fontWeight: "bold",
            }}
          >
            SERVICE DUE DATES
          </Typography>
          <DataGrid
            rows={displayRows}
            columns={columns}
            pageSize={8}
            rowsPerPageOptions={[8]}
            disableSelectionOnClick
            getRowId={(row) => row.id ?? row.AMC_ID ?? row.ServiceId}
            sx={{
              "& .MuiDataGrid-columnHeaders": { color: "#000000", fontWeight: "bold" },
              "& .MuiDataGrid-columnHeaderTitle": { fontWeight: "bold" },
            }}
          />
        </Grid>
        <NotificationBar
          handleClose={handleClose}
          notificationContent={openNotification.message}
          openNotification={openNotification.status}
          type={openNotification.type}
        />
      </Grid>
    </div>
  );
};

export default AmcServiceDue;
