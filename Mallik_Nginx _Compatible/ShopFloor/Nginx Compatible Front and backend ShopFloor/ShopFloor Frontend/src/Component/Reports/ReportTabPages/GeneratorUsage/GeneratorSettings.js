import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { LoadDataGenerator, UpdateDataGenerator } from "../../../../Services/NodeJsApiServices";

const GeneratorSettings = ({ openSettingsDialog, onClose }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch generator data by date
  const fetchGeneratorData = async () => {
    if (!selectedDate) return alert("Select a date first!");
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

  // 🔹 Field name mapping between UI and DB
  const fieldMap = {
    topupLtr: "fuel_topup",
    totalGeneratedKwhDay: "totalGenKwh",
    runningMins: "totRunMins",
  };

  // 🔹 Handle cell edit (modern approach)
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
        () => {
          console.log("Updated successfully!");
        },
        () => {
          alert("Update failed");
        }
      );
      return newRow;
    } catch (err) {
      console.error("Error updating:", err);
      alert("Failed to update data.");
      return oldRow;
    }
  };

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
    <Dialog open={openSettingsDialog} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>
        OPEN Balance
      </DialogTitle>
      <DialogContent dividers>
        <div className="flex items-center gap-3 mb-3">
          <TextField
            label="Select Date"
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="contained" color="primary" onClick={fetchGeneratorData}>
            Load Data
          </Button>
        </div>

        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={rows.map((r) => ({ id: r.id, ...r }))}
            columns={columns}
            loading={loading}
            processRowUpdate={processRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
            disableRowSelectionOnClick
          />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratorSettings;

