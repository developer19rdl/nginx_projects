import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const PowerFailureLogs = ({ open, generatorOnReportList, onClose }) => {
  // Define columns for DataGrid
  const columns = [
    // { field: "id", headerName: "ID", width: 90 },
    { field: "startTime", headerName: "Start Time", width: 250 },
    { field: "endTime", headerName: "End Time", width: 250 },
    { field: "runningMinutes", headerName: "Running (mins)", width: 200 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Power Failure Logs</DialogTitle>

      <DialogContent dividers>
        {generatorOnReportList.length > 0 ? (
          <div style={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={generatorOnReportList}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 20]}
              disableRowSelectionOnClick
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f0f0f0",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-cell": {
                  fontSize: "0.95rem",
                },
               }}
             />
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            No generator logs found for the selected date range.
          </p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PowerFailureLogs;
