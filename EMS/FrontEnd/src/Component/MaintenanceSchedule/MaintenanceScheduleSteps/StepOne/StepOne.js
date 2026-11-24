import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
// import {
//   MaintenanceShudeleName,
//   viewwarrentyStatus,
// } from "../../../services/LoginServiceNod";
import { DataGrid } from "@mui/x-data-grid";
import { MaintenanceShudeleName, viewwarrentyStatus } from "../../../../Services/NodeJsApiServices";

const columns = [
  {
    field: "AMCStatus", // Field name from the JSON response
    headerClassName: "super-app-theme--header",
    headerName: "AMC Status",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
  {
    field: "WarrantyStatus", // Field name from the JSON response
    headerName: "Warranty Status",
    headerClassName: "super-app-theme--header",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
  {
    field: "WarrantyType", // Field name from the JSON response
    headerName: "Warranty Type",
    headerClassName: "super-app-theme--header",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
];

const StepOne = ({ Machine, setMachine, setSelectedMachineName }) => {
  const [machineOptions, setMachineOptions] = useState([]);
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    MaintenanceShudeleName(Handelsuccess, handelexception);
  }, []);

  const Handelsuccess = (dataObject) => {
    setMachineOptions(dataObject.data);
  };
  const handelexception = () => { };

  const handleSelectChange = (event) => {
    setMachine(event.target.value);
    const selectedId = event.target.value;
    const selectedOption = machineOptions.find(
      (option) => option.id === selectedId
    );
    if (selectedOption) {
      setSelectedMachineName(selectedOption.machine_name)
      viewwarrentyStatus(
        { id: event.target.value, MachineName: selectedOption.MachineName },
        handelview,
        handelexceptionview
      );
    }
  };

  const handelview = (dataObject) => {
    const rowData = [dataObject.data];
    setRows(rowData);
  };
  console.log("rows", rows);
  const handelexceptionview = () => { };

  return (
    <Card sx={{ paddingBottom: "15px", marginTop: "15px" }}>
      <CardContent>
        <Typography variant="h5" component="div">
          Status
        </Typography>
        <Box
          width={{ lg: "222px", md: "222px", xs: "178px", sm: "222px" }}
          sx={{ marginBottom: "15px" }}
        >
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Machine Name</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Machine Name"
              placeholder="Machine Name"
              value={Machine}
              required
              onChange={(e) => handleSelectChange(e)}
            >
              {machineOptions?.map((data, index) => {
                return (
                  <MenuItem value={data.id} key={index}>
                    {data.machine_name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>
        <div className="view_container">
          <div className="view_subcontainer">
            <span className="view_headerText">View Warranty Dues</span>
          </div>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={8}
            // loading={isLoading}
            rowsPerPageOptions={[8]}
            disableSelectionOnClick
            sx={{
              height: "480px",
              width: "100%",
              "& .super-app-theme--header": {
                WebkitTextStrokeWidth: "0.6px",
              },
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
export default StepOne;
