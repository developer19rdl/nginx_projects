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
          <DialogTitle>{isAddButton ? "Add " : "Update "}Set Alert</DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              {}
              {}

              {/* {selectedValue === "Consumable" && ( */}
              <Grid item xs={12}>
                {/* <Card>
                                    <CardContent> */}
                <Box mb={2}>
                  <Typography variant="h8" component="div">
                    Set Consumable Threshhold
                  </Typography>
                </Box>
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
