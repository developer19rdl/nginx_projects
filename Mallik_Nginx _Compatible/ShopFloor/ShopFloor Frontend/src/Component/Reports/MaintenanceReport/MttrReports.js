import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { MtttrAllMachineMonitoring } from "../../../Services/NodeJsApiServices";

const MttrReports = ({ open, setOpen, handleClose, formattedDownTimeMonth, setFormattedDownTimeMonth }) => {

    console.log("MTTR Props", formattedDownTimeMonth);
  
  const [rows, setRows] = useState([]); // store MTTR table data

  // Close dialog


  // Call API when month changes
  useEffect(() => {
    if (!formattedDownTimeMonth.year || !formattedDownTimeMonth.month) return;

    MtttrAllMachineMonitoring(
      {
        year: formattedDownTimeMonth.year,
        month: formattedDownTimeMonth.month,
      },
      handleSuccess,
      handleError
    );
  }, [ formattedDownTimeMonth]);

  const handleSuccess = (data) => {
    console.log("MTTR Monitor Data", data);
    setRows(data.data);        // set table rows
    setOpen(true);             // open dialog
  };

  const handleError = (err) => {
    console.log("MTTR Error", err);
  };

  const downloadExcel = async (rows) => {
  if (!rows || rows.length === 0) {
    alert("No data to export!");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("MTTR Report");

  // Header row
  const header = [
    "SI No",
    "Machine #",
    "Machine Name",
    "Available Hrs",
    "Date",
    "Start",
    "Finish",
    "Down (min)",
    "Freq",
    "MTBF (hrs)",
    "MTTR (hrs)"
  ];

  worksheet.addRow(header);

  // Style header
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEFEFEF" }
    };
  });

  // Add rows
  rows.forEach((item, index) => {
    if (item.logs.length === 0) {
      // No logs → single row
      worksheet.addRow([
        index + 1,
        item.machineTag,
        item.machineName,
        item.availableHours,
        "-",
        "-",
        "-",
        "-",
        item.failures,
        item.MTBF,
        item.MTTR
      ]);
    } else {
      // Machine has logs
      item.logs.forEach((log, i) => {
        worksheet.addRow([
          i === 0 ? index + 1 : "",
          i === 0 ? item.machineTag : "",
          i === 0 ? item.machineName : "",
          i === 0 ? item.availableHours : "",
          log.date ? log.date.split("T")[0] : "-",
          log.startTime || "-",
          log.endTime || "-",
          log.downMinutes || "-",
          i === 0 ? item.failures : "",
          i === 0 ? item.MTBF : "",
          i === 0 ? item.MTTR : "",
        ]);
      });
    }
  });

  // Auto column width
  worksheet.columns.forEach((column) => {
    let maxLength = 10;

    column.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });

    column.width = maxLength + 2;
  });

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    `MTTR_Report_${formattedDownTimeMonth.month}_${formattedDownTimeMonth.year}.xlsx`
  );
};

  

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <strong>MTTR Monitor — {formattedDownTimeMonth.month} {formattedDownTimeMonth.year}</strong>

  <Button variant="outlined" onClick={() => downloadExcel(rows)}>
  DOWNLOAD EXCEL
</Button>

</DialogTitle>
      <DialogContent>

        {/* TABLE */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead sx={{ background: "#eeeeee" }}>
              <TableRow>
                <TableCell><strong>SI No</strong></TableCell>
                <TableCell><strong>Machine #</strong></TableCell>
                <TableCell><strong>Machine Name</strong></TableCell>
                <TableCell><strong>Available Hrs</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Start</strong></TableCell>
                <TableCell><strong>Finish</strong></TableCell>
                <TableCell><strong>Down (min)</strong></TableCell>
                <TableCell><strong>Freq</strong></TableCell>
                <TableCell><strong>MTBF (hrs)</strong></TableCell>
                <TableCell><strong>MTTR (hrs)</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((item, index) => (
                <React.Fragment key={index}>

                  {/* FIRST ROW (main row) */}
                  <TableRow>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.machineTag}</TableCell>
                    <TableCell>{item.machineName}</TableCell>
                    <TableCell>{item.availableHours}</TableCell>

                    {/* If machine has logs → show first log */}
                    <TableCell>{item.logs[0]?.date ? item.logs[0].date.split("T")[0] : "-"}</TableCell>
                    <TableCell>{item.logs[0]?.startTime || "-"}</TableCell>
                    <TableCell>{item.logs[0]?.endTime || "-"}</TableCell>
                    <TableCell>{item.logs[0]?.downMinutes || "-"}</TableCell>
                    <TableCell>{item.failures}</TableCell>

                    <TableCell>{item.MTBF}</TableCell>
                    <TableCell>{item.MTTR}</TableCell>
                  </TableRow>

                  {/* MULTIPLE LOGS (if more than 1 breakdown) */}
                  {item.logs.slice(1).map((log, i) => (
                    <TableRow key={i} sx={{ background: "#fafafa" }}>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>

                      <TableCell>{log.date.split("T")[0]}</TableCell>
                      <TableCell>{log.startTime}</TableCell>
                      <TableCell>{log.endTime}</TableCell>
                      <TableCell>{log.downMinutes}</TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}

                </React.Fragment>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MttrReports;
