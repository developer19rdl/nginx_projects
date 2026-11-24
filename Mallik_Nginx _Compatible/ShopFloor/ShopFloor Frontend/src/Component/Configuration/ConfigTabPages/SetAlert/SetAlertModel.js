import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Radio,
  FormControlLabel,
  RadioGroup,
  FormControl,
  Box,
  Card,
  CardContent,
  Typography,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useEffect } from "react";
import {
  AddToolsMachineView,
  SelectMachineAlert,
  SelectSensorClassAlert,
  SetalertAdd,
  SetalertUpdate,
  selectConsumableName,
} from "../../../../Services/NodeJsApiServices";

const SetAlertModel = ({
  open,
  setOpen,
  isAddButton,
  editConfigSetup,
  setNotification,
  setRefreshData,
}) => {
  const [machine, setMachine] = useState("");
  const [machineList, setMachineList] = useState([]);
  const [sensorClassModule, setSensorClassModule] = useState("");
  const [sensorClassModuleList, setSensorClassModuleList] = useState([]);
  const [unit, setUnit] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [consumableName, setConsumableName] = useState("");
  const [consumableNameList, setConsumableNameList] = useState([]);
  const [consumableType, setConsumableType] = useState("");
  const [consumableTypeList, setConsumableTypeList] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [runHours, setRunHours] = useState("");
  const [selectedRadioValue, setSelectedRadioValue] = useState("");
  const [selectedValue, setSelectedValue] = useState("Consumable"); // Initialize with default value

  const [minValue, setMinValue] = useState('')
  const [maxValue, setMaxValue] = useState('')

  useEffect(() => {
    AddToolsMachineView(
      handleMachineSelectshow,
      handleMachineSelectshowException
    );
    SelectSensorClassAlert(
      handleSensorClassSelectshow,
      handleSensorClassSelectshowException
    );
    selectConsumableName(
      handleConsumableNameSelectshow,
      handleConsumableNameshowException
    );
    setMachine(editConfigSetup?.SelectMachine || "");
    setSensorClassModule(editConfigSetup?.SensorCModule || "");
    setConsumableName(editConfigSetup?.ConsumName || "");
    setConsumableType(editConfigSetup?.ConsumType || "");
    setUnit(editConfigSetup?.Units || "");
    setSelectedRadioValue(editConfigSetup?.FilterType || "");
    setMinValue(editConfigSetup?.min || "");
    setMaxValue(editConfigSetup?.max || "");
    setAlertMessage(editConfigSetup?.AlertMessage || "");
    setSelectedValue(editConfigSetup?.AlertType || "Consumable");
    setFromDate(editConfigSetup?.DateFrom || "");
    setToDate(editConfigSetup?.Dateto || "");
    setRunHours(editConfigSetup?.RunHours || "");
  }, [editConfigSetup]);

  const handleMachineSelectshow = (dataObject) => {
    setMachineList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleMachineSelectshowException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const handleSensorClassSelectshow = (dataObject) => {
    setSensorClassModuleList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleSensorClassSelectshowException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const handleConsumableNameSelectshow = (dataObject) => {
    setConsumableNameList(dataObject?.data);
    setConsumableTypeList(dataObject?.data);
    console.log(dataObject?.data);
  };

  const handleConsumableNameshowException = (error, errorMessage) => {
    console.log(errorMessage);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRadioChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const onMachineChange = (e) => {
    setMachine(e.target.value);
  };

  const onSensorClassModuleChange = (e) => {
    setSensorClassModule(e.target.value);
  };

  const handleRadioOptionChange = (event) => {
    setSelectedRadioValue(event.target.value);
  };

  const onConsumableNameChange = (e) => {
    setConsumableName(e.target.value);
  };

  const onConsumableTypeChange = (e) => {
    setConsumableType(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    isAddButton === true
      ? SetalertAdd(
        {
          AlertType: selectedValue,
          SelectMachine: machine,
          SensorCModule: sensorClassModule,
          Units: unit,
          AlertMessage: alertMessage,
          ConsumName: consumableName,
          ConsumType: consumableType,
          DateFrom: fromDate,
          Dateto: toDate,
          RunHours: runHours,
          FilterType: selectedRadioValue,
          min: minValue,
          max: maxValue
        },
        handleSuccess,
        handleException
      )
      : SetalertUpdate(
        {
          id: editConfigSetup.id,
          AlertType: selectedValue,
          SelectMachine: machine,
          SensorCModule: sensorClassModule,
          Units: unit,
          AlertMessage: alertMessage,
          ConsumName: consumableName,
          ConsumType: consumableType,
          DateFrom: fromDate,
          Dateto: toDate,
          RunHours: runHours,
          FilterType: selectedRadioValue,
          min: minValue,
          max: maxValue
        },
        handleSuccess,
        handleException
      );
  };

  const handleSuccess = (dataObject) => {
    console.log(dataObject);
    setNotification({
      status: true,
      type: "success",
      message: dataObject.message,
    });
    setTimeout(() => {
      setOpen(false);
    }, 2000);
    setRefreshData((oldValue) => !oldValue);
    // ClearData();
  };

  const handleException = (errorObject, errorMessage) => {
    console.log(errorMessage);
    setNotification({
      status: true,
      type: "error",
      message: errorMessage,
    });
    // ClearData();
  };

  return (
    <div>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "62%", maxHeight: "100%" } }}
        maxWidth="lg"
        open={open}
      >
        <form onSubmit={onSubmit}>
          <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}>{isAddButton ? "Add " : "Update "}Set Alert</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {/* <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <FormControl component="fieldset">
                    <RadioGroup
                      row
                      value={selectedValue}
                      onChange={handleRadioChange}
                    >
                      <FormControlLabel
                        value="Sensor"
                        control={<Radio />}
                        label="Sensor"
                      />
                      <FormControlLabel
                        value="Consumable"
                        control={<Radio />}
                        label="Consumable"
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid> */}
              {/* {selectedValue === "Sensor" && (
                <Grid item xs={12}>
                  <Box mb={2}>
                    <Typography variant="h5" component="div">
                      Add Threshold
                    </Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">
                          Machine
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          label="Machine"
                          placeholder="Machine"
                          value={machine}
                          required
                          onChange={(e) => onMachineChange(e)}
                        >
                          {machineList?.map((data, index) => (
                            <MenuItem value={data.id} key={index}>
                              {data.machine_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth>
                        <InputLabel id="sensor-class-module-select-label">
                          Sensor Class Module
                        </InputLabel>
                        <Select
                          labelId="sensor-class-module-select-label"
                          id="sensor-class-module-select"
                          label="Sensor Class Module"
                          value={sensorClassModule}
                          required
                          onChange={(e) => onSensorClassModuleChange(e)}
                        >
                          {sensorClassModuleList?.map((data, index) => (
                            <MenuItem value={data.id} key={index}>
                              {data.Sensor}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        id="unit-input"
                        label="Unit"
                        variant="outlined"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      />
                    </Grid>

                    <Grid container spacing={3} padding={2}>
                      <Grid item xs={12} sm={12}>
                        <FormControl component="fieldset">
                          <Typography variant="subtitle1">
                            Filter Type:
                          </Typography>
                          <RadioGroup
                            row={true}
                            value={selectedRadioValue}
                            onChange={handleRadioOptionChange}
                          >
                            <FormControlLabel
                              value="LowPass"
                              control={<Radio />}
                              label="Low Pass"
                            />
                            <FormControlLabel
                              value="HighPass"
                              control={<Radio />}
                              label="High Pass"
                            />
                            <FormControlLabel
                              value="BandPass"
                              control={<Radio />}
                              label="Band Pass"
                            />
                            <FormControlLabel
                              value="Outlier"
                              control={<Radio />}
                              label="Outlier"
                            />
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {["LowPass", "HighPass", "BandPass", "Outlier"].includes(
                      selectedRadioValue
                    ) && (
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="min-value"
                            label="Min Value"
                            variant="outlined"
                            value={minValue}
                            onChange={(e) => setMinValue(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            id="max-value"
                            label="Max Value"
                            variant="outlined"
                            value={maxValue}
                            onChange={(e) => setMaxValue(e.target.value)}
                          />
                        </Grid>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={12}>
                      <TextField
                        fullWidth
                        id="alert-message"
                        label="Alert Message"
                        multiline
                        variant="outlined"
                        value={alertMessage}
                        onChange={(e) => setAlertMessage(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )} */}

              {/* {selectedValue === "Consumable" && ( */}
              <Grid item xs={12}>
                {/* <Card>
                                    <CardContent> */}
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="machine-select-label">
                        Machine
                      </InputLabel>
                      <Select
                        labelId="machine-select-label"
                        id="machine-select"
                        label="Machine"
                        value={machine}
                        required
                        onChange={(e) => onMachineChange(e)}
                      >
                        {machineList?.map((data, index) => {
                          return (
                            <MenuItem value={data.id} key={index}>
                              {data.machine_name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="sensor-class-module-select-label">
                        Consumable Name
                      </InputLabel>
                      <Select
                        labelId="sensor-class-module-select-label"
                        id="sensor-class-module-select"
                        label="Consumable Name"
                        value={consumableName}
                        required
                        onChange={(e) => onConsumableNameChange(e)}
                      >
                        {consumableNameList?.map((data, index) => {
                          return (
                            <MenuItem value={data.id} key={index}>
                              {data.ConsumableName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="sensor-class-module-select-label">
                        Consumable Type
                      </InputLabel>
                      <Select
                        labelId="sensor-class-module-select-label"
                        id="sensor-class-module-select"
                        label="Consumable Type"
                        value={consumableType}
                        required
                        onChange={(e) => onConsumableTypeChange(e)}
                      >
                        {consumableTypeList?.map((data, index) => {
                          return (
                            <MenuItem value={data.id} key={index}>
                              {data.ConsumableType}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="From Date "
                      placeholder="From Date"
                      variant="outlined"
                      required
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="To Date "
                      placeholder="To Date"
                      variant="outlined"
                      required
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Run Hours "
                      placeholder="Run Hours"
                      variant="outlined"
                      required
                      value={runHours}
                      onChange={(e) => setRunHours(e.target.value)}
                    />
                  </Grid>
                </Grid>
                {/* </CardContent>
                                </Card> */}
              </Grid>
              {/* )} */}
            </Grid>
          </DialogContent>
          <DialogActions style={{ justifyContent: "flex-end" }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">{isAddButton ? "Add" : "Update"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default SetAlertModel;
