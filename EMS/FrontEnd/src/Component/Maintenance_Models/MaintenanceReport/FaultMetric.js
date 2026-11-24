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
  Tooltip,
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
} from "recharts";
import {
  MACHINEDOWNTIMEView,
  MACHINEDOWNTIMEViewBymachine,
  MACHINEGraphView,
  MACHINEGraphViewbymachine,
  MaintenanceShudeleName,
} from "../../../services/LoginServiceNod";

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
  const [dateGraph,setDateGraph] = useState([]);

  const [rows, setRows] = useState("");
  const [rows2, setRows2] = useState("");

  const [selectedOption, setSelectedOption] = useState("date"); // Default to 'date'
  const [selectedOptionGraph, setSelectedOptionGraph] = useState("date");

  const handleRadioChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleGraphChange = (event) => {
    setSelectedGraph(event.target.value);
  };

  const handleMachineChange = (event) => {
    setMachineName(event.target.value);
  };

  useEffect(() => {
    selectedOption == "machine" &&
      MaintenanceShudeleName(handelsucessName, handelexceptionName);
    MACHINEGraphView(
      {
        year: formattedDownTimeMonth.year,
        month: formattedDownTimeMonth.month,
        filterType: selectedGraph,
      },
      machinegrphhandel,
      machingraphexception
    );

   

  }, [selectedOption, selectedGraph]);

  const machinegrphhandelbyname = (dataObject) => {
    // Flatten the downtimeDetails from each result into a single array
    const downtimeDetailsArray = dataObject.results.flatMap(item => item.downtimeDetails.map(detail => ({
      date: detail.date,
      downTime: detail.downTime
    })));
  
    // Log the result for debugging
    console.log("downtimeDetailsArray==", downtimeDetailsArray);
  
    // Set the extracted downtime details array of objects
    setDateGraph(downtimeDetailsArray);
  };

  const machingraphexceptionbyname=()=>{
    
  }



  useEffect(() => {
    console.log("rows=====", rows);
  }, [rows]);

  const machinegrphhandel = (dataObject) => {
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

      const [minutes, seconds] = timeValue.split(":").map(Number);
      const totalMinutes = minutes + seconds / 60;
      const hours = (totalMinutes / 60).toFixed(2); // Convert minutes to hours and keep two decimal places

      return {
        ...item,
        [timeKey]: hours,
      };
    });

    setMgraph(transformedData);
    console.log("setMgraph", transformedData);
  };

  const machingraphexception = () => {};

  const handelsucessName = (dataObject) => {
    setMachineNameList(dataObject.data);
  };

  const handelexceptionName = () => {};

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  const columns2 = [
    {
      field: "date",
      headerName: "Date",
      headerClassName: "super-app-theme--header",
      minWidth: 100,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
    {
      field: "downTime",
      headerName: "Down Time[H:m:s]",
      headerClassName: "super-app-theme--header",
      minWidth: 50,
      flex: 1,
      align: "left",
      headerAlign: "center",
    },
  ];

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

        selectedOption == "machine" &&(
          MACHINEGraphViewbymachine({ year: formattedDownTimeMonth.year,
            month: formattedDownTimeMonth.month,
            machine:machineName
         },  machinegrphhandelbyname,
            machingraphexceptionbyname)
        )
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
        const date = new Date(downtimeDetail.date).getDate();
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
  const yAxisTicks = [0, 5, 10, 15,20,25];

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
          <FormControl
            component="fieldset"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
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
                justifyContent: "space-evenly",
                width: "100%",
              }}
            >
              <FormControlLabel value="date" control={<Radio />} label="Date" />
              <FormControlLabel
                value="machine"
                control={<Radio />}
                label="Machine"
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
            }}
          >
            <>
              {selectedOption === "date" && (
                <Typography
                  sx={{
                    textAlign: "left",
                    fontFamily: "Roboto Slab",
                    fontWeight: "bold",
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
                              {data.MachineName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  style={{ marginTop: "5px", marginBottom: "10px" }}
                >
                  <Button
                    variant="contained"
                    style={{ background: "#051622", color: "white" }}
                    onClick={handelSearch}
                  >
                    Search
                  </Button>
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
                        control={<Radio />}
                        label="MTTF"
                      />
                      <FormControlLabel
                        value="mtbf"
                        control={<Radio />}
                        label="MTBF"
                      />
                      <FormControlLabel
                        value="mttr"
                        control={<Radio />}
                        label="MTTR"
                      />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12} style={{ height: "150vh", width: "100%" }}>
                    {" "}
                    {/* Increase the height to 90vh and width to 100% */}
                 
                      <BarChart   width={730}
                      height={250} data={Mgraph} className="gas_barchartCom">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="machine"
                          tick={{ angle: -45, textAnchor: "end" }}
                          interval={0}
                        />
                        <YAxis ticks={yAxisTicks}/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={selectedGraph} fill="#8884d8" />
                      </BarChart>
                  
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Grid item xs={6} >
                    <LineChart
                      width={730}
                      height={250} 
                      data={dateGraph}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      className="gas_linechartCom"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="downTime" stroke="#8884D8" />
                    </LineChart>
                  </Grid>
                </>
              )}
            </Grid>
          </Card>
        </Grid>

        {selectedOption == "date" ? (
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
    </div>
  );
};

export default FaultMetric;
