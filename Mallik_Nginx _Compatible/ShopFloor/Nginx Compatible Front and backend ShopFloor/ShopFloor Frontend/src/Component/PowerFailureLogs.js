import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { FetchGeneratorOnLogs } from "../Services/NodeJsApiServices";
// import { FetchGeneratorOnLogs } from "path_to_your_api_service"; // 🔹 Uncomment and set the correct path

const PowerFailureLogs = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [generatorOnReportList, setGeneratorOnReportList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both From Date and To Date");
      return;
    }

    setLoading(true);
    try {
      // 🔹 Replace this mock API call with your actual function
      // FetchGeneratorOnLogs({ fromDate, toDate }, handleReportOnLogsSuccess, handleReportOnLogsException);
       FetchGeneratorOnLogs({            
                  fromDate: fromDate,
                  toDate: toDate
              }, handleReportOnLogsSuccess, handleReportOnLogsException)



    } catch (error) {
      handleReportOnLogsException();
    }
  };

  const handleReportOnLogsSuccess = (dataObject) => {
    setGeneratorOnReportList(dataObject?.data || []);
    setLoading(false);
  };

  const handleReportOnLogsException = () => {
    setLoading(false);
    alert("Failed to load data.");
  };

  // 🔹 DataGrid Columns
  const columns = [
    { field: "startTime", headerName: "Start Time", width: 250 },
    { field: "endTime", headerName: "End Time", width: 250 },
    { field: "runningMinutes", headerName: "Running (mins)", width: 200 },
  ];

  // 🔹 Mock API Function (remove when real API is available)
  const fakeFetchGeneratorOnLogs = async (from, to) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              startTime: `${from} 08:15:00`,
              endTime: `${to} 09:05:00`,
              runningMinutes: 50,
            },
            {
              id: 2,
              startTime: `${from} 13:30:00`,
              endTime: `${to} 14:00:00`,
              runningMinutes: 30,
            },
          ],
        });
      }, 1000);
    });
  };

  return (
      <>
            <div className="generator_bottomContainer">
                <div className="generator_headerContainer">
                    <span style={{ color: '#000000', fontWeight: 'bold' }}>Power Failure Logs</span>
                </div>

    <div className="p-4">
      {/* 🔹 Date Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "#555" }}>
            From Date
          </label>
          <TextField
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            size="small"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "14px", color: "#555" }}>
            To Date
          </label>
          <TextField
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            size="small"
          />
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{ height: "40px" }}
        >
          SUBMIT
        </Button>
      </div>

      {/* 🔹 Data Table */}
      {generatorOnReportList.length > 0 ? (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={generatorOnReportList}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 20]}
            disableRowSelectionOnClick
            loading={loading}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                fontSize: "0.95rem",
              },
            }}
          />
        </div>
      ) : (
        !loading && (
          <p style={{ textAlign: "center", color: "#888" }}>
            No power failure logs found for the selected date range.
          </p>
        )
      )}
    </div>
    </div>
      </>
  );
};

export default PowerFailureLogs;
