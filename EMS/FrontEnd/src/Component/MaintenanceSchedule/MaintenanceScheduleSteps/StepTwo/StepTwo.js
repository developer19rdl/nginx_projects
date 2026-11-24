import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
} from "@mui/material";
import { Natureshowbyid, ProblemShowdata } from "../../../../Services/NodeJsApiServices";
// import {
//   NatureShowdata,
//   Natureshowbyid,
//   ProblemShowdata,
// } from "../../../services/LoginServiceNod";

const StepTwo = ({
  MainId,
  setMaintId,
  setAge,
  age,
  selectedRadioValue,
  problem,
  setSelectedRadioValue,
  setproblem,
  file1,
  setfile1,
  setfile2,
  setfile3,
  setfile4,
  probcate,
  setProblemcate,
  naturecate,
  setnaturecate,
  selectedMachineName
}) => {
  const handleSelectChange = (event) => {
    setAge(event.target.value);
  };

  const [problemlist, setproblemList] = useState([]);
  const [natureList, setnatureList] = useState([]);

  const handleChangeProbCate = (event) => {
    setnaturecate("")
    setProblemcate(event.target.value);
    console.log("setProblemcate", event.target.value);
    Natureshowbyid({id:event.target.value},handelNatureShowdata, exceptionNatureShowdata);
  };

  const handleChangeNatureCate = (event) => {
    setnaturecate(event.target.value);
  };
  const handleRadioChange = (event) => {
    setSelectedRadioValue(event.target.value);
  };

  const handleFileChange = (setter) => (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  useEffect(() => {
    ProblemShowdata(handelProblemShowdata, exceptionProblemShowdata);
   
  }, []);

  const handelNatureShowdata = (dataObject) => {
    setnatureList(dataObject.data);

  };

  const exceptionNatureShowdata = () => {};

  const handelProblemShowdata = (dataObject) => {
    setproblemList(dataObject.data);
   
  };

  const exceptionProblemShowdata = () => {};

  return (
    <Card sx={{ minWidth: 275, paddingBottom: "15px", marginTop: "15px" }}>
      <CardContent>
        <Box sx={{ width: "100%", borderRadius: "5px" }}>
          <Card
            sx={{
              borderRadius: "0 0 5px 5px",
              padding: "25px",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ display: "flex", justifyContent: "center" }}>
              <Grid
                container
                spacing={2}
                width={{ lg: "100%", md: "100%" }}
                alignItems={"center"}
              >
                <Grid item xs={12} sm={4}>
                  <TextField
                    style={{ width: "100%" }}
                    disabled
                    value={selectedMachineName}
                    id="maintenance-id-input"
                    variant="outlined"
                    label="Machine Id"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="maintenance-type-label">
                      --Maintenance Type--
                    </InputLabel>
                    <Select
                      labelId="maintenance-type-label"
                      id="maintenance-type-select"
                      value={age}
                      label="Maintenance Type"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value={"Preventive Maintenance"}>
                        Preventive Maintenance
                      </MenuItem>
                      <MenuItem value={"Conditions Based Maintenance"}>
                        Conditions Based Maintenance
                      </MenuItem>
                      <MenuItem value={"BreakDown"}>BreakDown</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                    <InputLabel id="severity-label">Severity</InputLabel>
                    <Select
                      labelId="severity-label"
                      id="severity-select"
                      value={selectedRadioValue}
                      onChange={handleRadioChange}
                      label="Severity"
                    >
                      <MenuItem value="Major">Major</MenuItem>
                      <MenuItem value="Minor">Minor</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="maintenance-type-label">
                      Problem Category
                    </InputLabel>
                    <Select
                      labelId="maintenance-type-label"
                      id="maintenance-type-select"
                      value={probcate}
                      label="Problem Category"
                      onChange={handleChangeProbCate}
                    >
                      {problemlist?.map((data, index) => {
                        return (
                          <MenuItem value={data.id} key={index}>
                            {data.Category_name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="maintenance-type-label">
                      Nature of Problem
                    </InputLabel>
                    <Select
                      labelId="maintenance-type-label"
                      id="maintenance-type-select"
                      value={naturecate}
                      label="Nature of Problem"
                      onChange={handleChangeNatureCate}
                    >
                      {natureList?.map((data, index) => {
                        return (
                          <MenuItem value={data.id} key={index}>
                            {data.Nature_problem}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    style={{ width: "100%" }}
                    multiline
                    id="problem-note-input"
                    label="Problem Note"
                    variant="outlined"
                    onChange={(e) => setproblem(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={12} sx={{display:'flex',justifyContent:'flex-start'}}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }} >
                    Breakdown Parts Images
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Grid container spacing={3}>
                    <Grid item sm={3}>
                      <TextField
                        style={{ width: "100%", marginBottom: "10px" }}
                        type="file"
                        id="file-input-1"
                        variant="outlined"
                        onChange={handleFileChange(setfile1)}
                      />
                    </Grid>
                    <Grid item sm={3}>
                      <TextField
                        style={{ width: "100%", marginBottom: "10px" }}
                        type="file"
                        id="file-input-2"
                        variant="outlined"
                        onChange={handleFileChange(setfile2)}
                      />
                    </Grid>
                    <Grid item sm={3}>
                      <TextField
                        style={{ width: "100%", marginBottom: "10px" }}
                        type="file"
                        id="file-input-3"
                        variant="outlined"
                        onChange={handleFileChange(setfile3)}
                      />
                    </Grid>
                    <Grid item sm={3}>
                      <TextField
                        style={{ width: "100%" }}
                        type="file"
                        id="file-input-4"
                        variant="outlined"
                        onChange={handleFileChange(setfile4)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StepTwo;
