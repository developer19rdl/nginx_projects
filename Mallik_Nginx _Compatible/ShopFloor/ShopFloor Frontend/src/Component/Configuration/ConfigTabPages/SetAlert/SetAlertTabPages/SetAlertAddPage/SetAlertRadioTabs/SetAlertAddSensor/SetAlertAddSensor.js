// import React, { useEffect, useState } from "react";
// import Box from "@mui/material/Box";
// import Card from "@mui/material/Card";
// import CardContent from "@mui/material/CardContent";
// import Typography from "@mui/material/Typography";
// import {
//   AppBar,
//   Button,
//   FormControl,
//   FormControlLabel,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Radio,
//   RadioGroup,
//   Select,
//   TextField,
//   Toolbar,
// } from "@mui/material";
// import "./SetAlertAddSensor.css";
// import { Setalert, SetalertMachineView, Setalertsensorname } from "../../../../../../../../Services/NodeJsApiServices";
// // import {
// //   Setalert,
// //   SetalertMachineView,
// //   Setalertsensorname,
// // } from "../../../../../../../../services/LoginServiceNod";

// const SetAlertAddSensor = ({
//   selectedTabRadioValue,
//   setSelectedTabRadioValue,
// }) => {
//   const [age, setAge] = useState("");
//   const [selectedRadioValue, setSelectedRadioValue] = useState("");
//   const [machineNamelist, setmachineNamelist] = useState([]);
//   const [sensorNamelist, setsensorNamelist] = useState([]);

//   const [machine, setmachine] = useState("");
//   const [sensorname, setsensorname] = useState("");
//   const [units, setUnitsdata] = useState("");
//   const [alertMess, setAlertMmess] = useState("");
//   const [rows, setrows] = useState([]);
//   const [minValue,setMinValue]=useState('')
//   const [maxValue,setMaxValue] =useState('')


//   const [refreshData, setRefreshData] = useState(false);

//   const handleSelectChange = (event) => {
//     setmachine(event.target.value);
//   };

//   const handleSelectChangesensor = (event) => {
//     setsensorname(event.target.value);
//   };

//   const handleRadioChange = (event) => {
//     setSelectedRadioValue(event.target.value);
//   };

//   useEffect(() => {
//     console.log("selectedTabRadioValue", selectedTabRadioValue);
//     SetalertMachineView(handelSucess, handelException);
//     Setalertsensorname(handelsensorname, handelexception);
//   }, [refreshData]);

//   const handelsensorname = (dataObject) => {
//     console.log("data===", dataObject.data);
//     setsensorNamelist(dataObject.data);
//   };

//   const handelexception = () => {};

//   const handelSucess = (dataObject) => {
//     setmachineNamelist(dataObject.data);
//   };

//   const handelException = (dataObject) => {};

//   const handelsubmit = () => {
//     Setalert(
//       {
//         AlertType: selectedTabRadioValue,
//         SelectMachine: machine,
//         SensorCModule: sensorname,
//         Units: units,
//         FilterType: selectedRadioValue,
//         AlertMessage: alertMess,
//         min:minValue,
//         max:maxValue,
//         ConsumName: "",
//         ConsumType: "",
//         DateFrom: "",
//         Dateto: "",
//         RunHours: "",
//       },
//       handelsubmitdata,
//       hamdelexceptionData
//     );
//   };
//   const handelsubmitdata = (dataObject) => {
//     setrows(dataObject.data);
//   };

//   const hamdelexceptionData = () => {};

