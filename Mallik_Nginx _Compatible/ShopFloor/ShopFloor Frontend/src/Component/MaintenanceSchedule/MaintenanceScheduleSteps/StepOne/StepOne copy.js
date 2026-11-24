
//////////////
import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  DepartmentShowdata,
  FetchAssetTypeSec,
  FetchAsstTypeAsset,
  MaintenanceShudeleName,
  ShowChecklistDropDown,
  viewwarrentyStatus,
} from "../../../../Services/NodeJsApiServices";

const columns = [
  {
    field: "AMCStatus",
    headerClassName: "super-app-theme--header",
    headerName: "AMC Status",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
  {
    field: "WarrantyStatus",
    headerName: "Warranty Status",
    headerClassName: "super-app-theme--header",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
  {
    field: "WarrantyType",
    headerName: "Warranty Type",
    headerClassName: "super-app-theme--header",
    minWidth: 100,
    flex: 1,
    align: "left",
    headerAlign: "center",
  },
];

const StepOne = ({
  Machine,
  setMachine,
  setSelectedMachineName,
  machineId,
  Rowsection,
  RowassetType,
  Department,
  navigate,  // Assume this prop comes from the parent
  setCheckList
}) => {
  console.log("machineId", machineId)
  console.log("row", Rowsection)
  console.log("RowassetType", RowassetType)
  console.log("Department", Department)
  const [machineOptions, setMachineOptions] = useState([]);
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [department, setDepartment] = useState("");
  const [departmentList, setDepartmentList] = useState([]);
  const [section, setSection] = useState("");
  const [sectionList, setSectionList] = useState([]);
  const [assetType, setAssetType] = useState("");
  const [assetTypeList, setAssetTypeList] = useState([]);
    
  

  useEffect(() => {
    DepartmentShowdata(handleDepartmentshow, handleDepartmentshowException);
  }, []);

  useEffect(() => {
    // Automatically set the department, section, and asset type from props
    if (Department) {
      setDepartment(Department);  // Set department value from props
      FetchAssetTypeSec(
        { id: Department },
        handleBranchSuccess,
        handleBranchException
      );
    }
  }, [Department]);

  useEffect(() => {
    // Automatically set section from props when it's available
    if (Rowsection) {
      setSection(Rowsection);  // Set section value from props
      FetchAsstTypeAsset(
        { id: Rowsection },
        handleAsseTypeSuccess,
        handleAsseTypeException
      );
    }
  }, [Rowsection]);

  useEffect(() => {
    // Automatically set asset type from props when it's available
    if (RowassetType) {
      setAssetType(RowassetType);  // Set asset type value from props
      MaintenanceShudeleName(
        { assetTypeId: RowassetType },
        Handelsuccess,
        handelexception
      );
    }
  }, [RowassetType]);


  
  
  useEffect(() => {
    // Automatically set machine name based on machineId prop
    if (machineId) {
      const selectedOption = machineOptions.find(option => option.id === machineId);

      console.log("Selected Option:", selectedOption);

      if (selectedOption) {
        setMachine(machineId);  // Set the selected machine ID

        // Determine the correct name to set (machine_name or assetName)
        const nameToSet = selectedOption.machine_name || selectedOption.assetName || "";
        setSelectedMachineName(nameToSet);  // Set the appropriate name

        // API call to fetch warranty status after setting the name
        viewwarrentyStatus(
          { id: machineId, MachineName: nameToSet },  // Pass the correct name
          handelview,
          handelexceptionview
        );
      }
    }
  }, [machineId, machineOptions]);

  // Re-run when machineId or machineOptions change

  // const Handelsuccess = (dataObject) => {
  //   setMachineOptions(dataObject.data);
  // };

  const Handelsuccess = (dataObject) => {
    const newOptions = dataObject.data.map((item) => {
      if (item.machine_name) {
        return {
          id: item.id,
          name: item.machine_name, // Machine name
          type: 'machine', // Identify this as a machine
          machine_tag: item.machine_tag
        };
      } else {
        return {
          id: item.id,
          name: item.assetName, // Asset name
          type: 'asset', // Identify this as an asset
        };
      }
    });

    setMachineOptions(newOptions);
  };


  const handelexception = () => {
    setMachineOptions([]);
  };
  /*
    const handleSelectChange = (event) => {
      setMachine(event.target.value);
      const selectedId = event.target.value;
      const selectedOption = machineOptions.find(
        (option) => option.id === selectedId
      );
      if (selectedOption) {
        setSelectedMachineName(selectedOption.machine_name);
        viewwarrentyStatus(
          { id: event.target.value, MachineName: selectedOption.MachineName },
          handelview,
          handelexceptionview
        );
      }
    };*/


  const handleMachineTagChange = (machineTag) => {
  // if (!machineTag) return; // avoid empty body
    ShowChecklistDropDown({ machineTag }, checkListHandleSuccess, checkListHandleException);
  };

  const checkListHandleSuccess = (dataObject) => {
    setCheckList(dataObject.data);
  };

  const checkListHandleException = () => { };

  const handleSelectChange = (event) => {
    setMachine(event.target.value);
    const selectedId = event.target.value;

    // Find the selected option based on the selected ID
    const selectedOption = machineOptions.find(
      (option) => option.id === selectedId
    );
    console.log("selectedOptionselectedOption", selectedOption)

    if (selectedOption) {
      // Set the selected machine or asset name based on the type
      if (selectedOption.type === 'machine') {
        setSelectedMachineName(selectedOption.name);
         handleMachineTagChange(selectedOption.machine_tag);
     
        } else {
        setSelectedMachineName(selectedOption.name); // Set the asset name if it's an asset
        
      }

          // ✅ Set machine tag also
   

      // Pass the selected ID and the corresponding name (machine or asset) to the `viewwarrentyStatus` function
      viewwarrentyStatus(
        { id: selectedId, MachineName: selectedOption.name }, // Send the correct name based on type
        handelview,
        handelexceptionview
      );
    }
  };


  const handelview = (dataObject) => {
    const rowData = [dataObject.data];
    setRows(rowData);
  };

  const handelexceptionview = () => { };

  const onDepartmentChange = (e) => {
    setDepartment(e.target.value);
    FetchAssetTypeSec(
      { id: e.target.value },
      handleBranchSuccess,
      handleBranchException
    );
  };

  const onSectionChange = (e) => {
    setSection(e.target.value);
    FetchAsstTypeAsset(
      { id: e.target.value },
      handleAsseTypeSuccess,
      handleAsseTypeException
    );
  };

  const handleBranchSuccess = (dataObject) => {
    setSectionList(dataObject.data);
  };

  const handleBranchException = (errorStaus, errorMessage) => { };

  const handleAsseTypeSuccess = (dataObject) => {
    setAssetTypeList(dataObject.data);
  };

  const handleAsseTypeException = (errorStaus, errorMessage) => { };

  const handleDepartmentshow = (dataObject) => {
    setDepartmentList(dataObject?.data);
  };

  const handleDepartmentshowException = (error, errorMessage) => { };

  const onAssetTypeChange = (e) => {
    setAssetType(e.target.value);
    MaintenanceShudeleName(
      { assetTypeId: e.target.value },
      Handelsuccess,
      handelexception
    );
  };

  return (
    <Card 
    // sx={{ paddingBottom: "15px", marginTop: "15px" }}
     sx={{
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",
    paddingBottom: "15px",
    marginTop: "15px",
  }}
    
    >
      <CardContent
      sx={{
      display: "flex",
      flexDirection: "column",
      flex: 1,
      overflow: "hidden",
    }}
      
      >
        <Typography variant="h6" component="div" sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
          Status
        </Typography>
        <Grid container spacing={2} style={{ marginTop: "20px", marginBottom: '20px' }}>
          <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Department</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Department"
                value={department}
                onChange={onDepartmentChange}
                size="small"
              >
                {departmentList?.map((data, index) => (
                  <MenuItem value={data.id} key={index}>
                    {data.departmentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Section</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Section"
                value={section}
                onChange={onSectionChange}
                size="small"
              >
                {sectionList?.map((data, index) => (
                  <MenuItem value={data.id} key={index}>
                    {data.Section}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Asset Type"
                value={assetType}
                onChange={onAssetTypeChange}
                size="small"
              >
                {assetTypeList?.map((data, index) => (
                  <MenuItem value={data.id} key={index}>
                    {data.AssetTypeView}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3} md={3} lg={3} xl={3}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Machine Name</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Asset Name"
                value={Machine}
               onChange={handleSelectChange}
                size="small"
              >
                {machineOptions?.map((data, index) => (
                  <MenuItem value={data.id} key={index}>
                    {data.type === 'machine' ? data.name : `Asset: ${data.name}`} {/* Render machine name or asset name */}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        {/* <div className="view_container"> */}
          <Box
      className="view_container"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
          <div className="view_subcontainer">
            <span className="view_headerText" style={{ m: 0, color: '#000000', fontWeight: 'bold' }}>View Warranty Dues</span>
          </div>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={8}
            rowsPerPageOptions={[8]}
            disableSelectionOnClick
            // sx={{
            //   height: 400,
            //   '& .MuiDataGrid-columnHeaders': {
            //     color: '#000000',
            //     fontWeight: 'bold',
            //   },
            //   '& .MuiDataGrid-columnHeaderTitle': {
            //     fontWeight: 'bold',
            //   },
            // }}
             sx={{
          flex: 1,
          "& .MuiDataGrid-columnHeaders": {
            color: "#000000",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
          },
        }}
          />
     </Box>
      </CardContent>
    </Card>
  );
};

export default StepOne;


