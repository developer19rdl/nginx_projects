import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  IconButton,
  Modal,
  Box,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { GetMtbfMonitoringReport } from "../../Services/NodeJsApiServices";
import { MtbfMonitoringExcel } from "../../Services/DownloadCsvReportsService";
import { MTTRData } from "../../Services/LoginPageService";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

const MTBF_MonitoringTrend = () => {

  const navigate = useNavigate()
  const [rows, setRows] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  // const [machineId, setMachineId] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [MTBFData, setMTBFData] = useState([]);
  const [row, setRow] = useState([]);

  useEffect(() => {
    GetMtbfMonitoringReport({}, handleMtbfTrend, handleMtbfError);
  }, []);

  const handleMtbfTrend = (dataObject) => {
    const formatted = (dataObject.data || []).map((item, index) => ({
      id: index + 1,
      ...item,
    }));
    setRows(formatted);
  };

  const handleMtbfError = () => {};

  const handleDownload = () => {
    MtbfMonitoringExcel(
      {},
      () => {},
      () => {}
    );
  };

  // const handleView = (row) => {
  //   setSelectedRow(row);
  //   setOpenModal(true);
  // };

  const handleView = (machineId) => {
    console.log("Selected Machine ID:", machineId);
    // setMachineId(machineId);
    setOpenModal(true);
    MTTRData({ id: machineId }, handlesuccess, handlefError);
  };

  // const handlesuccess = (dataObject) => {
  //   setMTBFData(dataObject.data[0]);
  //   setRow(dataObject.data.subData);

  // };

  const handlesuccess = (dataObject) => {
    if (dataObject?.data?.length > 0) {
      const mainData = dataObject.data[0]; // first item
      setMTBFData(mainData);
      setRow(mainData.subData || []); // :white_check_mark: get subData safely
    } else {
      setMTBFData({});
      setRow([]);
    }
  };

  const handlefError = () => {};

  const handleClose = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  const handleExport = async () => {
    if (!MTBFData || Object.keys(MTBFData).length === 0) {
      alert("No data available to export.");
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("MTBF Report");
    // ===== TITLE =====
    sheet.mergeCells("A1", "H1");
    const titleCell = sheet.getCell("A1");
    titleCell.value = "MTBF and MTTR Monitor";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    sheet.addRow([]);
    // ===== 2-COLUMN MACHINE INFO (LEFT + RIGHT) =====
    const leftData = [
      ["Name of Machine", MTBFData.machineName],
      ["Machine Code Number", MTBFData.machineTag],
      ["Model Number", MTBFData.AssetModel],
      ["Serial Number", MTBFData.SerialNo],
      ["Capacity", MTBFData.max_capacity],
      ["Date of Installation", MTBFData.dateOfInstall],
    ];
    const rightData = [
      ["Operation Availability (in hrs)", MTBFData.totalHours],
      ["Operation Availability (in days)", MTBFData.totalDays],
      ["Total Breakdown Hours", MTBFData.BreakDownHours],
      ["No of Breakdowns", MTBFData.BreakDownCounts],
      ["MTBF (Hrs)", MTBFData.MTBF_Hrs],
      ["MTTR (Hrs)", MTBFData.MTTR_Hrs],
    ];
    // Create two-column layout (Left + Right)
    for (let i = 0; i < leftData.length; i++) {
      const row = sheet.addRow([
        leftData[i][0],
        leftData[i][1] || "-",
        "",
        "",
        rightData[i][0],
        rightData[i][1] || "-",
      ]);
      row.font = { size: 12 };
    }
    sheet.addRow([]);
    // ===== TABLE HEADER =====
    const headers = [
      "Month",
      "From Date",
      "To Date",
      "Time Start",
      "Time Finish",
      "Down Time (hrs)",
      "Availability (hrs)",
      "MTBF (hrs)",
      "Failure %",
    ];
    const headerRow = sheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAEAEA" },
    };
    // ===== TABLE DATA =====
    (row || []).forEach((r) => {
      sheet.addRow([
        r.monthYear,
        r.fromdate,
        r.todate,
        r.fromtime,
        r.totime,
        r.BreakDownHours,
        r.AvailabilityHrs,
        r.MTBFHrs,
        r.FailurePercent,
      ]);
    });
    // ===== STYLE: AUTO WIDTH & BORDERS =====
    sheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const value = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, value.length);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
      col.width = maxLength + 4;
    });
    // ===== DOWNLOAD FILE =====
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `MTBF_Report_${MTBFData.machineName || "Machine"}.xlsx`
    );
  };

  const columns = [
    {
      field: "id",
      headerClassName: "super-app-theme--header",
      headerName: "SLNO",
      minWidth: 50,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "MachineNo",
      headerClassName: "super-app-theme--header",
      headerName: "MachineNo",
      minWidth: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "MachineName",
      headerClassName: "super-app-theme--header",
      headerName: "MachineName",
      minWidth: 70,
      headerAlign: "center",
    },
    {
      field: "ModelNo",
      headerClassName: "super-app-theme--header",
      headerName: "ModelNo",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "DateOfInstall",
      headerClassName: "super-app-theme--header",
      headerName: "DateOfInstall",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "OperationHrs",
      headerClassName: "super-app-theme--header",
      headerName: "OperationHrs",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "OperationDays",
      headerClassName: "super-app-theme--header",
      headerName: "OperationDays",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "BreakdownHrs",
      headerClassName: "super-app-theme--header",
      headerName: "BreakdownHrs",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "BreakdownCount",
      headerClassName: "super-app-theme--header",
      headerName: "BreakdownCount",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "MTBF",
      headerClassName: "super-app-theme--header",
      headerName: "MTBF",
      minWidth: 100,
      flex: 1,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "action",
      headerName: "Action",
      minWidth: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton
          color="black"
          onClick={() => {
            const machineId = params.row.machineId;
            console.log("Machine ID:", machineId);
            handleView(machineId); // :white_check_mark: Pass only the ID
          }}
          title="View Details"
        >
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

const handleMTTFClick =()=>{
  navigate('/FaultMetric');
}


  return (
    <div style={{ padding: "10px" }}>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <Typography
          sx={{ fontFamily: "Roboto Slab", fontWeight: "bold", color: "#000" }}
          variant="h5"
        >
          MTBF MONITORING
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={handleMTTFClick}
            variant="contained"
            sx={{ backgroundColor: "black" }}
          >
            Month wise MTTF
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            sx={{ backgroundColor: "black" }}
          >
            Download CSV
          </Button>
        </Box>
      </div>

      {/* Data Table */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card
            style={{
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              borderRadius: "10px",
              height: "75vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div style={{ flex: 1, overflow: "auto" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 50]}
                  disableRowSelectionOnClick
                  sx={{
                    "& .MuiDataGrid-columnHeaders": {
                      color: "#000",
                      fontWeight: "bold",
                    },
                    "& .MuiDataGrid-cell": {
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal for row details */}
      <Modal open={openModal} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            overflow: "auto",
          }}
        >
          {/* Centered Header */}
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: "bold", mb: 3 }}
          >
            MTBF and MTTR Monitor
          </Typography>

          {/* Two-column Key-Value Info Section */}
          {/* Two-column Key-Value Info Section */}
          {MTBFData ? (
            <Grid container spacing={10} sx={{ mb: 3 }}>
              {/* Left Column */}
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  {[
                    ["Name of Machine", MTBFData.machineName],
                    ["Machine Code Number", MTBFData.machineTag],
                    ["Model Number", MTBFData.AssetModel],
                    ["Serial Number", MTBFData.SerialNo],
                    ["Capacity", MTBFData.max_capacity],
                    ["Date of Installation", MTBFData.dateOfInstall],
                  ].map(([label, value], index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                      <Typography>{value || "-"}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.5}>
                  {[
                    ["Operation Availability (in hrs)", MTBFData.totalHours],
                    ["Operation Availability (in days)", MTBFData.totalDays],
                    ["Total Breakdown Hours", MTBFData.BreakDownHours],
                    ["No of Breakdowns", MTBFData.BreakDownCounts],
                    ["MTBF (Hrs)", MTBFData.MTBF_Hrs],
                    ["MTTR (Hrs)", MTBFData.MTTR_Hrs],
                  ].map(([label, value], index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
                      <Typography>{value || "-"}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Typography align="center" sx={{ mb: 2 }}>
              No details available.
            </Typography>
          )}
          <div style={{ height: "35vh", width: "100%" }}>
            <DataGrid
              rows={row}
              columns={[
                {
                  field: "monthYear",
                  headerName: "Month",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "fromdate",
                  headerName: "From Date",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "todate",
                  headerName: "To Date",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "fromtime",
                  headerName: "Time Start",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "totime",
                  headerName: "Time Finish",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "BreakDownHours",
                  headerName: "Down Time (in hrs)",
                  flex: 1.2,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "AvailabilityHrs",
                  headerName: "Availability (in hrs)",
                  flex: 1.2,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "MTBFHrs",
                  headerName: "MTBF (Hrs)",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
                {
                  field: "FailurePercent",
                  headerName: "Failure %",
                  flex: 1,
                  align: "center",
                  headerAlign: "center",
                },
              ]}
              pageSize={5}
              rowsPerPageOptions={[5]}
              sx={{
                "& .MuiDataGrid-columnHeaders": {
                  fontWeight: "bold",
                  color: "#000",
                  backgroundColor: "#f5f5f5",
                },
              }}
              disableRowSelectionOnClick
            />
          </div>

          {/* Close Button */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "#fff",
              mt: 3,
              width: "10%",
              justifyContent: "center",
              alighnItems: "center",
            }}
            onClick={handleClose}
          >
            Close
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "black",
              color: "#fff",
              mt: 3,
              width: "15%",
              justifyContent: "center",
              alighnItems: "center",
              marginLeft: "10px",
            }}
            onClick={handleExport}
          >
            Download Excel{" "}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default MTBF_MonitoringTrend;
