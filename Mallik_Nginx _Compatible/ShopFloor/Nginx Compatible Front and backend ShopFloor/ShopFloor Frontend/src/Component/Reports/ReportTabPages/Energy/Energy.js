import React, { useEffect, useState } from "react";
import "./Energy.css";
import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Button,
  Grid,
  Pagination,
  TablePagination,
  TextField,
  LinearProgress,
  FormLabel,
} from "@mui/material";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import {
  EnergyHourReportService,
  EnergyReportService,
  EnergyconsumptionService,
  MachineListService,
  getTopFiveEnergyReport,
  getEnergyGraphReport
} from "../../../../Services/NodeJsApiServices";
import { DownloadEnergyXl } from "../../../../Services/DownloadCsvReportsService";
import { Chart } from "react-google-charts";

const Energy = () => {
  const [month, setMonth] = useState('');
    const [hrMonth, setHrMonth] = useState('');
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [machine, setMachine] = useState(null);
  const [dateTotalKWh, setDateTotalKWh] = useState("");
  const [reportList, setReportrDataList] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [headerName, setHeaderName] = useState([]);
  const [headerInput, setHeaderInput] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [inputTotal, setInputTotal] = useState("");
  const [listData, setListData] = useState("");
  const [loader, setLoader] = useState(false);
  const [fromDateTime, setFromDateTime] = useState("");
  const [toDateTime, setToDateTime] = useState("");
  const [energyPieData, setEnergyPieData] = useState([]);
  const [energyGraphData, setEnergyGraphData] = useState([]);
  const [graphMaxValue, setGraphMaxValue] = useState(0);
  const [viewReport, setViewReport] = useState(false);

  useEffect(() => {
    MachineListService(handleMachineSuccess, handleMachineException);
  }, []);

  const handleMachineSuccess = (dataObject) => {
    const updatedMachineList = [
      { id: -1, displayName: "All" },
      ...dataObject.data,
    ];
    setMachineList(updatedMachineList);
  };
  const handleMachineException = () => { };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoader(true);
    {
      energyType === 'Day' ? (
        EnergyReportService(
          {
            fromDate: selectedValue,
            toDate: selectedDate,
            meterId: machine,
            month: month
          },
          handleReportSucess,
          handleReportException
        )

      ) :
        (
          EnergyHourReportService(
            {
              fromDate: fromDateTime,
              toDate: toDateTime,
              meterId: machine,
              month: hrMonth
            },
            handleReportSucess,
            handleReportException
          )
        )
    }
    if (energyType === 'Day') {
      getTopFiveEnergyReport(
        {
          fromDate: selectedValue,
          toDate: selectedDate,
        },
        handleTopFiveEnergyReportSucess,
        handleTopFiveEnergyReportException
      )
      getEnergyGraphReport(
        {
          fromDate: selectedValue,
          toDate: selectedDate,
        },
        handleEnergyGraphReportSucess,
        handleEnergyGraphReportException
      )
    }
  };
  // PIE CHART HANDLER
  const handleTopFiveEnergyReportSucess = (dataObject) => {
    const colors = ["#3FA2F6", "#FF4191", "#F4CE14", "#AF47D2", "#40A578"];
    const transformedData = dataObject?.data.map((item, index) => [`${item.machine_name} : ${item.totalKWh} Kwh`, parseFloat(item.totalKWh), colors[index]]);
    const data = [
      ["Machine Name", "Total KWH", "Color"], // Header row
      ...transformedData // Spread the transformed data
    ];
    setEnergyPieData(data);
  }
  const handleTopFiveEnergyReportException = () => { }
  // GRAPH HANDLER
  const handleEnergyGraphReportSucess = (dataObject) => {
    setEnergyGraphData(dataObject?.data)
    setGraphMaxValue(dataObject?.maxValue)
  }
  const handleEnergyGraphReportException = () => { }

  // REPORT HANDLER
  const handleReportSucess = (dataObject) => {
    setListData(dataObject?.machine);
    setReportrDataList(dataObject?.data);
    setDateTotalKWh(dataObject?.dateRangeTotalKWh);
    dataObject?.data?.headers?.consumption &&
      dataObject?.data?.headers?.input &&
      setHeaderName(
        [
          ...dataObject?.data?.headers?.consumption,
          ...dataObject?.data?.headers?.input,
        ] || []
      );
    setHeaderInput(dataObject?.data?.headers?.input || []);
    setBodyData(dataObject?.data?.data || []);
    // setInputTotal(dataObject?.total || ""); THIS IS OLD CODE

    // Extract the values into an array
    const valuesArray = dataObject?.total && Object.values(dataObject?.total).map(value => parseFloat(value));
    console.log(valuesArray);
    setInputTotal(valuesArray);

    setLoader(false);

    // TO SHOW THE REPORT TABLE WHILE SELECTING ALL MACHINE IN HOURWISE
    if (dataObject?.machine === false && energyType === 'Hour') {
      setViewReport(true);
    }

  };
  const handleReportException = () => {
    setLoader(false);
  };

  ////Download CSV

  const DownloadEnergySuccess = () => { };
  const DownloadEnergyException = () => { };

  /////Min And Max date  Calculate function///////////
  const calculateOneMonthFrom = (date) => {
    const selectedDate = new Date(date);
    const oneMonthFromSelectedDate = new Date(selectedDate);
    oneMonthFromSelectedDate.setMonth(oneMonthFromSelectedDate.getMonth() + 1);
    const year = oneMonthFromSelectedDate.getFullYear();
    const month = String(oneMonthFromSelectedDate.getMonth() + 1).padStart(
      2,
      "0"
    );
    const day = String(oneMonthFromSelectedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /////error date show///

  const [energyType, setEnergyType] = useState("Day");



  /////Horr/////

  // PIE CHART CODE
  const data = [
    ["Task", "Hours per Day"],
    ["Work", 11],
    ["Eat", 2],
    ["Commute", 2],
    ["Watch TV", 2],
    ["Sleep", 7],
  ];

  const options = {
    is3D: true,
    // pieSliceText: "label",
    pieSliceText: "labelAndValue",
    // pieSliceTextStyle: {
    //   color: '#ffffff', // Set text color if needed
    //   fontSize: 5, // Adjust font size as needed
    // },
    // pieSliceText: "value",
    // pieStartAngle: 100,
    width: '100%', // This should be set to the desired width or use a fixed value
    height: '100%', // Adjust to fit your design
    // backgroundColor: '#5d5d5d',
    pieHole: 0, // Ensures that there is no hole in the middle of the pie chart
    chartArea: {
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    },
    slices: {
      0: { offset: 0 },
      1: { offset: 0 },
      2: { offset: 0 },
      3: { offset: 0 },
      4: { offset: 0 }
    }
  };

  // BAR CHART
  const dataQ = [
    {
      "name": "Page A",
      "uv": 4000,
      "pv": 2400
    },
    {
      "name": "Page B",
      "uv": 3000,
      "pv": 1398
    },
    {
      "name": "Page C",
      "uv": 2000,
      "pv": 9800
    },
    {
      "name": "Page D",
      "uv": 2780,
      "pv": 3908
    },
    {
      "name": "Page E",
      "uv": 1890,
      "pv": 4800
    },
    {
      "name": "Page F",
      "uv": 2390,
      "pv": 3800
    },
    {
      "name": "Page G",
      "uv": 3490,
      "pv": 4300
    }
  ]

  const getMonthBounds = (monthValue) => {
  if (!monthValue) {
    return { minDate: '', maxDate: '' };
  }

  // monthValue is 'YYYY-MM'
  const year = parseInt(monthValue.substring(0, 4));
  const month = parseInt(monthValue.substring(5, 7)); // month is 1-indexed (1-12)

  // 1. Calculate the first day of the month (Min Date)
  // We use Date.UTC to create a date object representing the start of the month 
  // at midnight UTC, which prevents timezone issues when formatting.
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  
  // toISOString() will now correctly return 'YYYY-MM-01T...'
  const minDate = firstDay.toISOString().substring(0, 10); // Format to 'YYYY-MM-DD'

  // 2. Calculate the last day of the month (Max Date)
  // Go to the next month (month) and set the day to 0 in UTC.
  const lastDay = new Date(Date.UTC(year, month, 0));
  
  // toISOString() will now correctly return 'YYYY-MM-30T...' or 'YYYY-MM-31T...'
  const maxDate = lastDay.toISOString().substring(0, 10); // Format to 'YYYY-MM-DD'

  return { minDate, maxDate };
};

  const { minDate, maxDate } = getMonthBounds(month);



// --- START OF MODIFIED JSX/COMPONENT LOGIC ---

// Helper function to handle month change and set default dates
const handleMonthChange = (e) => {
  const newMonth = e.target.value;
  setMonth(newMonth);

  if (newMonth) {
    // 1. Calculate the bounds for the newly selected month
    const { minDate: newMinDate, maxDate: newMaxDate } = getMonthBounds(newMonth);

    // 2. Automatically set the "From Date" to the 1st of the month
    setSelectedValue(newMinDate); 

    // 3. Automatically set the "To Date" to the last day of the month
    setSelectedDate(newMaxDate); 
  } else {
    // Clear dates if month is cleared
    setSelectedValue('');
    setSelectedDate('');
  }
};


const getMonthDateTimeBounds = (monthValue) => {
  if (!monthValue) {
    return { minDateTime: '', maxDateTime: '' };
  }

  const year = parseInt(monthValue.substring(0, 4));
  const month = parseInt(monthValue.substring(5, 7)); // month is 1-indexed (1-12)

  // 1. Calculate the first day (Min Date Time: YYYY-MM-01T00:00)
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const datePartMin = firstDay.toISOString().substring(0, 10);
  const minDateTime = `${datePartMin}T00:00`; 

  // 2. Calculate the last day (Max Date Time: YYYY-MM-DDT23:59)
  const lastDay = new Date(Date.UTC(year, month, 0)); // Day 0 of next month is last day of current
  const datePartMax = lastDay.toISOString().substring(0, 10);
  const maxDateTime = `${datePartMax}T23:59`; // Setting time to 23:59

  return { minDateTime, maxDateTime };
};

// --- Combined Constraints ---
const { minDateTime: monthMinDateTime, maxDateTime: monthMaxDateTime } = getMonthDateTimeBounds(hrMonth);

// Helper function to handle month change and set default date/times
const handleMonthHrChange = (e) => {
  const newMonth = e.target.value;
  setHrMonth(newMonth);

  if (newMonth) {
    const { minDateTime, maxDateTime } = getMonthDateTimeBounds(newMonth);

    // 1. Automatically set the "From Date Time" to the 1st of the month at 00:00
    setFromDateTime(minDateTime); 

    // 2. Automatically set the "To Date Time" to the last day of the month at 23:59
    setToDateTime(maxDateTime); 
  } else {
    // Clear dates if month is cleared
    setFromDateTime('');
    setToDateTime('');
  }
};

  return (
    <>
      <div className="energy_bottomContainer">
        <div className="energy_headerContainer">
          <span style={{ fontWeight: 'bold', color: '#000000', fontFamily: 'Roboto Slab' }}>ENERGY CONSUMPTION REPORT</span>
        </div>

        <div
          className="energy_bottm_date_containet" /*style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-evenly', flexDirection: 'row', flexWrap: 'wrap' }}*/
        >
          <Grid
            container
            spacing={5}
            paddingLeft={"50px"}
            paddingRight={"30px"}
          >
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} padding={2}>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  aria-label="energyType"
                  name="row-radio-buttons-group"
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value)}
                >
                  <FormControlLabel
                    value="Day"
                    control={<Radio
                      sx={{
                        color: '#686D76', // unselected color
                        '&.Mui-checked': {
                          color: '#000000', // selected color
                        }
                      }}
                    />}
                    label="Day"
                  />
                  <FormControlLabel
                    value="Hour"
                    control={<Radio
                      sx={{
                        color: '#686D76', // unselected color
                        '&.Mui-checked': {
                          color: '#000000', // selected color
                        }
                      }}
                    />}
                    label="Hour"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            {energyType === "Day" && (
              <>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    fullWidth
                    size="small"

                    label="From Month "
                    placeholder='From Month'
                    variant="outlined"
                    required
                    type='month'
                    value={month}
                    // onChange={(e) => setMonth(e.target.value)}
                      onChange={handleMonthChange} 
                    InputLabelProps={
                      {
                        shrink: true
                      }
                    } />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    id="outlined-basic"
                    label="From Date"
                    type="date"
                    variant="outlined"
                    value={selectedValue}
                    required
                    onChange={(e) => {
                      setSelectedValue(e.target.value);
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      // *** APPLY MONTH MIN/MAX HERE ***
                      min: minDate,
                      max: maxDate,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    id="outlined-basic"
                    label="To Date"
                    type="date"
                    variant="outlined"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                    }}
                    required
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      // *** COMBINE CONSTRAINTS ***
                      // Min is the greater of (1) the month's start, or (2) the From Date
                      min: selectedValue ? selectedValue : minDate,
                      // Max is the lesser of (1) the month's end, or (2) one month from From Date (if you still need that logic)
                      // Since the month boundary is stricter, we just use the month's end.
                      max: maxDate,
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Energy Source{" "}
                    </InputLabel>
                    <Select
                      size="small"
                      labelId="demo-simple-selct-label"
                      id="demo-simple-select"
                      label="Energy Source"
                      value={machine == null ? "All" : machine}
                      onChange={(e) => {
                        setMachine(e.target.value);
                      }}
                    >
                      {machineList.map((data) => {
                        return (
                          <MenuItem value={data.id}>
                            {" "}
                            {data.displayName}{" "}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: '-20px'
                  }}
                >
                  <div className="energy_button_container">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSubmit}
                      disabled={!selectedValue || !selectedDate || !machine} // Disable if any field is empty

                      sx={{
                        backgroundColor: 'black',

                      }}
                    >
                      Search
                    </Button>
                  </div>
                </Grid>
              </>
            )}

            {/* --------------------------------------------------------------------------CHART CODE---------------------------------------------------------------------------------- */}
            {energyType === 'Day' && energyPieData.length > 0 && listData === false &&
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                <Typography style={{ fontWeight: 'bold', marginBottom: '10px' }}>Top 5 Machines</Typography>
                <Chart
                  chartType="PieChart"
                  data={energyPieData}
                  options={options}
                  width={"100%"}
                  height={"290px"}
                />
              </Grid>
            }
            {energyType === 'Day' && energyGraphData.length > 0 && listData === false &&
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                <Typography style={{ fontWeight: 'bold', marginBottom: '10px' }}>Total KWh Per Day</Typography>
                <ResponsiveContainer width={"100%"} height={320}>
                  <BarChart data={energyGraphData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, graphMaxValue]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalKWh" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
            }
            {energyType === 'Day' && bodyData && bodyData.length > 0 && listData === false &&
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} display={'flex'} justifyContent={'center'} alignItems={'center'} >
                <Button variant="contained" onClick={() => setViewReport(!viewReport)}>{viewReport ? 'Hide Report' : 'View Report'}</Button>
              </Grid>
            }
            {/* --------------------------------------------------------------------------CHART CODE---------------------------------------------------------------------------------- */}


            {energyType === "Hour" && (
              <>
              <Grid
                  item
                  xs={12}
                  sm={12}
                  md={2}
                  lg={2}
                  xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="From Month "
                    placeholder='From Month'
                    variant="outlined"
                    required
                    type='month'
                    value={hrMonth}
                    // *** USING THE NEW HANDLER ***
                    onChange={handleMonthHrChange} 
                    InputLabelProps={
                      {
                        shrink: true
                      }
                    } />
                </Grid>

              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} style={{ display: "flex", justifyContent: "center" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  id="outlined-basic"
                  label="From Date Time"
                  type="datetime-local"
                  variant="outlined"
                  value={fromDateTime} // Will be set by handleMonthChange to YYYY-MM-01T00:00
                  required
                  onChange={(e) => {
                    setFromDateTime(e.target.value);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    // Apply overall month bounds as constraints
                    min: monthMinDateTime, 
                    max: monthMaxDateTime, 
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={2} lg={2} xl={2}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  id="outlined-basic"
                  label="To Date Time"
                  type="datetime-local"
                  variant="outlined"
                  value={toDateTime} // Will be set by handleMonthChange to YYYY-MM-DDT23:59
                  onChange={(e) => {
                    setToDateTime(e.target.value);
                  }}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    // 1. Min must be at least the From Date Time
                    min: fromDateTime, 
                    // 2. Max must be the lesser of (a) one month from From Date Time OR (b) the month end
                    max: month
                      ? (calculateOneMonthFrom(fromDateTime) > monthMaxDateTime 
                          ? monthMaxDateTime
                          : calculateOneMonthFrom(fromDateTime)
                        )
                      : calculateOneMonthFrom(fromDateTime)
                  }}
                />
              </Grid>

                <Grid item xs={12} sm={12} md={2} lg={2} xl={2}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      Energy Source{" "}
                    </InputLabel>
                    <Select
                      size="small"
                      labelId="demo-simple-selct-label"
                      id="demo-simple-select"
                      label="Energy Source"
                      value={machine == null ? "All" : machine}
                      onChange={(e) => {
                        setMachine(e.target.value);
                      }}
                    >
                      {machineList.map((data) => {
                        return (
                          <MenuItem value={data.id}>
                            {" "}
                            {data.displayName}{" "}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12} md={2} lg={2} xl={2}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div className="energy_button_container">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={handleSubmit}
                      disabled={!fromDateTime || !toDateTime || !machine}
                    >
                      Search
                    </Button>
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        </div>


        {listData === true && (
          <div className="lineChartContainer">
            <LineChart
              width={730}
              height={250}
              data={reportList}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              className="linechartCom"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="energyConsum" stroke="#8884d8" />
              {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
            </LineChart>
          </div>
        )}

        {loader ? (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        ) : null}
      </div>

      <div className="energy_table_bottomContainer">
        <div className="energy_table_sub_bottomContainer">
          {listData === false && viewReport && (
            <table id="customers">
              <tr>
                <th
                  colSpan={headerName.length - 3}
                  style={{ textAlign: "center" }}
                >
                  CONSUMPTION
                </th>
                <th
                  colSpan={headerInput.length - 1}
                  style={{ textAlign: "center" }}
                >
                  INPUT
                </th>
                <th></th>
              </tr>
              {/* <tr>
                            <th className="tableHeader">Date</th>
                        </tr> */}

              <tr>
                {headerName &&
                  headerName.map((item, key) => (
                    <th className="tableHeader" key={key}>
                      {item}
                    </th>
                  ))}
              </tr>

              {bodyData &&
                bodyData.map((item, key) => (
                  <tr>
                    <React.Fragment key={key}>
                      {item &&
                        Object.keys(item).map((header, index) => (
                          <td
                            className="tableData"
                            key={
                              index
                            } /*style={{ width: index === 0 ? "100px" : "auto" }}*/
                          >
                            {item[header]}
                          </td>
                        ))}
                    </React.Fragment>
                  </tr>
                ))}



              <tr>
                <td
                  style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#000000",
                  }}
                >
                  TOTAL
                </td>
                {inputTotal && (
                  <>
                    {inputTotal && inputTotal.map((tot) => (
                      <td
                        style={{
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "#000000",
                        }}
                      >
                        {tot}
                      </td>
                    ))
                    }
                  </>)}
              </tr>
              <tr>
                <td
                  colSpan={headerName.length}
                  className="bottomButtonContainer"
                >
                  <Grid container spacing={2} justifyContent={"center"}>
                    <Grid item>
                      <Button variant="contained"
                        onClick={() => {
                          DownloadEnergyXl({
                            fromDate: energyType === 'Day' ?
                              selectedValue : fromDateTime,
                            toDate: energyType === 'Day' ?
                              selectedDate : toDateTime,
                            meterId: machine
                          },
                            DownloadEnergySuccess,
                            DownloadEnergyException
                          );
                        }}
                      >Download CSV</Button>
                    </Grid>
                    <Grid item>
                      <Button variant="contained">Download PDF</Button>
                    </Grid>
                  </Grid>
                </td>
              </tr>
            </table>
          )}

          {listData === true && (
         <table id="customers">
  <thead>
    <tr>
      <th>Date</th>
      <th>Opening KWh</th>
      <th>Closing KWh</th>
      <th>Energy Consumption/Day [kWh]</th>
    </tr>
  </thead>

  <tbody>
    {reportList &&
      reportList.map((item) => (
        <tr key={item.id}>
          <td>{item.date}</td>
          <td>{item.openKWh}</td>
          <td>{item.closingKWh}</td>
          <td>{item.energyConsum}</td>
        </tr>
      ))}

    {/* ✅ TOTAL row aligned under Energy Consumption */}
    <tr>
      <td
        colSpan={3}
        style={{
          fontWeight: "bold",
          textAlign: "right",
          color: "#000000",
        }}
      >
        TOTAL
      </td>
      <td
        style={{
          fontWeight: "bold",
          textAlign: "center",
          color: "#000000",
        }}
      >
        {dateTotalKWh}
      </td>
    </tr>

    {/* ✅ Buttons row */}
    <tr>
      <td colSpan={4} className="bottomButtonContainer">
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button variant="contained">Download CSV</Button>
          </Grid>
          <Grid item>
            <Button variant="contained">Download PDF</Button>
          </Grid>
        </Grid>
      </td>
    </tr>
  </tbody>
</table>

         
         )}
          {/* <Pagination count={10} page={page}
                        onChange={handleChange} /> */}
        </div>
      </div>

    </>
  );
};
export default Energy;