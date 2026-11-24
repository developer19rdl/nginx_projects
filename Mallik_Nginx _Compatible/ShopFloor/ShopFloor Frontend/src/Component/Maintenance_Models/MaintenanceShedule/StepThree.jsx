import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {
  AppBar,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Toolbar,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const StepThree = ({ setStepThreeValues, stepThreeValues,rows,setRows }) => {

  const [age, setAge] = useState("");
  const [selectedRadioValue, setSelectedRadioValue] = useState("");

  const columns = [
    { field: "id", headerName: "ID", width: 100, flex: 1 },
    { field: "Name", headerName: "Name", width: 150, flex: 1 },
    { field: "PartId", headerName: "Part ID", width: 150, flex: 1 },
    { field: "Quantity", headerName: "Quantity", width: 150, flex: 1 },
    { field: "UOM", headerName: "Units", width: 150, flex: 1 },
    { field: "Unitprice", headerName: "Amount", width: 150, flex: 1 },
    {
      field: "Action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => handleDeleteRow(params.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleDeleteRow = (id) => {
    const updatedRows = rows.filter((row) => row.id !== id);
    localStorage.setItem("rows", JSON.stringify(updatedRows));
    setRows(updatedRows);
  };

  const handleSelectChange = (event) => {
    setStepThreeValues((prevState) => ({
      ...prevState,
      UOM: event.target.value,
    }));
  };

  const handleRadioChange = (event) => {
    setStepThreeValues((prevState) => ({
      ...prevState,
      Type: event.target.value,
    }));
  };

  const handleAddToLocalStorage = () => {
    // Update the rows state with the new data
    const newRow = {
      id: rows.length + 1, 
      Type:stepThreeValues.Type,   // Generate a unique id for the new row
      Name: stepThreeValues.Name,
      PartId: stepThreeValues.Partid,
      Quantity: stepThreeValues.Quantity,
      UOM: stepThreeValues.UOM,
      Unitprice: stepThreeValues.Unitprice
    };

    // Update the rows state with the new row
    const newRows = [...rows, newRow];

    // Store the updated rows in local storage
    localStorage.setItem("rows", JSON.stringify(newRows));

    setRows(newRows);

    // Optionally, you can update the state if needed
    // setRows(newRows);

    // Clear the form fields or reset the stepThreeValues state if needed
    setStepThreeValues({
      Type: "",
      Name: "",
      Partid: "",
      Quantity: "",
      UOM: "",
      Unitprice: "",
    });
  };

  useEffect(() => {
    // Load data from local storage when the component mounts
    const storedRows = localStorage.getItem("rows");
    if (storedRows) {
      setRows(JSON.parse(storedRows));
    }
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }} margin={2}>
      <Grid container spacing={2}>
        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Grid conatiner spacing={2}>
            <Grid item lg={12} md={12} sm={12} xs={12}>
            <Item>
            <Grid
              container
              justifyContent={"center"}
              width={{ lg: "100%", md: "100%" }}
              
            >
              <Grid item lg={12} md={12}  container >
                <FormControl
                  component="fieldset"
                  sx={{
                 
                    marginBottom: "0px",
                  }}
                >
                  <RadioGroup
                    aria-label="options"
                    name="options"
                    value={stepThreeValues.Type}
                    onChange={handleRadioChange}
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                    }}
                  >
                    <FormControlLabel
                      value="Parts"
                      control={<Radio />}
                      label="Parts"
                    />
                    <FormControlLabel
                      value="Consumable"
                      control={<Radio />}
                      label="Consumable"
                    />
                    <FormControlLabel
                      value="NA"
                      control={<Radio />}
                      label="NA"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
     
              <Grid
                item
                lg={12}
                md={6}
                marginBottom={1}
                container
             
                onChange={(e) => {
                  setStepThreeValues((prevState) => ({
                    ...prevState,
                    Name: e.target.value,
                  }));
                }}
              >
                <TextField id="per-day-input" label="Name" variant="outlined"  fullWidth/>
              </Grid>
  
              <Grid
                item
                lg={12}
                md={6}
                marginBottom={1}
                container
              
                onChange={(e) => {
                  setStepThreeValues((prevState) => ({
                    ...prevState,
                    Partid: e.target.value,
                  }));
                }}
              >
                <TextField
                  id="per-day-input"
                  label="Partid"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
           
              <Grid
                item
                lg={12}
                md={6}
                marginBottom={1}
                container
           
                onChange={(e) => {
                  setStepThreeValues((prevState) => ({
                    ...prevState,
                    Quantity: e.target.value,
                  }));
                }}
              >
                <TextField
                  id="per-day-input"
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              <Grid
                item
                lg={12}
                md={6}
                marginBottom={1}
                container
                
              >
           
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                      --Select Units--
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={stepThreeValues.UOM}
                      label="Select Units"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value={"Liter"}>Liter</MenuItem>
                      <MenuItem value={"Kg"}>Kg</MenuItem>
                      <MenuItem value={"Nos"}>Nos</MenuItem>
                    </Select>
                  </FormControl>
               
              </Grid>

              <Grid
                item
                lg={12}
                md={6}
                marginBottom={1}
                container
              
                onChange={(e) => {
                  setStepThreeValues((prevState) => ({
                    ...prevState,
                    Unitprice: e.target.value,
                  }));
                }}
              >
                <TextField
                  id="per-day-input"
                  label="Unit price"
                  variant="outlined"
                  fullWidth
                />
              </Grid>

              
              <Grid
                item
                lg={12}
                md={12}
                marginBottom={1}
                container
                justifyContent="center"
              >
                <Button variant="contained" onClick={handleAddToLocalStorage}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Item>
            </Grid>
          </Grid>
          
         
        </Grid>





        <Grid item lg={6} md={6} sm={12} xs={12}>
          <Item>
            <Grid container>
              <Grid item lg={12}>
                <Box style={{ width: "100%", height: "400px" }}>
                  <DataGrid
                    rows={rows} // Pass the rows state to the rows prop
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5, 10, 20]}
                  />
                </Box>
              </Grid>
            </Grid>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};
export default StepThree;
