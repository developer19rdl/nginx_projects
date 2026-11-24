import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Box,
  Typography,
  InputLabel,
  Snackbar,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { DamageDeleteType, MaintenanceDamagedPart, MaintenanceEditDamagedPart, MaintenanceEditReplacedPart, MaintenanceReplacedPart, MaintenanceUpdate, MaintenenceAproveReject, MaintenenceDamagedList, MaintenenceReplacementList, PartsDelete, ReplaceDeleteType, showMaintanceDatabyiD } from "../../Services/NodeJsApiServices";
import NotificationBar from "../../Utility/NotificationBar";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import DeleteConfirmationDailog from "../UserComponent/SubUserComponent/DeleteConfirmationDailog";
// import {
//   MaintenenceAproveReject,
//   showMaintanceDatabyiD,
// } from "../../../services/LoginServiceNod";


export const PendingView = ({
  open,
  setOpen,
  rowid,
  setRowid,
  rowdata,
  setrowdata,
  ison,
  index,
  setRefresh

}) => {
  const [showImages, setShowImages] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState("success");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [damagedList, setDamagedList] = useState([]);
  const [replacedlist, setReplacedList] = useState([]);
  const [reason, setreason] = useState("");
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });
  const [refreshData, setRefreshData] = useState(false);

  const [openReject, setOpenReject] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cause, setcause] = useState('');
  const [Correction, setCorrection] = useState('');
  const [CorrAction, setCorrAction] = useState('')
  const [DmpartName, setDmPartName] = useState('');
  const [DmQuantity, setDMQuantity] = useState('');
  const [RepartName, setREPartName] = useState('')
  const [ReQuantity, setREQuantity] = useState('')
  const [showDataGrid, setShowDataGrid] = useState(false);
  const [rows, setRow] = useState([]);
  const [showDataGridPart, setShowDataGridPart] = useState(false);
  const [isAddButton, setIsAddButton] = useState(true);
  const [isAddButtonReplace, setIsAddButtonReplace] = useState(true);
  const [id, setId] = useState('')
  const [replaceid, setReplaceId] = useState('')
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const [deleteDamageDailogOpen, setDeleteDamageDailogOpen] = useState(false);
  const [deleteReplaceDailogOpen, setDeleteReplaceDailogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [ReplacedeleteId, setReplaceDeleteId] = useState('');
  const [damagedDeleteId, setDamagedDeleteId] = useState('');

  const handleCheckboxChange = (event) => {
    setChecked(event.target.checked);
  };

  const handleClickOpenReject = () => {
    setOpenReject(true);
  };

  const handleCloseReject = () => {
    setOpenReject(false);
  };

  const handleApprove = (id) => {
    // Your approval logic here
    console.log(`Approved item with id: ${id}`);
    handleClose();
  };

  const handleClickOpenUpdate = () => {
    setOpenUpdate(true);
  };

  const handleCloseUpdate = () => {
    setOpenUpdate(false);
    setDmPartName('');
    setDMQuantity('');
    setREPartName('');
    setREQuantity('');
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotificationOpen(false);
  };

  const handleClose = () => {
    setOpen(false);

  };
  const handleClose1 = () => {
    setNotification(false)

  };


  const toggleImages = () => {
    setShowImages(!showImages);
  };

  const columns = [
    {
      field: "id",
      headerClassName: "super-app-theme--header",
      headerName: "ID",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "Name",
      headerClassName: "super-app-theme--header",
      headerName: "PartName",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Quantity",
      headerClassName: "super-app-theme--header",
      headerName: "Quantity",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "Unitprice",
      headerClassName: "super-app-theme--header",
      headerName: "Unit Price",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      headerAlign: 'center',
      // width: 180,
      flex: 1,
      align: 'center',
      cellClassName: 'actions',
      getActions: (params) => [
        <EditData selectedRow={params.row} />,
        <DeleteData selectedRow={params.row} />,
        // <Password selectedRow={params.row} />,
      ],
    },
  ];


  const columns2 = [
    {
      field: "id",
      headerClassName: "super-app-theme--header",
      headerName: "ID",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },

    {
      field: "damagedPartName",
      headerClassName: "super-app-theme--header",
      headerName: "Damaged PartName",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "quantity",
      headerClassName: "super-app-theme--header",
      headerName: "Quantity",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      headerAlign: 'center',
      // width: 180,
      flex: 1,
      align: 'center',
      cellClassName: 'actions',
      getActions: (params) => [
        <EditData selectedRow={params.row} />,
        <DamageDeleteData selectedRow={params.row} />,
        // <Password selectedRow={params.row} />,
      ],
    },
  ];


  const columns1 = [
    {
      field: "id",
      headerClassName: "super-app-theme--header",
      headerName: "ID",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "replacementPartName",
      headerClassName: "super-app-theme--header",
      headerName: "Replacement Part Name",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "quantity",
      headerClassName: "super-app-theme--header",
      headerName: "Quantity",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      headerAlign: 'center',
      // width: 180,
      flex: 1,
      align: 'center',
      cellClassName: 'actions',
      getActions: (params) => [
        <EditDataReplace selectedRow={params.row} />,
        <ReplaceDeleteData selectedRow={params.row} />,
        // <Password selectedRow={params.row} />,
      ],
    },

  ];
  const EditData = (params) => {
    return (
      <Tooltip title='Edit'>
        <EditIcon
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            // setEditDamage(params.selectedRow);
            setId(params.selectedRow.id || '');
            setDmPartName(params.selectedRow.damagedPartName || '');
            setDMQuantity(params.selectedRow.quantity || '');
          }}
          style={{ cursor: 'pointer', color: '#18143D' }}
        />
      </Tooltip>
    )
  };

  const DeleteData = (params) => {
    return (
      <Tooltip title='Delete'>
        <DeleteIcon
          onClick={(event) => {
            event.stopPropagation();
            setDeleteDailogOpen(true);
            setDeleteId(params.selectedRow.id);
            // OperatorDelete();
          }}
          style={{ cursor: 'pointer', color: '#18143D' }}
        />
      </Tooltip>
    )
  };

  const EditDataReplace = (params) => {
    return (
      <Tooltip title='EditReplace'>
        <EditIcon
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButtonReplace(false);
            setReplaceId(params.selectedRow.id || '');
            setREPartName(params.selectedRow.replacementPartName || '');
            setREQuantity(params.selectedRow.quantity || '');
          }}
          style={{ cursor: 'pointer', color: '#18143D' }}
        />
      </Tooltip>
    )
  };

  const ReplaceDeleteData = (params) => {
    return (
      <Tooltip title='ReplaceDelete'>
        <DeleteIcon
          onClick={(event) => {
            event.stopPropagation();
            setDeleteReplaceDailogOpen(true);
            setReplaceDeleteId(params.selectedRow.id);
            // OperatorDelete();

          }}
          style={{ cursor: 'pointer', color: '#18143D' }}
        />
      </Tooltip>
    )
  };


  const DamageDeleteData = (params) => {
    return (
      <Tooltip title='ReplaceDelete'>
        <DeleteIcon
          onClick={(event) => {
            event.stopPropagation();
            setDeleteDamageDailogOpen(true);
            setDamagedDeleteId(params.selectedRow.id);
            // OperatorDelete();

          }}
          style={{ cursor: 'pointer', color: '#18143D' }}
        />
      </Tooltip>
    )
  };


  useEffect(() => {
    console.log("rowdata==", rowdata);
    if (open) {
      showMaintanceDatabyiD(
        { id: rowid },
        handleAssignSubShowData,
        handleAssignSubShowDataException
      );
      MaintenenceDamagedList(
        { id: rowid },
        handleDamagedList,
        handleDamagedListException
      );
      MaintenenceReplacementList(
        { id: rowid },
        handleReplacedList,
        handleReplacedListException
      );
    }
    // loadData();

  }, [open, refreshData,]);

  const handleAssignSubShowData = (dataObject) => {
    setRow(dataObject?.data || []);
  };


  const handleAssignSubShowDataException = (errorObject, errorMessage) => {
    console.log(errorMessage);
  };

  const handleDamagedList = (dataObject) => {

    setDamagedList(dataObject?.data || []);
  };
  const handleDamagedListException = (errorObject, errorMessage) => {
    console.log(errorMessage);
  };

  const handleReplacedList = (dataObject) => {
    setReplacedList(dataObject?.data || []);
  };
  const handleReplacedListException = (errorObject, errorMessage) => {
    console.log(errorMessage);
  };

  const [buttonStatus, setButtonStatus] = useState('')
  const handleAprove = (value) => {
    console.log("handleAprovehandleAprove",value)
    setButtonStatus(value)
    // if (value === 1) {
    //   setNotificationMessage("Approved Success");
    //   setNotificationSeverity("success");
    // } else {
    //   setNotificationMessage("Rejected Success");
    //   setNotificationSeverity("error");
    // }

    MaintenenceAproveReject(
      { id: rowid, Approve: value, reason: reason },
      // handleAssignSubShowData,
      // handleAssignSubShowDataException
      handleApproveRejectSuccuss,
      handleApproveRejectException
    );
    // setNotificationOpen(true);
  };

  const handleApproveRejectSuccuss = () => {
    setRefresh(prev => !prev)
    console.log("handleAprovehandleAprove",buttonStatus)
    setNotification({
      status: true,
      type: 'success',
      message: Number(buttonStatus) === 1 ? "Approved Success" : "Rejected Success",
    });
    setTimeout(() => {
      handleClose();
    }, 2000)
  };

  const handleApproveRejectException = () => {
    setNotification({
      status: true,
      type: "error",
      message: "An error occurred.",
    });
  };

  const handelupdate = () => {
    MaintenanceUpdate({
      id: rowid,
      cause: cause,
      correction: Correction,
      corrective_action: CorrAction
    }, handelMaintupdate, handelexception)
  }


  const handelMaintupdate = (dataObject) => {

    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      setOpenUpdate(false);
      setOpen(prev => !prev);
    }, 2000);
    setRefresh(pre =>!pre)

  }

  const handelexception = () => {

  };
  const AddDamagedParts = () => {
    if (isAddButton) {
      MaintenanceDamagedPart({
        id: rowid,
        damagedPartName: DmpartName,
        quantity: DmQuantity,
      }, handeldamagedPartSuccess, handeldamagedPartexception)
    } else {
      MaintenanceEditDamagedPart({
        // id: rowid,
        id,
        damagedPartName: DmpartName,
        quantity: DmQuantity,
      }, handeldamagedPartSuccess, handeldamagedPartexception)
    }
  };

  const handeldamagedPartSuccess = (dataObject) => {
    setRefreshData((oldvalue) => !oldvalue);
    setIsAddButton(true);
    setDmPartName('');
    setDMQuantity('');
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      // setOpenUpdate(false);
    }, 2000);
  };

  const handeldamagedPartexception = () => {

  }

  const AddReplacementParts = () => {
    // setShowDataGridPart(true);
    if (isAddButtonReplace) {
      MaintenanceReplacedPart({
        id: rowid,
        replacementPartName: RepartName,
        quantity: ReQuantity,
      }, handelReplacePartSuccess, handelReplacePartexception)
    }
    else {
      MaintenanceEditReplacedPart({
        id: replaceid,
        replacementPartName: RepartName,
        quantity: ReQuantity,
      }, handelReplacePartSuccess, handelReplacePartexception)
    };
  }

  const handelReplacePartSuccess = (dataObject) => {
    setRefreshData((oldvalue) => !oldvalue);
    setIsAddButtonReplace(true)
    setREPartName('');
    setREQuantity('');
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      // setOpenUpdate(false);
    }, 2000);
  };

  const handelReplacePartexception = () => {

  };
  const RoleDelete = (id) => {
    PartsDelete({ id }, RoleDeleteSuccess, RoleDeleteException)
  };


  const RoleDeleteSuccess = (dataObject) => {
    setDeleteDailogOpen(false);
    setRefreshData((oldvalue) => !oldvalue)


  };

  const RoleDeleteException = (dataObject) => {

  };

  
  const ReplaceDelete = (id) => {
    ReplaceDeleteType({ id }, ReplaceDeleteSuccess, ReplaceDeleteException)
  };

  const ReplaceDeleteSuccess = (dataObject) => {
    setDeleteDamageDailogOpen(false);
    setRefreshData((oldvalue) => !oldvalue)
  };

  const ReplaceDeleteException = (dataObject) => {

  };


  const DamageDelete = (id) => {
    DamageDeleteType({ id }, DamageDeleteSuccess, DamageDeleteException)
  };

  const DamageDeleteSuccess = (dataObject) => {
    setDeleteReplaceDailogOpen(false);
    setRefreshData((oldvalue) => !oldvalue)
  };

  const DamageDeleteException = (dataObject) => {

  };

  return (
    <div>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "72%", maxHeight: "100%" } }}
        maxWidth="lg"
        open={open}
      >
        <form>
          <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
            Estimated Cost For Maintenance
          </DialogTitle>
          <DialogContent>

            <Card style={{ marginTop: '10px', padding: '16px' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <TextField
                      margin="User"
                      label="Assigned Supervisor"
                      type="text"
                      fullWidth
                      variant="outlined"
                      // value={rowdata?.users || ''}
                      value={rowdata?.userName || ''}
                      userName
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <TextField
                      margin="Category"
                      label="Category"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.Category_name || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <TextField
                      margin="Nature of Problem"
                      label="Nature of Problem"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.Nature_problem || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  {/* <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <TextField
                      margin="Machine Affected"
                      label="Machine Affected"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.AffectedMachine || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid> */}
                 <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
                    <TextField
                      margin="Asset Name"
                      label="Asset Name"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.assetName || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>

                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                    <TextField
                      margin="Utilization Plan"
                      label="Utilization Plan"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.type1 || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                    <TextField
                      margin="Affecting Man Hours"
                      label="Affecting Man Hours"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.AffdManHours || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                    <TextField
                      margin="Utilization Plan"
                      label="Utilization Plan"
                      type="text"
                      fullWidth
                      variant="outlined"
                      value={rowdata?.type2 || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                    />
                  </Grid>
                </Grid>


              </CardContent>
            </Card>

            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={5}
                  checkboxSelection
                  sx={{
                    height: 238,

                    '& .MuiDataGrid-columnHeaders': {
                      color: '#000000', // Header text color
                      fontWeight: 'bold', // Header font weight
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                      fontWeight: 'bold', // Ensures the header font weight is bold
                    },
                  }}
                  disableSelectionOnClick
                />
              </Grid>
            </Grid>


            <Grid container spacing={2} style={{ marginTop: "10px" }}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <RemoveRedEyeIcon
                    sx={{ marginRight: "10px", cursor: "pointer" }}
                    onClick={toggleImages}
                  />
                  <Typography variant="subtitle1">
                    Breakdown Parts Images
                  </Typography>
                </Box>
              </Grid>
              {showImages && (
                <Grid container spacing={2} marginTop="10px">
                  <Grid item xs={3}>
                    <img
                      src={`${process.env.REACT_APP_IMAGE_URL}/${rowdata.BrkImages1}`} alt="Image 1" width="100%" />
                  </Grid>
                  <Grid item xs={3}>
                    <img
                      src={`${process.env.REACT_APP_IMAGE_URL}/${rowdata.BrkImages2}`}
                      alt="Image 1"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <img
                      src={`${process.env.REACT_APP_IMAGE_URL}/${rowdata.BrkImages3}`}
                      alt="Image 1"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <img
                      src={`${process.env.REACT_APP_IMAGE_URL}/${rowdata.BrkImages4}`}
                      alt="Image 1"
                      width="100%"
                    />
                  </Grid>
                </Grid>
              )}
              {!ison && (
                <Grid container spacing={2} style={{ margin: "20px" }}>
                  <Grid item>
                    <Button
                      variant="contained"
                      style={{ background: "#051622", color: "white" }}
                      onClick={() => handleAprove(1)}
                    >
                      Approve
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      style={{ background: "#051622", color: "white" }}
                      onClick={handleClickOpenReject}
                    >
                      Reject
                    </Button>
                    <Dialog
                      open={openReject}
                      onClose={handleCloseReject}
                      sx={{
                        "& .MuiDialog-paper": {
                          width: "32%",
                          maxHeight: "100%",
                        },
                      }}
                      maxWidth="lg"
                    >
                      <DialogTitle
                        sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}

                      >
                        Reason
                      </DialogTitle>
                      <DialogContent>
                        <Grid
                          container
                          spacing={2}
                          style={{ marginTop: "10px" }}
                        >
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              id="outlined-multiline-static"
                              label="Reason"
                              placeholder="Section"
                              value={reason}
                              multiline
                              rows={4}
                              defaultValue="Default Value"
                              onChange={(e) => {
                                setreason(e.target.value);
                              }}
                            />
                          </Grid>
                        </Grid>
                      </DialogContent>
                      <DialogActions>
                        <Button
                          onClick={handleCloseReject}
                          variant="contained"
                          style={{ background: "#051622", color: "white" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleAprove(2)}
                          variant="contained"
                          style={{ background: "#051622", color: "white" }}
                        >
                          Submit
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions style={{ justifyContent: "flex-end" }}>
            {index === 0 && (
              <Button
                variant="contained"
                style={{ background: "#051622", color: "white" }}
                onClick={handleClickOpenUpdate}
              >
                Complete Maintenance
              </Button>
            )}


            <Dialog
              open={openUpdate}
              // onClose={handleCloseUpdate}
              sx={{ "& .MuiDialog-paper": { width: "52%", maxHeight: "100%" } }}
              maxWidth="lg"
            >
              <DialogTitle style={{ background: "#051622", color: "white" }}>
                Update
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} style={{ marginTop: "10px" }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Problem Category"
                      placeholder="Cause"
                      variant="outlined"
                      // onChange={(e) => {
                      // const value = e.target.value;
                      // Only allow alphanumeric characters and spaces
                      // const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                      // setcause(filteredValue);
                      // }}
                      // value={cause}
                      value={rowdata?.Category_name || ''}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Cause"
                      placeholder="Cause"
                      variant="outlined"
                      // onChange={(e) => {
                      // const value = e.target.value;
                      // Only allow alphanumeric characters and spaces
                      // const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                      // setcause(filteredValue);
                      // }}
                      value={rowdata?.Nature_problem || ''} />
                  </Grid>
                  {/* <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Cause"
                      placeholder="Cause"
                      variant="outlined"
                      onChange={(e) => {
                      const value = e.target.value;
                      // Only allow alphanumeric characters and spaces
                      const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                      setcause(filteredValue);
                      }}
                      value={cause}
                    />
                  </Grid> */}
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Correction"
                      placeholder="Correction"
                      variant="outlined"
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric characters and spaces
                        const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                        setCorrection(filteredValue);
                      }}
                      value={Correction}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Corrective Action"
                      placeholder="Corrective Action"
                      variant="outlined"
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric characters and spaces
                        const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                        setCorrAction(filteredValue);
                      }}
                      value={CorrAction}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Damaged Parts
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Part Name"
                      value={DmpartName}
                      autoComplete="off"
                      onChange={(e) => {
                        setDmPartName(e.target.value)
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={DmQuantity}
                      autoComplete="off"
                      onChange={(e) => {
                        setDMQuantity(e.target.value)
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} style={{ display: 'flex', justifyContent: "flex-end" }}>

                    <Button
                      onClick={AddDamagedParts}
                      variant="contained"
                      style={{ background: "#051622", color: "white" }}
                    >
                      {isAddButton ? 'Add' : 'Update'}
                    </Button>
                  </Grid>

                  {
                    damagedList.length > 0 && (
                      <Grid container spacing={2} style={{ marginTop: "5px" }}>
                        <Grid item xs={12}>
                          <DataGrid
                            rows={damagedList}
                            columns={columns2}
                            pageSize={5}
                            sx={{
                              height: 200,
                              '& .MuiDataGrid-columnHeaders': {
                                color: '#000000', // Header text color
                                fontWeight: 'bold', // Header font weight
                              },
                              '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold', // Ensures the header font weight is bold
                              },
                            }}
                            disableSelectionOnClick
                          />
                        </Grid>

                      </Grid>)}

                  <Grid item xs={12}>
                    <Typography style={{ fontWeight: 'bold' }}>
                      Replacement Parts
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Part Name"
                      value={RepartName}
                      autoComplete="off"
                      onChange={(e) => {
                        setREPartName(e.target.value)
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Quantity"
                      value={ReQuantity}
                      autoComplete="off"
                      onChange={(e) => {
                        setREQuantity(e.target.value)
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} style={{ display: 'flex', justifyContent: "flex-end" }}>

                    <Button
                      onClick={AddReplacementParts}
                      variant="contained"
                      style={{ background: "#051622", color: "white" }}
                    >
                      {isAddButtonReplace ? 'Add' : 'Update'}
                    </Button>
                  </Grid>

                  {
                    replacedlist.length > 0 && (
                      <Grid container spacing={2} style={{ marginTop: "5px" }}>
                        <Grid item xs={12}>
                          <DataGrid
                            rows={replacedlist}
                            columns={columns1}
                            pageSize={5}
                            sx={{
                              height: 200,
                              '& .MuiDataGrid-columnHeaders': {
                                color: '#000000', // Header text color
                                fontWeight: 'bold', // Header font weight
                              },
                              '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold', // Ensures the header font weight is bold
                              },
                            }}
                            disableSelectionOnClick
                          />
                        </Grid>

                      </Grid>
                    )}

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={handleCheckboxChange}
                          name="checkedA"
                          color="primary"
                        />
                      }
                      label="Mark as Completed"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handelupdate}
                    variant="contained"
                    style={{ background: "#051622", color: "white" }}
                  >
                    Submit
                  </Button>
                  <Button
                    onClick={handleCloseUpdate}
                    variant="contained"
                    style={{ background: "#051622", color: "white" }}
                  >
                    Cancel
                  </Button>
                </DialogActions>
            </Dialog>
            <Button
              onClick={handleClose}
              variant="contained"
              style={{ background: "#051622", color: "white" }}
            >
              Cancel
            </Button>
          </DialogActions>
        </form>
        <Snackbar
          open={notificationOpen}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          message={notificationMessage}
          severity={notificationSeverity}
        />
        <NotificationBar
          handleClose={handleClose1}
          notificationContent={openNotification.message}
          openNotification={openNotification.status}
          type={openNotification.type}
        />
        <DeleteConfirmationDailog
          open={deleteDailogOpen}
          setOpen={setDeleteDailogOpen}
          deleteId={deleteId}
          deleteService={RoleDelete}
          handleSuccess={RoleDeleteSuccess}
          handleException={RoleDeleteException}
        />
        <DeleteConfirmationDailog
          open={deleteReplaceDailogOpen}
          setOpen={setDeleteReplaceDailogOpen}
          deleteId={ReplacedeleteId}
          deleteService={ReplaceDelete}
          handleSuccess={ReplaceDeleteSuccess}
          handleException={ReplaceDeleteException}
        />
         <DeleteConfirmationDailog
          open={deleteDamageDailogOpen}
          setOpen={setDeleteDamageDailogOpen}
          deleteId={damagedDeleteId}
          deleteService={DamageDelete}
          handleSuccess={DamageDeleteSuccess}
          handleException={DamageDeleteException}
        />
      </Dialog>
    </div>
  );
};
