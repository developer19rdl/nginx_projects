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
import { BreakDownMaintTrendMonthly, BreakDownMaintTrendYear, PreventiveDownTrend, PreventiveMaintTrendMonthly, PreventiveMaintTrendYear, PreventiveTrendYear } from "../../Services/NodeJsApiServices";
import FYPreventiveMainTable from "./FYPreventiveMainTable";
import MonthlyPreventiveTable from "./MonthlyPreventiveTable";
const PrevMaintCalendDialog = ({ open, setOpen, scroll, month, toMonth }) => {
 
  const [yearBreakdownTrendData, setYearBreakdownTrendData] = useState([]);
 
  const [monthBreakdownTrendData, setMonthBreakdownTrendData] = useState([]);

  const [yearPreventiveTrendData, setYearPreventiveTrendData] = useState([]);
  const [monthPreventiveTrendData, setMonthPreventiveTrendData] = useState([]);
 

 
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
       BreakDownMaintTrendYear(
         { month, toMonth },
         handleBreakDownTrendSuccess,
         handleBreakDownTrendException
       );
 
       BreakDownMaintTrendMonthly(  { month, toMonth },
         handleMonthlyBreakDownTrendSuccess,
               handleMonthlyBreakDownTrendException
       )

       PreventiveMaintTrendYear({ month, toMonth },
         preventiveTrendYearSuccess,
          preventiveTrendYearException
       );     
        PreventiveMaintTrendMonthly(  { month, toMonth },
          PreventiveMaintTrendMonthlySuccuss,
           preventiveTrendMonthException
        );  

 
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
   

   const preventiveTrendYearSuccess = (dataObject) => {
    setYearPreventiveTrendData(dataObject.data);
   };
   
   const preventiveTrendYearException = (error) => {
    console.log("PreventiveTrendYear api exception", error);
   }  

   const PreventiveMaintTrendMonthlySuccuss = (dataObject) => {
    setMonthPreventiveTrendData(dataObject.data);
   }    
    const preventiveTrendMonthException = (error) => {
    console.log("PreventiveTrendYear api exception", error);
   }

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
                    <Bar dataKey="Actual" fill="#2e7d32" name="Actual" />
                    {/* <Bar dataKey="totalCompleted" fill="#0277bd" name="Completed" /> */}
                    <Line
                      type="monotone"
                      dataKey="totalCompleted"
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
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
  
                    {/* Bar for breakdown */}
                    <Bar dataKey="Actual" fill="#21a021ff" name="Breakdowns" />
  
                    {/* Line on same chart */}
                    <Line
                      type="monotone"
                      dataKey="Target"
                      stroke="#ff9800"
                      strokeWidth={3}
                      name="Target"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Grid>

              <Grid item xs={12} md={6}>
                {/* <h4 style={{ textAlign: "center" }}>YEARLY PERFORMANCE TREND</h4> */}
                <FYPreventiveMainTable yearPreventiveTrendData={yearPreventiveTrendData} />
              </Grid>
              <Grid item xs={12} md={6}>
                {/* <h4 style={{ textAlign: "center" }}>MONTH PERFORMANCE TREND</h4> */}
                <MonthlyPreventiveTable monthPreventiveTrendData={monthPreventiveTrendData} />
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

export default PrevMaintCalendDialog;
