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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import { MaintenanceUpdate, MaintenenceAproveReject, showMaintanceDatabyiD } from "../../Services/NodeJsApiServices";
import NotificationBar from "../../Utility/NotificationBar";
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
}) => {
  const [showImages, setShowImages] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationSeverity, setNotificationSeverity] = useState("success");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [rows, setRow] = useState([]);
  const [reason, setreason] = useState("");
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });


  const [openReject, setOpenReject] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [checked, setChecked] = useState(false);
  const [cause,setcause] = useState('');
const [Correction, setCorrection]=useState('');
const [CorrAction,setCorrAction] =useState('')

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
      headerName: "Name",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "Partid",
      headerClassName: "super-app-theme--header",
      headerName: "Part ID",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "UOM",
      headerClassName: "super-app-theme--header",
      headerName: "UOM",
      minWidth: 100,
      flex: 1,
      align: "left",
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
  ];

  useEffect(() => {
    console.log("rowdata==", rowdata);
    open &&
      showMaintanceDatabyiD(
        { id: rowid },
        handleAssignSubShowData,
        handleAssignSubShowDataException
      );
  }, [open]);

  const handleAssignSubShowData = (dataObject) => {
    setRow(dataObject?.data || []);
  };
  const handleAssignSubShowDataException = (errorObject, errorMessage) => {
    console.log(errorMessage);
  };

  const handleAprove = (value) => {
    MaintenenceAproveReject(
      { id: rowid, Approve: value, reason: reason },
      handleAssignSubShowData,
      handleAssignSubShowDataException
    );
    if (value === 1) {
      setNotificationMessage("Approved");
      setNotificationSeverity("success");
    } else {
      setNotificationMessage("Rejected");
      setNotificationSeverity("error");
    }
    setNotificationOpen(true);
    handleClose();
  };

  const   handelupdate =()=>{
    MaintenanceUpdate({   
       id:rowid,
      cause: cause,
      correction: Correction,
      corrective_action: CorrAction},handelMaintupdate,handelexception)
  }


  const handelMaintupdate=(dataObject)=>{

    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      setOpenUpdate(false);
    }, 2000);

  }

  const handelexception=()=>{
    
  }

  return (
    <div>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "72%", maxHeight: "100%" } }}
        maxWidth="lg" 
        open={open}
      >
        <form>
          <DialogTitle style={{ background: "#051622", color: "white" }}>
            Estimated Cost For Maintenance
          </DialogTitle>
          <DialogContent>

          <Card style={{ marginTop: '10px', padding: '16px' }}>
    <CardContent>
      <Grid container spacing={2}>
      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
        <TextField
            margin="User"
            label="User"
            type="text"
            fullWidth
            variant="outlined"
            value={rowdata?.users || ''}
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
      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}>
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
                  style={{ height: "270px" }}
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
                        style={{ background: "#051622", color: "white" }}
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
                Update
              </Button>
            )}

            
            <Dialog
              open={openUpdate}
              onClose={handleCloseUpdate}
              sx={{ "& .MuiDialog-paper": { width: "32%", maxHeight: "100%" } }}
              maxWidth="lg"
            >
              <DialogTitle style={{ background: "#051622", color: "white" }}>
                Update
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2} style={{ marginTop: "10px" }}>
                  <Grid item xs={12}>
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
                  </Grid>
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
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
                  Update
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
      handleClose={handleClose}
      notificationContent={openNotification.message}
      openNotification={openNotification.status}
      type={openNotification.type}
    />
      </Dialog>
    </div>
  );
};
