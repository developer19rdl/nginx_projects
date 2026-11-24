import React, { useState } from "react";
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
import { DataGrid } from "@mui/x-data-grid";

const MasterAssetList = () => {
  const [age, setAge] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSelectChange = (event) => {
    setAge(event.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Get tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Format the date as "YYYY-MM-DD" for the input field
  const tomorrowFormatted = tomorrow.toISOString().split("T")[0];

  return (
    <Box
      sx={{
        width: "100%",
      }}
      // className='toolAddCardContainer'
    >
      <Card
        sx={{ borderRadius: "0 0 5px 5px", padding: "25px", boxShadow: "none" }}
      >
        <CardContent>
          <Grid container spacing={2} marginBottom={8} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <Grid item md={2.4} container justifyContent="flex-start">
              <Box
                width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    --Select Department--
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="--Select Department--"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item md={2.4} container justifyContent="flex-start">
              <Box
                width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    --Select Section--
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="--Select Section--"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item md={2.4} container justifyContent="flex-start">
              <Box
                width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
              >
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">
                    --Select Asset Type--
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={age}
                    label="--Select Asset Type--"
                    onChange={handleSelectChange}
                  >
                    <MenuItem value={10}>Ten</MenuItem>
                    <MenuItem value={20}>Twenty</MenuItem>
                    <MenuItem value={30}>Thirty</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid
              item
              md={2.4}
              container
              justifyContent="flex-start"
              alignItems={"center"}
            >
              <Button variant="contained">View</Button>
            </Grid>
          </Grid>

          {/* INSIDE CARD */}
          <Box
            sx={{
              width: "100%",
            }}
            className="toolAddCardContainer"
          >
            <Typography
              variant="h7"
              component="div"
              sx={{
                flexGrow: 1,
                backgroundColor: "#f7f7fc",
                padding: 2.5,
                color: "#000000",
                borderRadius: "5px 5px 0 0",
              }}
            >
              View Assets
            </Typography>
            <Card
              sx={{
                borderRadius: "0 0 5px 5px",
                padding: "0px",
                boxShadow: "none",
               
              }}
            >
              <CardContent sx={{ padding: "0px", display: "flex", height:"450px" }}>
            
                  <DataGrid
                    columns={[
                      {
                        field: "department",
                        headerName: "Department",
                        width: 120,  
                      },
                      { field: "section", headerName: "Section", width: 120 },
                      {
                        field: "machineName",
                        headerName: "Machine Name",
                        width: 150,
                      },
                      { field: "location", headerName: "Location", width: 120 },
                      {
                        field: "assetType",
                        headerName: "Asset Type",
                        width: 120,
                      },
                      {
                        field: "manufacturer",
                        headerName: "Manufacturer",
                        width: 150,
                      },
                      {
                        field: "assetModel",
                        headerName: "Asset Model",
                        width: 150,
                      },
                      {
                        field: "poDetails",
                        headerName: "PO Details",
                        width: 150,
                      },
                      {
                        field: "invoiceDetails",
                        headerName: "Invoice Details",
                        width: 150,
                      },
                      {
                        field: "warrantyStartDate",
                        headerName: "Warranty Start Date",
                        width: 180,
                      },
                      {
                        field: "warrantyEndDate",
                        headerName: "Warranty End Date",
                        width: 180,
                      },
                    ]}
                    rows={[
                      {
                        id: 1,
                        department: "IT",
                        section: 1,
                        machineName: "Punching",
                        location: "Bangalore",
                        assetType: "Fixed",
                        manufacturer: "MNC",
                        assetModel: "1.21",
                        poDetails: "Accepted",
                        invoiceDetails: "12/4/1236",
                        warrantyStartDate: "12/4/2023",
                        warrantyEndDate: "12/4/2025",
                      },
                      // Add more rows as needed
                    ]}
                    pageSize={5}
                  />
              
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default MasterAssetList;
