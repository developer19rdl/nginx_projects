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
  FormHelperText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GetAffectedMachine, MaintenanceShudeleName, MaintenanceshowUser, ShowChecklistDropDown, showOperators, showSuperviser, showSupervisor } from "../../../../Services/NodeJsApiServices";
// import { MaintenanceShudeleName, MaintenanceshowUser } from "../../../services/LoginServiceNod";

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
  setUser,
  supervisor,
  setSupervisor,
  error,
  setError,
  isPreventiveFromChild,
  machine,
  checkList,
  selectedCheckList,
  setSelectedCheckList
}) => {
  const [machineOptions, setMachineOptions] = useState([]);
  const [userlist, setUserlist] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);


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

  const handleSelectSupervisor = (event) => {
    setError(false); 
    setSupervisor(event.target.value); // Make sure this matches the state name
  };

  const handleSelectCheckList = (event) => {
    setError(false); 
    setSelectedCheckList(event.target.value); // Make sure this matches the state name
  }


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
    // MaintenanceShudeleName(Handelsuccess, handelexception);
    GetAffectedMachine(Handelsuccess, handelexception);
    showOperators(HandelsuccessshowUser, handelexceptionshowUser);
    showSupervisor(supervisorHandleSuccess, supervisorHandleException);

   
 
    
  }, []);


  const Handelsuccess = (dataObject) => {
    setMachineOptions(dataObject.data);
  };

  const handelexception = () => { };

  const HandelsuccessshowUser = (dataObject) => {
    setUserlist(dataObject.data);
  };

  const handelexceptionshowUser = () => { };

  const supervisorHandleSuccess = (dataObject) => {
    setSupervisorList(dataObject.data);
  };

  const supervisorHandleException = () => { };



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
      <Typography variant="h6" gutterBottom sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
        Schedule
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          {/* <Item> */}

            <FormControl sx={{ mt: 1, width: "100%" }}>
              <InputLabel id="affected-machine-label">Affected Machine</InputLabel>
              <Select
                labelId="affected-machine-label"
                id="affected-machine"
                multiple
                value={affMachine}
                onChange={handleSelectChange}
                input={<OutlinedInput label="Affected Machine" />}
                renderValue={(selected) => selected.join(',')}
                MenuProps={MenuProps}
              >
                {machineOptions.map((option) => (
                  <MenuItem key={option.id} value={option.machine_name}>
                    <Checkbox checked={affMachine.indexOf(option.machine_name) > -1} />
                    <ListItemText primary={option.machine_name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <RadioGroup
                aria-label="type1"
                name="type1"
                value={type1}
                onChange={handleRadioChange}
                row
              >
                <FormControlLabel value="ShutDown" control={<Radio

                  sx={{
                    color: '#686D76', // unselected color
                    '&.Mui-checked': {
                      color: '#000000', // selected color
                    }
                  }} />} label="ShutDown" />
                <FormControlLabel value="Runtime" control={<Radio
                  sx={{
                    color: '#686D76', // unselected color
                    '&.Mui-checked': {
                      color: '#000000', // selected color
                    }
                  }}
                />} label="Runtime" />
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
          {/* </Item> */}
        </Grid>

        <Grid item xs={12} sm={6}>
          {/* <Item> */}
            <FormControl sx={{ mt: 1, width: "100%" }}>
              <InputLabel id="affected-machine-label">Select-Man-Power</InputLabel>
              <Select
                labelId="Select-Man-Power"
                id="Select-Man-Power"
                multiple
                value={users}
                onChange={handleSelectChangeUser}
                renderValue={(selected) => selected.join(', ')}
                MenuProps={MenuProps}
              >
                {userlist.map((option) => (
                  <MenuItem key={option.id} value={option.operatorName}>
                    <Checkbox checked={users.indexOf(option.operatorName) > -1} />
                    <ListItemText primary={option.operatorName} />
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
                <FormControlLabel value="Off" control={<Radio
                  sx={{
                    color: '#686D76', // unselected color
                    '&.Mui-checked': {
                      color: '#000000', // selected color
                    }
                  }}
                />} label="Off" />
                <FormControlLabel value="Man Hours Utilization" control={<Radio
                  sx={{
                    color: '#686D76', // unselected color
                    '&.Mui-checked': {
                      color: '#000000', // selected color
                    }
                  }}
                />} label="Man Hours Utilization" />
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
          {/* </Item> */}
        </Grid>

        <Grid item xs={12} sm={6}>
          {/* <Item> */}
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
          {/* </Item> */}
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* <Item> */}
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
          {/* </Item> */}
        </Grid>

        <Grid item xs={12} sm={6}>
          {/* <Item> */}
            <FormControl sx={{ mt: 1, width: "100%" }}>
              <InputLabel id="assign-supervisor-label">Assign Supervisor</InputLabel>
              <Select
                labelId="assign-supervisor-label"
                id="assign-supervisor-select"
                value={supervisor}
                onChange={handleSelectSupervisor}
                label="Assign Supervisor"
                required
              >
                {supervisorList.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.userName} {/* Display supervisor name */}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>Please select a supervisor.</FormHelperText>}
            </FormControl>
          {/* </Item> */}
        </Grid>
        { isPreventiveFromChild && (
         <Grid item xs={12} sm={6}>
          {/* <Item> */}
            <FormControl sx={{ mt: 1, width: "100%" }}>
              <InputLabel id="assign-supervisor-label">Checklist</InputLabel>
              <Select
                labelId="assign-supervisor-label"
                id="assign-supervisor-select"
                value={selectedCheckList}
                onChange={handleSelectCheckList}
                label="Select Checklist"
                required
              >
                {checkList.map((option) => (
                  <MenuItem key={option.checkListId} value={option.checkListId}>
                    {option.checkname} {/* Display supervisor name */}
                  </MenuItem>
                ))}
              </Select>
              {error && <FormHelperText>Please select a supervisor.</FormHelperText>}
            </FormControl>
          {/* </Item> */}
        </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default StepFour;
