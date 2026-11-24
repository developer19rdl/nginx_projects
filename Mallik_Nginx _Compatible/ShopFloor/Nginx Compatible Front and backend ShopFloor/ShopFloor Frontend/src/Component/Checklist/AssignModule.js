import React, { useEffect, useState } from 'react';
import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, Autocomplete, InputAdornment, OutlinedInput, ListItemText, RadioGroup, Radio, FormGroup, FormLabel,
} from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import { Card } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from "@mui/icons-material/Search";
import { AddMachine, MachineEdit, ShowMachineOperator, GetShift, ShowProcessMaster, getMachineUOM, AllShowMasterAdd, AddChecklist, ShowTemplate, UpdateChecklist, getMachines, AssignChecklist, DepartmentList, FetchAsstTypeAsset, FetchAssetTypeSec, getMachinesDepartmentBased, getAssetDepartmentBased } from '../../Services/NodeJsApiServices';


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const AssignModule = ({
    isAddButton, editData, setRefreshData, setAssignModalOpen, assignModalOpen, selectedRow
}) => {
    const [departmentList, setDepartmentList] = useState([]);
    // const [sectionList, setSetSectionList] = useState([]);
    const [department, setDepartment] = useState('')
    const [section, setSection] = useState('')
     const [sectionList, setSectionList] = useState([]);
    const [rowId, setRowId] = useState('');
    const [machineList, setMachineList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [assetTypeList, setAssetTypeList] = useState([]);
    const [assetType, setAssetType] = useState('');
    const [selectedAssetName, setSelectedAssetName] = useState('');   
      
    const [assetList, setAssetList] = useState([]);
    console.log("selectedIdsselectedIds", selectedIds)
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setAssignModalOpen(assignModalOpen);
        !isAddButton && loaderData();
    }, [editData]);

    useEffect(() => {
        // assignModalOpen && AllShowMasterAdd({
        //     masterType: "department"
        // }, handleDepartmentSucess, handleDepartmentException);

        assignModalOpen && DepartmentList(handleDepartmentSucess, handleDepartmentException);


        // assignModalOpen && AllShowMasterAdd({
        //     masterType: "section"
        // }, handleSectionSucess, handleSectionException);


        // assignModalOpen && getMachines(handleMachinesList, handleMachineListException);


    }, [assignModalOpen])

    // DEPARTMENT
    const handleDepartmentSucess = (dataObject) => {
        setDepartmentList(dataObject.data || []);
    }
    const handleDepartmentException = () => { }

    // SECTION
    const handleSectionSucess = (dataObject) => {
        setSectionList(dataObject.data || []);
    }
    const handleSectionException = () => { }

    // Machine List
    const handleMachinesList = (dataObject) => {
        setMachineList(dataObject.data || []);
    }
    const handleMachineListException = () => { }

     const handleAssetList = (dataObject) => {
        setAssetList(dataObject.data || []);
    }
    const handleAssetListException = () => { }

    //  const handleMachinesList = (dataObject) => {
    //     setMachineList(dataObject.data || []);
    // }
    // const handleMachineListException = () => { }

    // SUBMIT
    const handleSubmit = (event) => {
        event.preventDefault();
        if (!department || !section || !assetType || selectedIds.length === 0) {
            setNotification({
                status: true,
                type: 'error',
                message: 'Please fill all fields and select at least one asset.',
            });
            return;
        }
        AssignChecklist({
            checklist: selectedRow.checklistid,
            machine: selectedIds,
            section: section,
            department: department
        }, handleSuccess, handleException)
    };

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };
    const handleException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    };

    const ClearData = () => {
        setDepartment('');
        setSection('');
        setSectionList([]);
        setAssetTypeList([]);
        setAssetType('');
        setSelectedAssetName('');
        setMachineList([]);
        setAssetList([]);
        setSelectedIds([]);
        setAssignModalOpen(false);
        setRefreshData(oldvalue => !oldvalue);
    }

    const loaderData = () => {
        setRowId(editData?.id || '');
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // Convert API data to id-based maps for easier lookups
    const idToNameMap = new Map(machineList.map(item => [item.id, item.machineName]));
    const assetIdToNameMap = new Map(assetList.map(item => [item.id, item.machineName]));

    const handleChange = (event) => {
        setSelectedIds(event.target.value);
    };



    const handleDepartmentChange = (event) => {
        const value = event.target.value;

        setDepartment(value);
        setSection('');
        setSectionList([]);
        setAssetTypeList([]);
        setAssetType('');
        setSelectedAssetName('');
        setMachineList([]);
        setAssetList([]);
        setSelectedIds([]);

        FetchAssetTypeSec(
            { id: value },
            handleTypeSecSuccess,
            handleTypeSecException
        );
    };

      const onSectionChange = (e) => {
        setSection(e.target.value);
        setAssetTypeList([]);
        setAssetType('');
        setSelectedAssetName('');
        setMachineList([]);
        setAssetList([]);
        setSelectedIds([]);
        FetchAsstTypeAsset(
            { id: e.target.value },
            handleAsseTypeSuccess,
            handleAsseTypeException
        );
      };


        const handleAsseTypeSuccess = (dataObject) => {
            console.log("data Branch");
            setAssetTypeList(dataObject.data);
        };

        const handleAsseTypeException = (errorStaus, errorMessage) => {
            console.log(errorMessage);
        };

          const handleTypeSecSuccess = (dataObject) => {
            setSectionList(dataObject.data);
            // if (editAsset?.Department) {
            //   FetchAsstTypeAsset(
            //     { id: editAsset?.Section },
            //     handleAsseTypeSuccess,
            //     handleAsseTypeException
            //   );
            // }
          };
        
          const handleTypeSecException = (errorStaus, errorMessage) => {
          };


          const handleAssetTypeChanged = (value, AssetTypeView) => {
            setSelectedIds([]);
            setMachineList([]);
            setAssetList([]);

            if(AssetTypeView === "Machine Asset"){
                getMachinesDepartmentBased(
                    { id: department, typeId: value },
                    handleMachinesList,
                    handleMachineListException
                );
            }

            if(AssetTypeView === "Tool Asset" || AssetTypeView === "Instrumental Asset"){
                getAssetDepartmentBased(
                    { id: department, typeId: value },
                    handleAssetList,
                    handleAssetListException
                );
            }
        };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { minWidth: '50%' } }}
            maxWidth="lg"
            open={assignModalOpen}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                Assign Checklist
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Department</InputLabel>
                               <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Department"
                                    variant="filled"
                                    value={department}
                                    onChange={handleDepartmentChange}
                                >
                                    {departmentList.map((data) => (
                                        <MenuItem key={data.id} value={data?.id} >{data?.departmentName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                            {/* <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Section</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Section"
                                    variant="filled"
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                >
                                    {sectionList.map((data) => (
                                        <MenuItem key={data.id} value={data?.id} >{data?.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl> */}
                                           <FormControl fullWidth>
                                              <InputLabel id="demo-simple-select-label">Section</InputLabel>
                                              <Select
                                                labelId="demo-simple-select-label"
                                                id="demo-simple-select"
                                                label="Section"
                                                placeholder="Section"
                                                value={section}
                                                required
                                                onChange={(e) => onSectionChange(e)}
                                              >
                                                {sectionList.length !== 0 ? (
                                                  <MenuItem value="" key={0}>
                                                    <em>Select Section</em>
                                                  </MenuItem>
                                                ) : (
                                                  <MenuItem value="" key={0}>
                                                    <em>Select Department </em>
                                                  </MenuItem>
                                                )}
                                                {sectionList?.map((data, index) => {
                                                  return (
                                                    <MenuItem value={data.id} key={index}>
                                                      {data.Section}
                                                    </MenuItem>
                                                  );
                                                })}
                                              </Select>
                                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Asset Type</InputLabel>
                            <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Asset Type"
                            placeholder="Asset Type"
                            value={assetType}
                            onChange={(e) => {
                               const value = e.target.value;

                                const selectedAsset = assetTypeList.find(
                                (item) => item.id === value
                                );
                                setAssetType(value); // Store the ID
                                setSelectedAssetName(selectedAsset?.AssetTypeView || ""); // Store the name
                                handleAssetTypeChanged(value, selectedAsset.AssetTypeView); 
                            }}
                            >
                            {assetTypeList.length !== 0 ? (
                                <MenuItem value="" key={0}>
                                <em>Select Asset Type</em>
                                </MenuItem>
                            ) : (
                                <MenuItem value="" key={0}>
                                <em>Select Section</em>
                                </MenuItem>
                            )}
                            {assetTypeList?.map((data, index) => (
                                <MenuItem value={data.id} key={index}>
                                {data.AssetTypeView}
                                </MenuItem>
                            ))}
                            </Select>
                        </FormControl>
                        </Grid>
                      {selectedAssetName === "Machine Asset" && (
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                            <FormControl fullWidth>
                                <InputLabel id="demo-multiple-checkbox-label">Machine</InputLabel>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={selectedIds}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Machine" />}
                                    renderValue={(selected) => selected.map(id => idToNameMap.get(id)).join(', ')}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 224,
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    {machineList.map(({ id, machineName }) => (
                                        <MenuItem key={id} value={id}>
                                            <Checkbox checked={selectedIds.indexOf(id) > -1} />
                                            <ListItemText primary={machineName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                   )}
                      {selectedAssetName === "Tool Asset" && (
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                             <FormControl fullWidth>
                                <InputLabel id="demo-multiple-checkbox-label">Tool Asset</InputLabel>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={selectedIds}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Tool Asset" />}
                                    renderValue={(selected) => selected.map(id => assetIdToNameMap.get(id)).join(', ')}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 224,
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    {assetList.map(({ id, machineName }) => (
                                        <MenuItem key={id} value={id}>
                                            <Checkbox checked={selectedIds.indexOf(id) > -1} />
                                            <ListItemText primary={machineName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                      )}
                        {selectedAssetName === "Instrumental Asset" && (
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                             <FormControl fullWidth>
                                <InputLabel id="demo-multiple-checkbox-label">Instrumental Asset</InputLabel>
                                <Select
                                    labelId="demo-multiple-checkbox-label"
                                    id="demo-multiple-checkbox"
                                    multiple
                                    value={selectedIds}
                                    onChange={handleChange}
                                    input={<OutlinedInput label="Instrumental Asset" />}
                                    renderValue={(selected) => selected.map(id => assetIdToNameMap.get(id)).join(', ')}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 224,
                                                width: 250,
                                            },
                                        },
                                    }}
                                >
                                    {assetList.map(({ id, machineName }) => (
                                        <MenuItem key={id} value={id}>
                                            <Checkbox checked={selectedIds.indexOf(id) > -1} />
                                            <ListItemText primary={machineName} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                      )}

                    </Grid>
                    <DialogActions>
                        <Button
                            type="submit"
                            variant="contained"
                            style={{ width: '150px', background: '#002D68', color: 'white' }}
                        >
                            Assign
                        </Button>
                        <Button
                            variant="contained"
                            style={{ width: '150px', background: '#002D68', color: 'white' }}
                            onClick={() => {
                                setAssignModalOpen(false)
                                ClearData();
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    )
}

export default AssignModule