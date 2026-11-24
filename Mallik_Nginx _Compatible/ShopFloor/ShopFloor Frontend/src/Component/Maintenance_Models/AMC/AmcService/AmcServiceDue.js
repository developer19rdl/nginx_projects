import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import {
  DepartmentShowdata,
  FetchAssetTypeSec,
  FetchAsstNameAsset,
  FetchAsstTypeAsset,
  ServiceDueView,
} from "../../../../services/LoginServiceNod";
import { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import NotificationBar from "../../../notification/ServiceNotificationBar";

const AmcServiceDue = ({ amcount, Arows, setARows, setamCount }) => {
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
      headerName: "Name",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },

    {
      field: "MachineName",
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

  function EditData(props) {
    return (
      <Tooltip title="Edit">
        <EditIcon
          style={{ cursor: "pointer" }}
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            setEditVendor(props.selectedRow);
            setOpen(true);
          }}
        />
      </Tooltip>
    );
  }

  function DeleteData(props) {
    return (
      <Tooltip title="Delete">
        <DeleteIcon
          style={{ color: "#012738", cursor: "pointer" }}
          onClick={() => {
            setDeleteId(props.selectedRow.id);
            console.log(props.selectedRow.id);
            setDeleteDailogOpen(true);
          }}
        />
      </Tooltip>
    );
  }

  useEffect(() => {
    DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
    ServiceDueView(
      {
        fromDate: fromDate,
        toDate: toDate,
        Department: department,
        Section: section,
        AssetType: assetType,
      },
      handleServiceDueView2,
      handleServiceDueViewException2
    );
  }, []);

  const handleServiceDueView2 = (dataObject) => {
    const data = dataObject.data || [];
    setRows(dataObject.data);
    const count = data.length; // Count the data
    console.log("length==", count); // Log the count here
    setamCount(count);
  };

  const handleServiceDueViewException2 = (errorStaus, errorMessage) => {
    console.log(errorMessage);
    setNotification({
      status: true,
      type: "error",
      message: errorMessage,
    });
  };

  const handleDepartmentshow = (dataObject) => {
    setDepartmentList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleDepartmentshowException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const onDepartmentChange = (e) => {
    setDepartment(e.target.value);
    FetchAssetTypeSec(
      { id: e.target.value },
      handleSectionSuccess,
      handleSectionException
    );
  };

  const handleSectionSuccess = (dataObject) => {
    setSectionList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleSectionException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const onSectionChange = (e) => {
    setSection(e.target.value);
    FetchAsstTypeAsset(
      { id: e.target.value },
      handleAsseTypeSuccess,
      handleAsseTypeException
    );
  };

  const handleAsseTypeSuccess = (dataObject) => {
    setAssetTypeList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleAsseTypeException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const onAssetTypeChange = (e) => {
    setAssetType(e.target.value);
    FetchAsstNameAsset(
      { id: e.target.value },
      handleAsstNameSuccess,
      handleAsstNameException
    );
  };

  const handleAsstNameSuccess = (dataObject) => {
    setAssetNameList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleAsstNameException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const onServiceDueReport = () => {
    ServiceDueView(
      {
        fromDate: fromDate,
        toDate: toDate,
        Department: department,
        Section: section,
        AssetType: assetType,
      },
      handleServiceDueView,
      handleServiceDueViewException
    );
  };

  const handleServiceDueView = (dataObject) => {
    const data = dataObject.data || [];
    setARows(dataObject.data);
    const count = data.length; // Count the data
    console.log("length==", count); // Log the count here
    setamCount(count);
  };

  const handleServiceDueViewException = (errorStaus, errorMessage) => {
    console.log(errorMessage);
    setNotification({
      status: true,
      type: "error",
      message: errorMessage,
    });
  };

  const handleClose = () => {
    setNotification({
      status: false,
      type: "",
      message: "",
    });
  };

  return (
    <div>
      <Grid container spacing={2} style={{ marginTop: "10px" }}>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <TextField
            fullWidth
            label="From Date "
            placeholder="From Date"
            variant="outlined"
            required
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <TextField
            fullWidth
            label="To Date "
            placeholder="To Date"
            variant="outlined"
            required
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Department</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Department"
              placeholder="Department"
              value={department}
              required
              onChange={(e) => onDepartmentChange(e)}
            >
              {departmentList?.map((data, index) => {
                return (
                  <MenuItem value={data.id} key={index}>
                    {data.Department}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Section</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Section"
              placeholder="Section"
              value={section}
              required
              onChange={(e) => onSectionChange(e)}
            >
              {sectionList.length !== 0 ? (
                <MenuItem value="" key={0}>
                  <em>Select Section</em>
                </MenuItem>
              ) : (
                <MenuItem value="" key={0}>
                  <em>Select Department </em>
                </MenuItem>
              )}
              {sectionList?.map((data, index) => {
                return (
                  <MenuItem value={data.id} key={index}>
                    {data.Section}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Asset Type"
              placeholder="Asset Type"
              value={assetType}
              onChange={(e) => onAssetTypeChange(e)}
            >
              {assetTypeList.length !== 0 ? (
                <MenuItem value="" key={0}>
                  <em>Select Asset Type</em>
                </MenuItem>
              ) : (
                <MenuItem value="" key={0}>
                  <em>Select Section </em>
                </MenuItem>
              )}
              {assetTypeList?.map((data, index) => {
                return (
                  <MenuItem value={data.id} key={index}>
                    {data.AssetTypeView}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={2} md={2} lg={2} xl={2}>
          <Button variant="contained" 
          style={{ width: '130px', background: '#051622', color: 'white' }}
          onClick={onServiceDueReport}>
            View
          </Button>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        <Grid item xs={12} md={12}>
          {/* <Box
            style={{
              padding: "16px",
              background: "#F7F7F7",
              color: "black",
              borderRadius: "8px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          > */}
            {/* Adding a title using Typography */}
            <Typography variant="h6" component="h2" align="left" style={{ fontWeight: 'bold' }}>
              SERVICE DUE DATES
            </Typography>


          {/* </Box> */}
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          style={{ marginLeft: "10px", overflow: "scroll", marginRight: "5px" }}
        >
          {Arows ? (
            <DataGrid
              rows={Arows}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8]}
              disableSelectionOnClick
              sx={{
                height: "380px",
                width: "100%",
                "& .super-app-theme--header": {
                  WebkitTextStrokeWidth: "0.6px",
                },
              }}
            />
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8]}
              disableSelectionOnClick
              sx={{
                height: "480px",
                width: "100%",
                "& .super-app-theme--header": {
                  WebkitTextStrokeWidth: "0.6px",
                },
              }}
            />
          )}
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