//   return (
//     <Box
//       sx={{
//         width: "100%",
//       }}
//       className="toolAddCardContainer"
//     >
//       <Typography
//         variant="h7"
//         component="div"
//         sx={{
//           flexGrow: 1,
//           backgroundColor: "#f7f7fc",
//           padding: 2.5,
//           color: "#000000",
//           borderRadius: "5px 5px 0 0",
//         }}
//       >
//         Add Threshhold
//       </Typography>
//       <Card
//         sx={{ borderRadius: "0 0 5px 5px", padding: "25px", boxShadow: "none" }}
//       >
//         <CardContent sx={{ display: "flex", justifyContent: "center" }}>
//           <Grid
//             container
//             spacing={2}
//             width={{ lg: "50%", md: "100%" }}
//             alignItems={"center"}
//           >
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Typography>Select Machine</Typography>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Box
//                 width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
//               >
//                 <FormControl fullWidth>
//                   <InputLabel id="demo-simple-select-label">
//                     --Select Machine--
//                   </InputLabel>
//                   <Select
//                     labelId="demo-simple-select-label"
//                     id="demo-simple-select"
//                     value={machine}
//                     label="Age"
//                     onChange={handleSelectChange}
//                   >
//                     {machineNamelist.map((data) => (
//                       <MenuItem key={data.id} value={data.id}>
//                         {data.machine_name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Typography>Sensor Class Module</Typography>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Box
//                 width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
//               >
//                 <FormControl fullWidth>
//                   <InputLabel id="demo-simple-select-label">
//                     --Sensor Class Module--
//                   </InputLabel>
//                   <Select
//                     labelId="demo-simple-select-label"
//                     id="demo-simple-select"
//                     value={sensorname}
//                     label="Age"
//                     onChange={handleSelectChangesensor}
//                   >
//                     {sensorNamelist.map((data) => (
//                       <MenuItem key={data.id} value={data.id}>
//                         {data.Sensor}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Typography>Units</Typography>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <TextField
//                 id="per-day-input"
//                 label="Units"
//                 variant="outlined"
//                 value={units}
//                 onChange={(e) => {
//                   setUnitsdata(e.target.value);
//                 }}
//               />
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Typography>Filter Type</Typography>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <FormControl
//                 component="fieldset"
//                 sx={{
//                   display: "flex",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   marginBottom: "0px",
//                 }}
//               >
//                 <RadioGroup
//                   aria-label="options"
//                   name="options"
//                   value={selectedRadioValue}
//                   onChange={handleRadioChange}
//                   sx={{
//                     display: "flex",
//                     flexDirection: "row",
//                     justifyContent: "space-evenly",
//                     width: "100%",
//                   }}
//                 >
//                   <FormControlLabel
//                     value="lowPass"
//                     control={<Radio />}
//                     label="Low Pass"
//                   />
//                   <FormControlLabel
//                     value="highPass"
//                     control={<Radio />}
//                     label="High Pass"
//                   />
//                   <FormControlLabel
//                     value="bandPass"
//                     control={<Radio />}
//                     label="Band Pass"
//                   />
//                   <FormControlLabel
//                     value="outlier"
//                     control={<Radio />}
//                     label="Outlier"
//                   />
//                 </RadioGroup>
//               </FormControl>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               {selectedRadioValue === "lowPass" && (
//                 <TextField
//                   label="Min"
//                   value={minValue}
//                   onChange={(e) => setMinValue(e.target.value)}
//                 />
//               )}
//               {selectedRadioValue === "highPass" && (
//                 <TextField
//                   label="Max"
//                   value={maxValue}
//                   onChange={(e) => setMaxValue(e.target.value)}
//                 />
//               )}
//               {(selectedRadioValue === "bandPass" ||
//                 selectedRadioValue === "outlier") && (
//                 <>
//                   <TextField
//                     label="Min"
//                     value={minValue}
//                     onChange={(e) => setMinValue(e.target.value)}
//                   />
//                   <TextField
//                     label="Max"
//                     value={maxValue}
//                     onChange={(e) => setMaxValue(e.target.value)}
//                   />
//                 </>
//               )}
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <Typography>Alert Message</Typography>
//             </Grid>
//             <Grid item lg={6} md={6} container justifyContent="center">
//               <TextField
//                 id="per-day-input"
//                 label="Alert Message"
//                 variant="outlined"
//                 value={alertMess}
//                 onChange={(e) => {
//                   setAlertMmess(e.target.value);
//                 }}
//               />
//             </Grid>
//             <Grid item lg={12} md={12} container justifyContent="center">
//               <Button variant="contained" onClick={handelsubmit}>
//                 Add
//               </Button>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };
// export default SetAlertAddSensor;
