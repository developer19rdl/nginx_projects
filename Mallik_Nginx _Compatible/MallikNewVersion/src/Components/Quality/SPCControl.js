import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import NotificationBar from "../GlobleFiles/ServiceNotificationBar";
import {
  SPQcControlChartData,
  SPQcControlChartAdd,
  SPQcControlChartUpdate,
  SPQcControlChartDelete,
} from "../../ApiService/LoginPageService";

const SPCControl = () => {
  // Form Dialog States
  const [open, setOpen] = useState(false);

  // Form Field States
  const [nValue, setNValue] = useState("");
  const [d2Value, setD2Value] = useState("");

  // UI/UX States
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rows, setRows] = useState([]);

  // Dialog and Notification States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState({
    status: false,
    type: "success",
    message: "",
  });

  // Helper to trigger notifications
  const showNotification = (type, message) => {
    setNotification({
      status: true,
      type: type,
      message: message,
    });
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, status: false }));
  };

  // Fetch existing control charts
  const fetchControlCharts = () => {
    setLoading(true);
    SPQcControlChartData(
      (response) => {
        let list = [];
        if (response && response.data) {
          list = response.data;
        }
        setRows(list);
        setLoading(false);
      },
      (error, errorMessage) => {
        console.error("Error fetching control charts:", errorMessage);
        setLoading(false);
        setRows([]);
        showNotification("error", "Failed to fetch control charts: " + (errorMessage || "Offline"));
      }
    );
  };

  // Initialize
  useEffect(() => {
    fetchControlCharts();
  }, []);

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nValue || !d2Value) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setFormLoading(true);

    const payload = {
      n: parseInt(nValue, 10),
      d2: String(d2Value),
    };

    if (editMode) {
      payload.id = editingId;
      SPQcControlChartUpdate(
        payload,
        (response) => {
          setFormLoading(false);
          showNotification("success", "Control chart updated successfully!");
          setOpen(false);
          clearForm();
          fetchControlCharts();
        },
        (error, errorMessage) => {
          console.error("Update failed:", errorMessage);
          setFormLoading(false);
          showNotification("error", "Failed to update control chart: " + (errorMessage || "Request failed"));
        }
      );
    } else {
      SPQcControlChartAdd(
        payload,
        (response) => {
          setFormLoading(false);
          showNotification("success", "Control chart added successfully!");
          setOpen(false);
          clearForm();
          fetchControlCharts();
        },
        (error, errorMessage) => {
          console.error("Add failed:", errorMessage);
          setFormLoading(false);
          showNotification("error", "Failed to add control chart: " + (errorMessage || "Request failed"));
        }
      );
    }
  };

  // Edit Click Handler
  const handleEditClick = (row) => {
    setEditMode(true);
    setEditingId(row.id);
    setNValue(row.n || "");
    setD2Value(row.d2 || "");
    setOpen(true);
  };

  // Delete Click Handler
  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingId) return;

    SPQcControlChartDelete(
      { id: deletingId },
      (response) => {
        showNotification("success", "Control chart deleted successfully!");
        fetchControlCharts();
      },
      (error, errorMessage) => {
        console.error("Deletion failed:", errorMessage);
        showNotification("error", "Failed to delete control chart: " + (errorMessage || "Request failed"));
      }
    );
    setDeleteDialogOpen(false);
    setDeletingId(null);
  };

  // Clear Form state
  const clearForm = () => {
    setNValue("");
    setD2Value("");
    setEditMode(false);
    setEditingId(null);
  };

  const generateRowsWithIndex = (rowsList) => {
    return rowsList.map((row, index) => ({ sNo: index + 1, ...row }));
  };

  const rowData = generateRowsWithIndex(rows);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  // Setup grid columns
  const columns = [
    {
      field: "sNo",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Sl No</span>,
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "n",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Subgroup Size (n)</span>,
      minWidth: 150,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "d2",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Constant (d2)</span>,
      minWidth: 150,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "addedBy",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Created By</span>,
      minWidth: 120,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "updatedBy",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Updated By</span>,
      minWidth: 120,
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => params.row.updatedBy || "N/A",
    },
    // {
    //   field: "created_at",
    //   headerClassName: "super-app-theme--header",
    //   headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Created At</span>,
    //   minWidth: 180,
    //   flex: 1.2,
    //   align: "center",
    //   headerAlign: "center",
    //   valueFormatter: (params) => formatDate(params.value),
    // },
    // {
    //   field: "updated_at",
    //   headerClassName: "super-app-theme--header",
    //   headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Updated At</span>,
    //   minWidth: 180,
    //   flex: 1.2,
    //   align: "center",
    //   headerAlign: "center",
    //   valueFormatter: (params) => formatDate(params.value),
    // },
    {
      field: "actions",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Actions</span>,
      width: 120,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" gap={1}>
          <IconButton
            size="small"
            onClick={() => handleEditClick(params.row)}
            style={{ color: "#000000" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteClick(params.row.id)}
            style={{ color: "#e53935" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <div style={{ height: "60vh", width: "100%" }}>
      {/* Title / Breadcrumb section */}
      <Box
        sx={{
          mb: "10px",
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          marginLeft: "10px",
          marginRight: "10px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Typography
            sx={{ m: 1, fontFamily: "Roboto Slab", fontWeight: "bold" }}
            variant="h5"
          >
            SPC Control Chart
          </Typography>
        </div>

        <Box sx={{ m: 1 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Stack direction="row" spacing={2}>
                <Fab
                  style={{ background: "#002D68", color: "white" }}
                  variant="extended"
                  size="medium"
                  aria-label="add"
                  onClick={() => {
                    setEditMode(false);
                    clearForm();
                    setOpen(true);
                  }}
                >
                  <AddIcon sx={{ mr: 1 }} />
                  Add New Chart
                </Fab>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Grid Panel Card matching Template style */}
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: "-30px" }}>
        <Card
          style={{
            boxShadow: "0 10px 10px 2px rgba(0, 0, 0, 0.2)",
            marginTop: "20px",
            borderRadius: "10px",
            width: "98%",
            height: "100%",
          }}
        >
          <CardContent>
            <Box sx={{ height: "65vh", width: "100%" }}>
              <DataGrid
                rows={rowData}
                columns={columns}
                pageSize={8}
                rowsPerPageOptions={[8, 15, 25]}
                loading={loading}
                disableSelectionOnClick
                style={{ border: "none" }}
                sx={{
                  overflow: "auto",
                  width: "100%",
                  "& .super-app-theme--header": {
                    WebkitTextStrokeWidth: "0.6px",
                    backgroundColor: "#93bce6",
                    color: "#1c1919",
                  },
                  "& .MuiDataGrid-cell": {
                    border: "1px solid #969696",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    border: "1px solid #969696",
                  },
                }}
                getRowClassName={(params) => {
                  const rowIndex = rowData.findIndex((row) => row.id === params.row.id);
                  if (rowIndex !== -1) {
                    return rowIndex % 2 === 0 ? "Mui-evenRow" : "Mui-oddRow";
                  }
                  return "";
                }}
                rowHeight={40}
                columnHeaderHeight={40}
              />
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog Box */}
      <Dialog
        sx={{ "& .MuiDialog-paper": { minWidth: "40%" } }}
        maxWidth="sm"
        open={open}
        onClose={() => {
          setOpen(false);
          clearForm();
        }}
      >
        <DialogTitle style={{ background: "#002D68", color: "white" }}>
          {editMode ? "Edit SPC Control Chart" : "Add SPC Control Chart"}
        </DialogTitle>
        <DialogContent style={{ paddingTop: "20px" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="subgroup-size"
                  label="Subgroup Size (n)"
                  variant="filled"
                  margin="dense"
                  size="small"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ min: 1 }}
                  value={nValue}
                  onChange={(e) => setNValue(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="constant-d2"
                  label="Constant (d2)"
                  variant="filled"
                  margin="dense"
                  size="small"
                  fullWidth
                  required
                  type="number"
                  inputProps={{ step: "any" }}
                  value={d2Value}
                  onChange={(e) => setD2Value(e.target.value)}
                />
              </Grid>
            </Grid>
            <DialogActions style={{ marginTop: "20px", paddingRight: 0 }}>
              <Button
                type="submit"
                variant="contained"
                style={{ width: "150px", background: "#002D68", color: "white" }}
                disabled={formLoading}
              >
                {formLoading ? (
                  <CircularProgress size={24} style={{ color: "white" }} />
                ) : (
                  editMode ? "Update" : "Add"
                )}
              </Button>
              <Button
                variant="contained"
                style={{ width: "150px", background: "#002D68", color: "white" }}
                onClick={() => {
                  setOpen(false);
                  clearForm();
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ background: "#002D68", color: "white", fontWeight: "bold" }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography>Are you sure you want to delete this control chart configuration?</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
          >
            Delete
          </Button>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ color: "#757575", borderColor: "#757575" }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <NotificationBar
        handleClose={handleCloseNotification}
        notificationContent={notification.message}
        openNotification={notification.status}
        type={notification.type}
      />
    </div>
  );
};

export default SPCControl;
