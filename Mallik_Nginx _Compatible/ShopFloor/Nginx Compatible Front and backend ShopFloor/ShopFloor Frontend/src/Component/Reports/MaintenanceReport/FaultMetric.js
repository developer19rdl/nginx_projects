import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect } from "react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  AddToolsMachineView,
  Machinedata,
  MACHINEDOWNTIMEView,
  MACHINEDOWNTIMEViewBymachine,
  MACHINEGraphView,
  MACHINEGraphViewbymachine,
  MACHINEGraphViewbymachineFilter,
  MaintenanceShudeleName,
  showmachine,
} from "../../../Services/NodeJsApiServices";
import MttrReports from "./MttrReports";
// import {
//   MACHINEDOWNTIMEView,
//   MACHINEDOWNTIMEViewBymachine,
//   MACHINEGraphView,
//   MACHINEGraphViewbymachine,
//   MaintenanceShudeleName,
// } from "../../../services/LoginServiceNod";

const FaultMetric = () => {
  const [selectedRadio, setSelectedRadio] = useState("");
  const [selectedGraph, setSelectedGraph] = useState("");
  const [downTimeYear, setDownTimeYear] = useState("");
  const [downTimeMonth, setDownTimeMonth] = useState("");
  const [faultYear, setFaultYear] = useState("");
  const [faultMonth, setFaultMonth] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineNameList, setMachineNameList] = useState([]);
  const [Mgraph, setMgraph] = useState([]);
  const [dateGraph, setDateGraph] = useState([]);
  const [machineGraphCondition, setMachineGraphCondition] = useState("line");

  const [rows, setRows] = useState("");
  const [rows2, setRows2] = useState("");

  const [selectedOption, setSelectedOption] = useState("date"); // Default to 'date'
  const [selectedOptionGraph, setSelectedOptionGraph] = useState("date");
  const [open, setOpen] = useState(false);

  const handleRadioChange = (event) => {
    setSelectedGraph("");
    setMachineGraphCondition("line");
    setMgraph([]);
    setSelectedOption(event.target.value);
  };

  const handleGraphChange = (event) => {
    setSelectedGraph(event.target.value);
    setMachineGraphCondition("bar");
    if (selectedOption == "machine") {
      MACHINEGraphViewbymachineFilter(
        {
          year: formattedDownTimeMonth.year,
          month: formattedDownTimeMonth.month,
          machine: machineName,
          filterType: event.target.value,
        },
        machinegrphhandel,
        machingraphexception
      );
    } else {
      MACHINEGraphView(
        {
          year: formattedDownTimeMonth.year,
          month: formattedDownTimeMonth.month,
          filterType: event.target.value,
        },
        machinegrphhandel,
        machingraphexception
      );
    }
  };

  const graphFilterHandlerSuccess = () => {};
  const graphFilterHandlerException = () => {};

  const handleMachineChange = (event) => {
    setMachineName(event.target.value);
  };

  useEffect(() => {
    selectedOption == "machine" &&
      Machinedata(handelsucessName, handelexceptionName);
    // FIRST WORKING MT RELATED API
    // MACHINEGraphView(
    //   {
    //     year: formattedDownTimeMonth.year,
    //     month: formattedDownTimeMonth.month,
    //     filterType: selectedGraph,
    //   },
    //   machinegrphhandel,
    //   machingraphexception
    // );
  }, [selectedOption, selectedGraph]);

  const machinegrphhandelbyname = (dataObject) => {
    // Flatten the downtimeDetails from each result into a single array
    // const downtimeDetailsArray = dataObject.results.flatMap((item) =>
    //   item.downtimeDetails.map((detail) => ({
    //     date: detail.date,
    //     downTime: detail.downTime,
    //   }))
    // );
    // Log the result for debugging
    // console.log("downtimeDetailsArray==", downtimeDetailsArray);
    // Set the extracted downtime details array of objects
    // setDateGraph(downtimeDetailsArray);
  };

  const machingraphexceptionbyname = () => {};

  useEffect(() => {
    console.log("rows=====", rows);
  }, [rows]);

 

  const machinegrphhandel = (dataObject) => {
    console.log("dataObjectdataObjectdataObjectdataObject", dataObject);

    const transformedData = dataObject.results.map((item) => {
      let timeKey = "";
      let timeValue = "";

      if (item.mttf) {
        timeKey = "mttf";
        timeValue = item.mttf;
      } else if (item.mtbf) {
        timeKey = "mtbf";
        timeValue = item.mtbf;
      } else if (item.mttr) {
        timeKey = "mttr";
        timeValue = item.mttr;
      } else {
        return item; // No recognized time key, return the item as is
      }

      let totalMinutes;
      if (typeof timeValue === "string" && timeValue.includes(":")) {
        // If timeValue is a string with colon, split as minutes and seconds
        const [minutes, seconds] = timeValue.split(":").map(Number);
        totalMinutes = minutes + seconds / 60;
      } else if (typeof timeValue === "number") {
        // If timeValue is a number, assume it represents minutes directly
        totalMinutes = timeValue;
      } else {
        // If timeValue is a string without colon, parse it as a float
        totalMinutes = parseFloat(timeValue);
      }

      const hours = (totalMinutes / 60).toFixed(2); // Convert minutes to hours and keep two decimal places

      return {
        ...item,
        [timeKey]: hours,
      };
    });

    // setMgraph(transformedData);
    setMgraph(dataObject.results || []);
    console.log(
      "transformedDatatransformedDatatransformedData",
      transformedData
    );
  };

  const machingraphexception = () => {};

  const handelsucessName = (dataObject) => {
    setMachineNameList(dataObject.data);
  };

  const handelexceptionName = () => {};





  const columns = [
    {
      field: "machine",
      headerName: "Machine Name",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    // Dynamic date columns from 1 to 31
    ...Array.from({ length: 31 }, (_, index) => ({
      field: (index + 1).toString(),
      headerName: (index + 1).toString(),
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    })),
    {
      field: "Total",
      headerName: "TOTAL",
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "Occurrence",
      headerName: "Occurrence",
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTTR",
      headerName: "MTTR",
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTTRTarget",
      headerName: "MTTR Target",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTBF",
      headerName: "MTBF",
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTBFTarget",
      headerName: "MTBF Target",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTTF",
      headerName: "MTTF",
      headerClassName: "super-app-theme--header",
      minWidth: 80,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "MTTFTarget",
      headerName: "MTTF Target",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
  ];

  const handelSearch = () => {
    // CLEARING MTTF AFTER SEARCH
    // setDateGraph('');
    setMachineGraphCondition("line");

    selectedOption == "date"
      ? MACHINEDOWNTIMEView(
          {
            year: formattedDownTimeMonth.year,
            month: formattedDownTimeMonth.month,
          },
          handeldownView,
          handelexceptionDownView
        )
      : MACHINEDOWNTIMEViewBymachine(
          {
            year: formattedDownTimeMonth.year,
            month: formattedDownTimeMonth.month,
            machine: machineName,
          },
          handeldownView2,
          handelexceptionDownView2
        );

    selectedOption == "machine" &&
      MACHINEGraphViewbymachine(
        {
          year: formattedDownTimeMonth.year,
          month: formattedDownTimeMonth.month,
          machine: machineName,
        },
        machinegrphhandelbyname,
        machingraphexceptionbyname
      );
  };

  const transformData = (data) => {
    const transformedRows = data.map((item) => {
      const row = {
        id: item.id,
        machine: item.machine,
        MTBF: item.MTBF,
        MTBFTarget: item.MTBFTarget,
        MTTF: item.MTTF,
        MTTFTarget: item.MTTFTarget,
        MTTR: item.MTTR,
        MTTRTarget: item.MTTRTarget,
        Total: item.totalDownTime,
        Occurrence: item.totalOccurrences,
      };

      // Initialize all date fields to 0
      for (let i = 1; i <= 31; i++) {
        row[i] = 0;
      }

      // Map downtimeDetails to the corresponding date field
      item.downtimeDetails.forEach((downtimeDetail) => {
        // const date = new Date(downtimeDetail.date).getDate();
        let [day, month, year] = downtimeDetail.date.split("-");
        const date = new Date(`${year}-${month}-${day}`).getDate();
        row[date] = downtimeDetail.downTime;
      });

      return row;
    });

    return transformedRows;
  };

  const [downTime, setDownTime] = useState("");
  const handeldownView = (dataObject) => {
    const transformedRows = transformData(dataObject.results);
    // const result=dataObject.results
    // console.log("dataObject.totalDownTime",result.totalDownTime)
    // setDownTime(result.totalDownTime)
    setRows(transformedRows);
  };

  const handelexceptionDownView = () => {};

  const handeldownView2 = (dataObject) => {
    const transformedRows = transformData(dataObject.results);
    setRows2(transformedRows);
  };
  const handelexceptionDownView2 = () => {};

  const [downTimeMonthRaw, setDownTimeMonthRaw] = useState("");

  const [formattedDownTimeMonth, setFormattedDownTimeMonth] = useState({
    year: "",
    month: "",
  });

  const handleMonthChange = (e) => {
    const value = e.target.value;
    setDownTimeMonthRaw(value);

    const [year, month] = value.split("-");
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const formattedMonth = {
      year: year,
      month: monthNames[parseInt(month, 10) - 1],
    };
    setFormattedDownTimeMonth(formattedMonth);
  };

  const roundOffData = (data, key) => {
    return data.map((item) => ({
      ...item,
      [key]: Math.round(item[key]),
    }));
  };

  const roundedData = roundOffData(Mgraph, selectedGraph);
  const yAxisTicks = [0, 5, 10, 15, 20, 25];

  const handleClickOpen = () => { 
    // Open the MTTR Reports dialog
    setOpen(true);
  };
    const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Roboto Slab",
              fontWeight: "bold",
              color: "#000",
              // marginBottom: 2,
              mt: 2,
              paddingLeft: 4,
            }}
          >
            FAULT METRIC
          </Typography>
        </Grid>

        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <FormControl
            component="fieldset"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <RadioGroup
              aria-label="options"
              name="options"
              value={selectedOption}
              onChange={handleRadioChange}
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center", // Center the radio buttons
                width: "auto", // Adjust the width to fit the content
                gap: 0, // Remove any gap between the radio buttons
              }}
            >
              <FormControlLabel
                value="date"
                control={
                  <Radio
                    sx={{
                      color: "#686D76", // unselected color
                      "&.Mui-checked": {
                        color: "#000000", // selected color
                      },
                    }}
                  />
                }
                label="Date"
                sx={{ marginRight: 0 }} // Remove right margin
              />
              <FormControlLabel
                value="machine"
                control={
                  <Radio
                    sx={{
                      color: "#686D76", // unselected color
                      "&.Mui-checked": {
                        color: "#000000", // selected color
                      },
                    }}
                  />
                }
                label="Machine"
                sx={{ marginLeft: 0 }} // Remove left margin
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container spacing={1} padding={2}>
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={12}
          xl={12}
          style={{ marginTop: "5px" }}
        >
          <Card
            style={{
              boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
              borderRadius: "10px",
              width: "100%",
              height: "100%",
              padding: "20px",
            }}
          >
            <>
              {selectedOption === "date" && (
                <Typography
                  sx={{
                    textAlign: "left",
                    fontFamily: "Roboto Slab",
                    fontWeight: "bold",
                    color: "black",
                  }}
                  variant="h5"
                >
                  MACHINE DOWNTIME AND OCCURRENCE DETAILS
                </Typography>
              )}

              {selectedOption === "machine" && (
                <Typography
                  sx={{
                    textAlign: "left",
                    fontFamily: "Roboto Slab",
                    fontWeight: "bold",
                    color: "black",
                  }}
                  variant="h5"
                >
                  MACHINE FAULT METRIC REPORT
                </Typography>
              )}
            </>

            <Grid container spacing={2}>
              <Grid
                item
                xs={12}
                sm={4}
                md={4}
                lg={4}
                xl={4}
                style={{ marginTop: "30px" }}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  sx={{ marginBottom: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Year"
                    placeholder="Year"
                    variant="outlined"
                    required
                    type="year"
                    onChange={(e) => {
                      setDownTimeYear(e.target.value);
                    }}
                    value={downTimeYear}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  sx={{ marginBottom: 2 }}
                >
                  <TextField
                    fullWidth
                    label="Month"
                    placeholder="Month"
                    variant="outlined"
                    required
                    type="month"
                    onChange={handleMonthChange}
                    value={downTimeMonthRaw}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {selectedOption == "machine" && (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label">
                        Select Machine
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Select Machine"
                        placeholder="Select Machine"
                        value={machineName}
                        required
                        onChange={(e) => handleMachineChange(e)}
                      >
                        {machineNameList?.map((data, index) => {
                          return (
                            <MenuItem value={data.id} key={index}>
                              {data.machine_name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid container item xs={6} sm={6} md={6} lg={6} xl={6}>
              <Grid
                  item
                  xs={4}
                  sm={4}
                  md={4}
                  lg={4}
                  xl={4}
                  style={{ marginTop: "15px", marginBottom: "10px" }}
                >
                  <Button
                    variant="contained"
                    style={{ background: "#051622", color: "white" }}
                    onClick={handelSearch}
                  >
                    Search
                  </Button>
                </Grid>
                <Grid
                  item
                  xs={8}
                  sm={8}
                  md={8}
                  lg={8}
                  xl={8}
                  style={{ marginTop: "15px", marginBottom: "10px" }}
                >
                  <Button
                    variant="contained"
                    style={{ background: "#051622", color: "white" }}
                    onClick={handleClickOpen}
                    
                  >
                    MTTR Download
                  </Button>
                </Grid>

                </Grid>
               
                
              </Grid>
              


              {selectedOption === "date" ? (
                <Grid
                  item
                  xs={12}
                  sm={8}
                  md={8}
                  lg={8}
                  xl={8}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "-30px",
                  }}
                >
                  <Grid item xs={12}>
                    <RadioGroup
                      row
                      value={selectedGraph}
                      onChange={handleGraphChange}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <FormControlLabel
                        value="mttf"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTTF"
                      />
                      <FormControlLabel
                        value="mtbf"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTBF"
                      />
                      <FormControlLabel
                        value="mttr"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTTR"
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      height: "150vh",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {" "}
                    {/* Increase the height to 90vh and width to 100% */}
                    {/* <BarChart
                      width={730}
                      height={250}
                      data={Mgraph}
                      className="gas_barchartCom"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="machine"
                        tick={{ textAnchor: "end" }}
                        interval={0}
                      />
                      {Mgraph.some((data) => data[selectedGraph] < 0) ? (
                        <YAxis ticks={yAxisTicks} />
                      ) : (
                        <YAxis />
                      )}
                      <Tooltip />
                      <Legend />
                      <Bar dataKey={selectedGraph} fill="#8884d8" />
                    </BarChart> */}
                    {selectedGraph === "mttf" && (
                      <BarChart width={730} height={250} data={Mgraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="machine" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="mttf" fill="#8884d8" />
                      </BarChart>
                    )}
                    {selectedGraph === "mtbf" && (
                      <BarChart width={730} height={250} data={Mgraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="machine" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="mtbf" fill="#8884d8" />
                      </BarChart>
                    )}
                    {selectedGraph === "mttr" && (
                      <BarChart width={730} height={250} data={Mgraph}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="machine" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="mttr" fill="#8884d8" />
                      </BarChart>
                    )}
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  item
                  xs={12}
                  sm={8}
                  md={8}
                  lg={8}
                  xl={8}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: "-30px",
                  }}
                >
                  <Grid item>
                    <RadioGroup
                      row
                      value={selectedGraph}
                      onChange={handleGraphChange}
                      style={{ display: "flex", justifyContent: "center" }}
                    >
                      <FormControlLabel
                        value="mttf"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTTF"
                      />
                      <FormControlLabel
                        value="mtbf"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTBF"
                      />
                      <FormControlLabel
                        value="mttr"
                        control={
                          <Radio
                            sx={{
                              color: "#686D76", // unselected color
                              "&.Mui-checked": {
                                color: "#000000", // selected color
                              },
                            }}
                          />
                        }
                        label="MTTR"
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid
                    item
                    xs={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {
                      machineGraphCondition === "bar" && (
                        // <BarChart
                        //   width={730}
                        //   height={250}
                        //   data={Mgraph}
                        //   className="gas_barchartCom"
                        // >
                        //   <CartesianGrid strokeDasharray="3 3" />
                        //   <XAxis
                        //     dataKey="machine"
                        //     tick={{ textAnchor: "end" }}
                        //     interval={0}
                        //   />
                        //   {Mgraph.some((data) => data[selectedGraph] < 0) ? (
                        //     <YAxis ticks={yAxisTicks} />
                        //   ) : (
                        //     <YAxis />
                        //   )}
                        //   <Tooltip />
                        //   <Legend />
                        //   <Bar dataKey={selectedGraph} fill="#8884d8" />
                        // </BarChart>
                        <>
                          {selectedGraph === "mttf" && (
                            <BarChart width={730} height={250} data={Mgraph}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="machine_name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="mttf" fill="#8884d8" />
                            </BarChart>
                          )}
                          {selectedGraph === "mtbf" && (
                            <BarChart width={730} height={250} data={Mgraph}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="machine_name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="mtbf" fill="#8884d8" />
                            </BarChart>
                          )}
                          {selectedGraph === "mttr" && (
                            <BarChart width={730} height={250} data={Mgraph}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="machine_name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="mttr" fill="#8884d8" />
                            </BarChart>
                          )}
                        </>
                      )
                      // :
                      // <LineChart
                      //   width={730}
                      //   height={250}
                      //   data={dateGraph}
                      //   margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      //   className="gas_linechartCom"
                      // >
                      //   <CartesianGrid strokeDasharray="3 3" />
                      //   <XAxis dataKey="date" />
                      //   <YAxis />
                      //   <Tooltip />
                      //   <Legend />
                      //   <Line
                      //     type="monotone"
                      //     dataKey="downTime"
                      //     stroke="#8884D8"
                      //   />
                      // </LineChart>
                    }
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>

        {selectedOption == "date" ? (
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
            <Card
              style={{
                boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                width: "100%",
                height: "100%",
                // padding: '20px',
                paddingBottom: "15px",
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    textAlign: "left",
                    fontFamily: "Roboto Slab",
                    fontWeight: "bold",
                    marginBottom: "10px",
                    color: "black",
                  }}
                  variant="h5"
                >
                  MACHINE DOWNTIME AND OCCURENCE DETAILS
                </Typography>
                {rows.Total !== 0 && (
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={8}
                      rowsPerPageOptions={[8]}
                      disableSelectionOnClick
                      sx={{
                        height: "300px",
                        width: "100%",
                        "& .super-app-theme--header": {
                          WebkitTextStrokeWidth: "0.6px",
                        },
                      }}
                    />
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginTop={1}>
            <Card
              style={{
                boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
                borderRadius: "10px",
                width: "100%",
                height: "100%",
              }}
            >
              <CardContent>
                <Typography
                  sx={{
                    textAlign: "left",
                    fontFamily: "Roboto Slab",
                    fontWeight: "bold",
                    color: "black",
                  }}
                  variant="h5"
                >
                  Failure Metric Report [ Shearing Machine ]
                </Typography>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <DataGrid
                    rows={rows2}
                    columns={columns}
                    pageSize={8}
                    rowsPerPageOptions={[8]}
                    disableSelectionOnClick
                    sx={{
                      height: "300px",
                      width: "100%",
                      "& .super-app-theme--header": {
                        WebkitTextStrokeWidth: "0.6px",
                      },
                    }}
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      <MttrReports
        open={open} 
        setOpen={setOpen} 
        handleClose={handleClose}
        formattedDownTimeMonth={formattedDownTimeMonth}
        setFormattedDownTimeMonth={setFormattedDownTimeMonth}  
      />
    </div>
  );
};

export default FaultMetric;
