import { useState, useRef, useEffect } from "react";
import {
  Dialog, DialogActions, DialogContent, DialogTitle
} from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, ResponsiveContainer, CartesianGrid, ComposedChart
} from "recharts";
import { BreakDownTrendYear, MonthlyBreakDownTrend } from "../../Services/NodeJsApiServices";
import FYBreakdownTable from "./FYBreakdownTable";
import MonthlyBreakdownTable from "./MonthlyBreakdownTable";

const BreakdownTrendDialog = ({ open, setOpen, scroll, month, toMonth }) => {

  const [yearBreakdownTrendData, setYearBreakdownTrendData] = useState([]);
  const [monthBreakdownTrendData, setMonthBreakdownTrendData] = useState([]);


  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }

      // Fetch FY Data
      BreakDownTrendYear(
        { month, toMonth },
        handleBreakDownTrendSuccess,
        handleBreakDownTrendException
      );

      MonthlyBreakDownTrend(  { month, toMonth },
        handleMonthlyBreakDownTrendSuccess,
              handleMonthlyBreakDownTrendException
      )

    }
  }, [open]);

  const handleBreakDownTrendSuccess = (dataObject) => {
    setYearBreakdownTrendData(dataObject.data);
  };

  const handleBreakDownTrendException = (error) => {
    console.log("BreakDownTrendYear api exception", error);
  };

    const handleMonthlyBreakDownTrendSuccess = (dataObject) => {
    setMonthBreakdownTrendData(dataObject.data);
  };

  const handleMonthlyBreakDownTrendException = (error) => {
    console.log("BreakDownTrendYear api exception", error);
  };

  
  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        fullWidth
        maxWidth="xl"
      >
        <DialogTitle id="scroll-dialog-title">
         MACHINE BREAKDOWN TREND
        </DialogTitle>

        <DialogContent dividers={scroll === "paper"}>

          <Grid container spacing={2}>

            {/* ---------- LEFT CHART: PLANNED VS COMPLETED ---------- */}
            <Grid item xs={12} md={6}>
              <h4 style={{ textAlign: "center" }}>YEARLY PERFORMANCE TREND</h4>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={yearBreakdownTrendData}>
                  <CartesianGrid stroke="#f0f0f0" />
                  <XAxis dataKey="financialYear" />
                  <YAxis />
                  <Tooltip />
                  <Legend />


        
                  {/* Bars */}
                  <Bar dataKey="actual" fill="#2e7d32" name="Actual" />
                  {/* <Bar dataKey="totalCompleted" fill="#0277bd" name="Completed" /> */}
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#0099ffff"
                    strokeWidth={3}
                    name="Target"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Grid>

            {/* ---------- RIGHT CHART: BREAKDOWN TREND ---------- */}
            <Grid item xs={12} md={6}>
              <h4 style={{ textAlign: "center" }}>Month PERFORMANCE TREND</h4>
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={monthBreakdownTrendData}>
                  <CartesianGrid stroke="#f0f0f0" />
                  <XAxis dataKey="financialYear" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* Bar for breakdown */}
                  <Bar dataKey="actual" fill="#21a021ff" name="Breakdowns" />

                  {/* Line on same chart */}
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ff9800"
                    strokeWidth={3}
                    name="target"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* <h4 style={{ textAlign: "center" }}>YEARLY PERFORMANCE TREND</h4> */}
              <FYBreakdownTable yearBreakdownTrendData={yearBreakdownTrendData} />
            </Grid>
            <Grid item xs={12} md={6}>
              {/* <h4 style={{ textAlign: "center" }}>MONTH PERFORMANCE TREND</h4> */}
              <MonthlyBreakdownTable monthBreakdownTrendData={monthBreakdownTrendData} />
            </Grid>
          </Grid>

        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BreakdownTrendDialog;
