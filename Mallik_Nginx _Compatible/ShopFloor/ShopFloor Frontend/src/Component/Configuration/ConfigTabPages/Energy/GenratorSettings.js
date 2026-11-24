import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  LoadDataGenerator,
  UpdateDataGenerator,
} from "../../../../Services/NodeJsApiServices";

const GeneratorSettings = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch generator data by date
  const fetchGeneratorData = async () => {
    if (!selectedDate) return alert("Please select a date first!");
    setLoading(true);
    LoadDataGenerator(
      { date: selectedDate },
      handleReportSuccess,
      handleReportException
    );
  };

  const handleReportSuccess = (dataObject) => {
    setRows(dataObject?.report || []);
    setLoading(false);
  };

  const handleReportException = () => {
    setLoading(false);
    alert("Failed to load data.");
  };

  // 🔹 Map UI fields to backend DB fields
  const fieldMap = {
    topupLtr: "fuel_topup",
    totalGeneratedKwhDay: "totalGenKwh",
    runningMins: "totRunMins",
  };

  // 🔹 Handle inline editing
  const processRowUpdate = async (newRow, oldRow) => {
    const changedField = Object.keys(newRow).find(
      (key) => newRow[key] !== oldRow[key]
    );

    if (!changedField) return oldRow;

    const backendField = fieldMap[changedField] || changedField;
    const value = newRow[changedField];

    try {
      await UpdateDataGenerator(
        { id: oldRow.id, field: backendField, value },
        () => console.log("✅ Updated successfully!"),
        () => alert("Update failed")
      );
      return newRow;
    } catch (err) {
      console.error("❌ Error updating:", err);
      alert("Failed to update data.");
      return oldRow;
    }
  };

  // 🔹 DataGrid columns
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "hr", headerName: "Hour", width: 80 },
    { field: "openBalLtr", headerName: "Open Ltr", width: 100, editable: true },
    { field: "closeBalLtr", headerName: "Close Ltr", width: 100, editable: true },
    { field: "consumptionLtr", headerName: "Used Ltr", width: 100, editable: true },
    { field: "topupLtr", headerName: "Top-up Ltr", width: 100, editable: true },
    { field: "openBalKwh", headerName: "Open kWh", width: 100, editable: true },
    { field: "closeBalKwh", headerName: "Close kWh", width: 100, editable: true },
    { field: "totalGeneratedKwhDay", headerName: "Total kWh", width: 110, editable: true },
    { field: "runningMins", headerName: "Run (mins)", width: 100, editable: true },
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Card sx={{ p: 2, boxShadow: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}
        >
          ⚙️ Generator Data Settings
        </Typography>

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Select Date"
              type="date"
              size="small"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={fetchGeneratorData}
            >
              Load Data
            </Button>
          </Grid>
        </Grid>

        <CardContent>
          <div style={{ height: 420, width: "100%" }}>
            <DataGrid
              rows={rows.map((r) => ({ id: r.id, ...r }))}
              columns={columns}
              loading={loading}
              processRowUpdate={processRowUpdate}
              experimentalFeatures={{ newEditingApi: true }}
              disableRowSelectionOnClick
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GeneratorSettings;
