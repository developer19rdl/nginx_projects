import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MaintenanceShudeleName, MaintenanceshowUser } from "../../../services/LoginServiceNod";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: "center",
  color: theme.palette.text.secondary,
  boxShadow: "none",
  borderRadius: theme.shape.borderRadius,
}));

const StepFour = ({
  affMachine,
  affManHr,
  type1,
  type2,
  fromdate,
  todate,
  fromtime,
  totime,
  setaffMachine,
  setaffManHr,
  settype1,
  settype2,
  setfromdate,
  settodate,
  setfromtime,
  settotime,
  handleSubmit,
  setManhr,
  setMachineUti,
  users,
setUser
}) => {
  const [age, setAge] = useState("");
  const [selectedRadioValue, setSelectedRadioValue] = useState("");
  const [selectDateFrom, setSelectDateFrom] = useState(null);
  const [selectDateTo, setSelectDateTo] = useState(null);
  const [machineOptions, setMachineOptions] = useState([]);
  const [userlist, setUserlist] = useState([]);


  const handleSelectChange = (event) => {
    const {
      target: { value },
    } = event;
    setaffMachine(typeof value === "string" ? value.split(",") : value);
  };


  const handleSelectChangeUser = (event) => {
    const {
      target: { value },
    } = event;
    setUser(typeof value === "string" ? value.split(",") : value);
  };


  const handleRadioChange = (event) => {
    settype1(event.target.value);
  };

  const handleRadioChange2 = (event) => {
    settype2(event.target.value);
  };

  const handleDateChangeFrom = (e) => {
    setfromdate(e.target.value);
  };

  const handleDateChangeTo = (e) => {
    settodate(e.target.value);
  };

  const handletimeChangeFrom = (e) => {
    setfromtime(e.target.value);
  };

  const handletimeChangeTo = (e) => {
    settotime(e.target.value);
  };

  useEffect(() => {
    MaintenanceShudeleName(Handelsuccess, handelexception);
    MaintenanceshowUser(HandelsuccessshowUser, handelexceptionshowUser);
  }, []);

  const Handelsuccess = (dataObject) => {
    setMachineOptions(dataObject.data);
  };
  
  const handelexception = () => {};

  const HandelsuccessshowUser = (dataObject) => {
    setUserlist(dataObject.data);
  };
  
  const handelexceptionshowUser = () => {};


  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 200,
      },
    },
  };

  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" gutterBottom>
        Schedule
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Item>
          
            <FormControl sx={{ mt: 2, width: "100%" }}>
              <InputLabel id="affected-machine-label">Affected Machine</InputLabel>
              <Select
                labelId="affected-machine-label"
                id="affected-machine"
                multiple
                value={affMachine}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Affected Machine" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {machineOptions.map((option) => (
                  <MenuItem key={option.id} value={option.MachineName}>
                    <Checkbox checked={affMachine.indexOf(option.MachineName) > -1} />
                    <ListItemText primary={option.MachineName} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                aria-label="type1"
                name="type1"
                value={type1}
                onChange={handleRadioChange}
                row
              >
                <FormControlLabel value="ShutDown" control={<Radio />} label="ShutDown" />
                <FormControlLabel value="Runtime" control={<Radio />} label="Runtime" />
              </RadioGroup>
              {type1 === "Runtime" && (
                <TextField
                  id="machine-utilization-input"
                  label="Machine Runtime Details"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  onChange={(e) => setMachineUti(e.target.value)}
                />
              )}
            </FormControl>
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <FormControl sx={{ mt: 2, width: "100%" }}>
              <Select
                labelId="Select-Man-Power"
                id="Select-Man-Power"
                multiple
                value={users}
                onChange={handleSelectChangeUser}
                input={<OutlinedInput label="Select Man Power" />}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {userlist.map((option) => (
                  <MenuItem key={option.id} value={option.name}>
                    <Checkbox checked={users.indexOf(option.name) > -1} />
                    <ListItemText primary={option.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <RadioGroup
                aria-label="type2"
                name="type2"
                value={type2}
                onChange={handleRadioChange2}
                row
              >
                <FormControlLabel value="Off" control={<Radio />} label="Off" />
                <FormControlLabel value="Man Hours Utilization" control={<Radio />} label="Man Hours Utilization" />
              </RadioGroup>
              {type2 === "Man Hours Utilization" && (
                <TextField
                  id="man-hours-details"
                  label="Man Hours Details"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  onChange={(e) => setManhr(e.target.value)}
                />
              )}
            </FormControl>
          </Item>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Item>
            <TextField
              type="date"
              label="From Date "
              variant="outlined"
              fullWidth
              placeholder="From Date"
              sx={{ mt: 2 }}
              value={fromdate}
              onChange={handleDateChangeFrom}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              type="time"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={fromtime}
              onChange={handletimeChangeFrom}
              label="Time From"

              placeholder="Time From"

      InputLabelProps={{
                shrink: true,
              }}
            />
          </Item>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Item>
            <TextField
              type="date"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={todate}
              onChange={handleDateChangeTo}
              label="To Date "

              placeholder="To Date"

      InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              type="time"
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              value={totime}
              onChange={handletimeChangeTo}
              label="Time To "

              placeholder="Time To"

      InputLabelProps={{
                shrink: true,
              }}
            />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StepFour;
