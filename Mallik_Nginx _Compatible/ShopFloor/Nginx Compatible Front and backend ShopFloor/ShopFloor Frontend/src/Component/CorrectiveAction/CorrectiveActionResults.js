import React, {
    useState, useEffect
} from 'react'
import DeleteConfirmationDailog from '../../utils/confirmDeletion'
import NotificationBar from '../../Utility/NotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import { useUserAccess } from '../../context/UserAccessProvider';
import {  CorrectiveActionAssetService, CorrectiveActionDeleteService, CorrectiveActionFetchService, DepartmentShowdata, FetchAssetTypeSec, FetchAsstTypeAsset, MaintenanceShudeleName, ShowChecklistDropDown } from '../../Services/NodeJsApiServices'
// import PropTypes from 'prop-types';
// import AvgBalanceToolbar from './AvgBalanceToolbar'
// import AvgBalanceModel from './CorrectiveActionModel'
import CorrectiveActionToolbar from './AvgBalanceToolbar';
import CorrectiveActionModel from './CorrectiveActionModel';
import {
    Tabs, Tab, Typography, Box, InputLabel, MenuItem, FormControl, Select, Stack, Grid, styled,
} from '@mui/material';

const CorrectiveActionResults = ({deviceList }) => {

    const columns = [
        {
            field: 'problemStatement',
            headerName: 'Problem Statement',
            minWidth: 130,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'correctiveAction',
            headerName: 'Corrective Action',
            minWidth: 100,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'fromDate',
            headerName: 'From Date',
            minWidth: 90,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'meterName',
            headerName: 'Meter Name',
            minWidth: 90,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'assetName',
            headerName: 'Asset Name',
            minWidth: 90,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [machineCorrectiveList, setMachineCorrectiveList] = useState([]);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    // const moduleAccess = useUserAccess()('device');

    const [deviceId, setDeviceId] = useState('');

    const [assetId, setAssetId] = useState('');

      const [meterList, setMeterList] = useState([]);
      const [Machine, setMachine] = useState('');
      const [department, setDepartment] = useState("");
      const [departmentList, setDepartmentList] = useState([]);
      const [section, setSection] = useState("");
      const [sectionList, setSectionList] = useState([]);
      const [assetType, setAssetType] = useState("");
      const [assetTypeList, setAssetTypeList] = useState([]);
      const [machineOptions, setMachineOptions] = useState([]);
      const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setMachineCorrectiveList(dataObject?.data || []);
    };

    const handleException = (errorObject) => {

    };

    function DeleteData(props) {
        return  (
            <DeleteIcon onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteDailogOpen(true);
            }}
            />
        );
    }

    useEffect(() => {
        CorrectiveActionFetchService(handleSuccess, handleException);
        DepartmentShowdata(departmentHandleSuccess, handleDepartmentException);

    }, [refreshData]);

      const handleDepartmentException = (dataObject) => { };
        const departmentHandleSuccess = (dataObject) => {
        setDepartmentList(dataObject.data);
        console.log(dataObject.data);
    };

    const deletehandleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setDeleteDailogOpen(false);
        }, 3000);
    };

    const deletehandleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
        }, 3000);
    };

    function EditData(props) {
        return (
                <EditIcon onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditConfigSetup(props.selectedRow);
                    setOpen(true);
                }}
                />
            );
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

      const onDepartmentChange = (e) => {
        setDepartment(e.target.value);
        FetchAssetTypeSec(
          { id: e.target.value },
          handleBranchSuccess,
          handleBranchException
        );
      };

        const handleBranchSuccess = (dataObject) => {
    setSectionList(dataObject.data);
  };

  const handleBranchException = (errorStaus, errorMessage) => { };


    const HandleDeviceChange = (deviceId) => {

        if (deviceId) {

            CorrectiveActionAssetService({ deviceId }, MeterHandleSuccess, MeterHandleException);
        }

        setDeviceId(deviceId);
    };
    const MeterHandleSuccess = (dataObject) => {
        setMeterList(dataObject.data || []);

    };

    const MeterHandleException = () => { };

      const onSectionChange = (e) => {
        setSection(e.target.value);
        FetchAsstTypeAsset(
          { id: e.target.value },
          handleAsseTypeSuccess,
          handleAsseTypeException
        );
      };
        const handleAsseTypeSuccess = (dataObject) => {
    setAssetTypeList(dataObject.data);
  };

  const handleAsseTypeException = (errorStaus, errorMessage) => { };

   const handleSelectChange = (event) => {
      setMachine(event.target.value);
      setAssetId(event.target.value);
      const selectedId = event.target.value;
  
      // Find the selected option based on the selected ID
      const selectedOption = machineOptions.find(
        (option) => option.id === selectedId
      );
      console.log("selectedOptionselectedOption", selectedOption)
  
      if (selectedOption) {
        // Set the selected machine or asset name based on the type
        if (selectedOption.type === 'machine') {
        //   setSelectedMachineName(selectedOption.name);
        //    handleMachineTagChange(selectedOption.machine_tag);
       
          } else {
        //   setSelectedMachineName(selectedOption.name); // Set the asset name if it's an asset
          
        }
  
            // ✅ Set machine tag also
     
  
       
      }
    };

     const onAssetTypeChange = (e) => {
        setAssetType(e.target.value);
        MaintenanceShudeleName(
          { assetTypeId: e.target.value },
          Handelsuccess,
          handelexception
        );
      };

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
      
     
    return (

        <>
        
            {/* <Grid container spacing={1} alignItems="center">
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={2}
                    xl={3}
                >
                    <FormControl fullWidth size="small">
                        <InputLabel>Devices</InputLabel>
                        <Select
                            value={deviceId}
                            label="Devices"
                            onChange={(e) => {
                                HandleDeviceChange(e.target.value);
                            }}
                        >
                            <MenuItem value="" key={0}>
                                <em style={{ fontWeight: 'bold' }}>All</em>
                            </MenuItem>
                            {deviceList?.map((data, index) => (
                                <MenuItem value={data.id} key={index + 1}>{data.deviceName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={2}
                    xl={3}
                >
                    <FormControl fullWidth size="small">
                        <InputLabel>Assets</InputLabel>
                        <Select
                            value={assetId}
                            label="Devices"
                            onChange={(e) => {
                                setAssetId(e.target.value)
                            }}
                        >
                            <MenuItem value="" key={0}>
                                <em style={{ fontWeight: 'bold' }}>All</em>
                            </MenuItem>
                            {meterList?.map((data, index) => (
                                <MenuItem value={data.id} key={index + 1}>{data.assetName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>





            </Grid> */}

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







            <div style={{ height: 400, width: '100%' }}>


                <CorrectiveActionToolbar
                    setIsAddButton={setIsAddButton}
                    setEditConfigSetup={setEditConfigSetup}
                    setOpen={setOpen}
                    editConfigSetup={editConfigSetup}
                    // userAccess={moduleAccess}
                />

                 <DataGrid
                    rows={machineCorrectiveList}
                    columns={columns}
                    pageSize={5}
                    loading={isLoading}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                />
                
                <CorrectiveActionModel
                    assetId={assetId}
                    deviceId={deviceId}
                    isAddButton={isAddButton}
                    configSetupData={editConfigSetup}
                    open={open}
                    setOpen={setOpen}
                    setRefreshData={setRefreshData}
                    handleClose={handleClose}
                    openNotification={openNotification}
                    setNotification={setNotification}
                />
                
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />
                <DeleteConfirmationDailog
                    open={deleteDailogOpen}
                    setOpen={setDeleteDailogOpen}
                    deleteId={deleteId}
                    deleteService={CorrectiveActionDeleteService}
                    handleSuccess={deletehandleSuccess}
                    handleException={deletehandleException}
                /> 
            </div>
        </>
    )
}

export default CorrectiveActionResults
