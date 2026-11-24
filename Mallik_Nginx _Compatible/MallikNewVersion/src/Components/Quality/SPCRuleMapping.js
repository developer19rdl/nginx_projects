import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import GetAppIcon from "@mui/icons-material/GetApp";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom";
import axios from "axios";
import NotificationBar from "../GlobleFiles/ServiceNotificationBar";
import {
  SPQcQualityParameters,
  SPQcQualityMasterList,
  SPQcQualityMasterAdd,
  SPQcQualityMasterUpdate,
  SPQcQualityMasterDelete,
  SPQcControlChartData,
} from "../../ApiService/LoginPageService";
import { DownloadSpcTemplateExl } from "../../ApiService/DownloadCsvReportsService";


const SPCRuleMapping = () => {
  // Form Dialog States
  const [open, setOpen] = useState(false);

  // Form Field States
  const [spcId, setSpcId] = useState("");
  const [productName, setProductName] = useState("");
  const [type, setType] = useState("Production");
  const [selectedFile, setSelectedFile] = useState(null);
  const [range, setRange] = useState("");
  const [value, setValue] = useState("");
  const [qualityParameter, setQualityParameter] = useState("");

  // UI/UX States
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [parametersList, setParametersList] = useState([]);
  const [rows, setRows] = useState([]);
  const [controlChartValues, setControlChartValues] = useState([]);

  // Dialog and Notification States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState({
    status: false,
    type: "success",
    message: "",
  });

  // Range options
  const rangeOptions = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60-70", "70-80", "80-90", "90-100"];

  // Helper to trigger notifications
  const showNotification = useCallback((type, message) => {
    setNotification({
      status: true,
      type: type,
      message: message,
    });
  }, []);

  const handleCloseNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, status: false }));
  }, []);

  // Fetch Quality Parameters based on Type selection
  const fetchParameters = useCallback((selectedType) => {
    SPQcQualityParameters(
      { type: selectedType },
      (response) => {
        let list = [];
        if (response && response.data) {
          list = response.data;
        }

        // Format of list items: { qltyParameter: "Hex hole", type: "Production" }
        const formattedList = list.map((item) => {
          if (typeof item === "string") return item;
          return item.qltyParameter || item.qcField || item.label || item.name || "";
        }).filter(Boolean);

        setParametersList(formattedList);
      },
      (error, errorMessage) => {
        console.error("Error fetching quality parameters:", errorMessage);
        setParametersList([]);
        showNotification("error", "Failed to fetch quality parameters: " + (errorMessage || "Offline"));
      }
    );
  }, [showNotification]);

  // Fetch existing mapped rules
  const fetchMappings = useCallback(() => {
    setLoading(true);
    SPQcQualityMasterList(
      (response) => {
        let list = [];
        if (response && response.data) {
          list = response.data;
        }
        setRows(list);
        setLoading(false);
      },
      (error, errorMessage) => {
        console.error("Error fetching rules list:", errorMessage);
        setLoading(false);
        setRows([]);
        showNotification("error", "Failed to fetch rules list: " + (errorMessage || "Offline"));
      }
    );
  }, [showNotification]);

  // Fetch control chart values to populate dropdown
  const fetchControlCharts = useCallback(() => {
    SPQcControlChartData(
      (response) => {
        if (response && response.data) {
          // get unique n values from control charts
          const uniqueNs = [...new Set(response.data.map((item) => item.n))].sort((a, b) => a - b);
          setControlChartValues(uniqueNs);
        }
      },
      (error, errorMessage) => {
        console.error("Error fetching control chart data:", errorMessage);
        showNotification("error", "Failed to fetch control charts: " + (errorMessage || "Offline"));
      }
    );
  }, [showNotification]);

  // Initialize and React to Type changes
  useEffect(() => {
    fetchParameters(type);
  }, [type, fetchParameters]);

  useEffect(() => {
    fetchMappings();
    fetchControlCharts();
  }, [fetchMappings, fetchControlCharts]);

  // File Upload Change Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!spcId || !productName || !qualityParameter) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setFormLoading(true);

    let base64File = "";
    if (selectedFile) {
      try {
        base64File = await fileToBase64(selectedFile);
      } catch (error) {
        console.error("Error reading file:", error);
        showNotification("error", "Failed to read file");
        setFormLoading(false);
        return;
      }
    }

    const payload = {
      spcId,
      productName,
      type,
      range: range,
      value: String(value),
      parameter: qualityParameter,
      file: base64File,
    };

    const successHandler = (response) => {
      setFormLoading(false);
      showNotification("success", `SPC Rule Mapping ${editMode ? "updated" : "added"} successfully!`);
      setOpen(false);
      clearForm();
      fetchMappings();
    };

    const errorHandler = (error, errorMessage) => {
      setFormLoading(false);
      console.error("Submission failed:", errorMessage);
      showNotification("error", `Failed to save mapping: ${errorMessage}`);
    };

    if (editMode) {
      payload.id = editingId;
      SPQcQualityMasterUpdate(payload, successHandler, errorHandler);
    } else {
      SPQcQualityMasterAdd(payload, successHandler, errorHandler);
    }
  };

  // Download Template Handler
  const handleDownloadTemplate = () => {
    DownloadSpcTemplateExl(
      {},
      (response) => {
        showNotification("success", "Template download started successfully!");
      },
      (error, errorMessage) => {
        console.error("Error downloading template:", errorMessage);
        showNotification("error", "Failed to download template: " + (errorMessage || "Offline"));
      }
    );
  };

  // Populate form for Edit and open dialog
  const handleEditClick = useCallback((row) => {
    setEditMode(true);
    setEditingId(row.id);
    setSpcId(row.spcId || row.spcID || "");
    setProductName(row.productName || "");
    setType(row.type || "Production");
    setQualityParameter(row.parameter || row.qualityParameter || "");
    setValue(row.value !== undefined && row.value !== null ? row.value : "");
    setRange(row.range || "");
    setSelectedFile(null);
    setOpen(true);
  }, []);

  // Confirm Delete Dialog triggers
  const handleDeleteClick = useCallback((id) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    SPQcQualityMasterDelete(
      { id: deletingId },
      (response) => {
        showNotification("success", "Rule Mapping deleted successfully!");
        fetchMappings();
      },
      (error, errorMessage) => {
        console.error("Deletion failed:", errorMessage);
        showNotification("error", "Failed to delete mapping: " + errorMessage);
      }
    );
    setDeleteDialogOpen(false);
    setDeletingId(null);
  }, [deletingId, fetchMappings, showNotification]);

  // Clear Form state
  const clearForm = useCallback(() => {
    setSpcId("");
    setProductName("");
    setType("Production");
    setSelectedFile(null);
    setRange("");
    setValue("");
    setQualityParameter("");
    setEditMode(false);
    setEditingId(null);
  }, []);

  const rowData = useMemo(() => {
    return rows.map((row, index) => ({ sNo: index + 1, ...row }));
  }, [rows]);

  // Setup grid columns
  const columns = useMemo(() => [
    {
      field: "sNo",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Sl No</span>,
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "spcId",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>SPC ID</span>,
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => params.row.spcId || params.row.spcID || "",
    },
    {
      field: "productName",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Product Name</span>,
      minWidth: 130,
      flex: 1.2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "type",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Type</span>,
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "references",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Referral Label</span>,
      minWidth: 120,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "parameter",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Parameter</span>,
      minWidth: 130,
      flex: 1.2,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "range",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Range</span>,
      width: 110,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "value",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Value</span>,
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    // {
    //   field: "fileName",
    //   headerClassName: "super-app-theme--header",
    //   headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>File Name</span>,
    //   minWidth: 130,
    //   flex: 1.2,
    //   align: "center",
    //   headerAlign: "center",
    // },
    {
      field: "actions",
      headerClassName: "super-app-theme--header",
      headerName: <span style={{ fontWeight: "bold", fontSize: "16px" }}>Actions</span>,
      width: 100,
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
  ], [handleEditClick, handleDeleteClick]);

  return (
    <div style={{ height: "60vh", width: "100%" }}>
      {/* Title / Breadcrumb section matching other screens */}
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
            SPC Rule Mapping
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
                  aria-label="download"
                  onClick={handleDownloadTemplate}
                >
                  <GetAppIcon sx={{ mr: 1 }} />
                  Download Template
                </Fab>
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
                  Add New Rule Mapping
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
                  return params.row.sNo % 2 !== 0 ? "Mui-evenRow" : "Mui-oddRow";
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
        sx={{ "& .MuiDialog-paper": { minWidth: "55%" } }}
        maxWidth="lg"
        open={open}
        onClose={() => {
          setOpen(false);
          clearForm();
        }}
      >
        <DialogTitle style={{ background: "#002D68", color: "white" }}>
          {editMode ? "Edit SPC Rule Mapping" : "Add SPC Rule Mapping"}
        </DialogTitle>
        <DialogContent style={{ paddingTop: "20px" }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  id="spc-id"
                  label="SPC ID"
                  variant="filled"
                  margin="dense"
                  size="small"
                  fullWidth
                  required
                  value={spcId}
                  onChange={(e) => setSpcId(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  id="product-name"
                  label="Product Name"
                  variant="filled"
                  margin="dense"
                  size="small"
                  fullWidth
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth variant="filled" margin="dense" size="small">
                  <InputLabel id="type-select-label">Type</InputLabel>
                  <Select
                    labelId="type-select-label"
                    value={type}
                    label="Type"
                    onChange={(e) => setType(e.target.value)}
                  >
                    <MenuItem value="Production">Production</MenuItem>
                    <MenuItem value="Assembly">Assembly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth variant="filled" margin="dense" size="small" required>
                  <InputLabel id="param-select-label">Quality Parameter</InputLabel>
                  <Select
                    labelId="param-select-label"
                    value={qualityParameter}
                    label="Quality Parameter"
                    onChange={(e) => setQualityParameter(e.target.value)}
                  >
                    {parametersList.map((param) => (
                      <MenuItem key={param} value={param}>
                        {param}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth variant="filled" margin="dense" size="small">
                  <InputLabel id="range-select-label">Range</InputLabel>
                  <Select
                    labelId="range-select-label"
                    value={range}
                    label="Range"
                    onChange={(e) => setRange(e.target.value)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {rangeOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth variant="filled" margin="dense" size="small">
                  <InputLabel id="value-select-label">Value</InputLabel>
                  <Select
                    labelId="value-select-label"
                    value={value}
                    label="Value"
                    onChange={(e) => setValue(e.target.value)}
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {controlChartValues.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4} display="flex" alignItems="center" style={{ marginTop: "8px" }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{
                    borderColor: "#002D68",
                    color: "#002D68",
                    textTransform: "none",
                    height: "48px",
                    "&:hover": { borderColor: "#001a40", background: "rgba(0, 45, 104, 0.04)" },
                  }}
                >
                  {selectedFile ? selectedFile.name : "Choose File"}
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
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
          <Typography>Are you sure you want to delete this rule mapping configuration?</Typography>
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

export default SPCRuleMapping;
