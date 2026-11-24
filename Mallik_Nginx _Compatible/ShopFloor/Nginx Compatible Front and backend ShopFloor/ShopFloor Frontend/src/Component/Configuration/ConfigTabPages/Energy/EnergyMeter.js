import React, { useState,useEffect } from "react";
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
  LoadDataEnergyMeter,
  LoadDataGenerator,
  NeterDropDown,
  UpdateDataEnergyMeter,
  UpdateDataGenerator,
} from "../../../../Services/NodeJsApiServices";

const EnergyMeter = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meterId, setMeterId] = useState("");
  const [meterDropDownData, setMeterDropDownData] = useState([]); 

  useEffect(() => { 
    NeterDropDown(handleMeterDropDownSuccess,handleMeterDropDownException)
   },[]);

   const handleMeterDropDownSuccess = (dataObject)=>{
        setMeterDropDownData(dataObject.data);
   }    
    const handleMeterDropDownException = ()=>{      
    }

  // 🔹 Fetch generator data by date
  const fetchGeneratorData = async () => {
    if (!selectedDate) return alert("Please select a date first!");
    setLoading(true);
    LoadDataEnergyMeter(
      { date: selectedDate, meterId },
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
      await UpdateDataEnergyMeter(
        { id: oldRow.id, field: backendField, value , meterId,date:selectedDate},
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
    { field: "date", headerName: "date", width: 80 },
    
    { field: "HR", headerName: "Hour", width: 80 },
    { field: "openkWh", headerName: "Opening kWh", width: 100, editable: true },
    { field: "kWh_pre", headerName: "Closing kWh", width: 100, editable: true },
    { field: "kWh", headerName: "kWh", width: 100, editable: true }
  ];

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Card sx={{ p: 2, boxShadow: 3 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "primary.main" }}
        >
          ⚙️ Meter Opening Balance Settings
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
            <TextField
              // label="Select Meter"  
                size="small"    
                select          
                SelectProps={{ native: true }}
                fullWidth
                // value={selectedMeter}    
                onChange={(e) => setMeterId(e.target.value)}
            >
                <option value="">-- Select Meter --</option>
                {meterDropDownData.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.displayName}
                    </option>
                ))}
            </TextField>
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

export default EnergyMeter;
