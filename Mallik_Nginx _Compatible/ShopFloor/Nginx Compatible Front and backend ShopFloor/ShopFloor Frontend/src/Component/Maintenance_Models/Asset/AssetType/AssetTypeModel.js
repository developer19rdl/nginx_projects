import { DataObject } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { AssetTypeAdd, AssetTypeUpdate, DepartmentShowdata, FetchAssetTypeSec } from '../../../../Services/NodeJsApiServices';
// import { AssetTypeAdd, AssetTypeUpdate, DepartmentShowdata, FetchAssetTypeSec } from '../../../../services/LoginServiceNod';

const AssetTypeModel = ({open, setOpen, isAddButton, editAssetType,setRefreshData,setNotification}) => {
    const [department,setDepartment]=useState('');
    const [departmentList,setDepartmentList]=useState([]);
    const[section,setSection]=useState('');
    const[sectionList,setSectionList]=useState([]);
    const[assetType,setAssetType]=useState('');

    const handleClose = () => {
        setOpen(false);
        clearForm();
    };

    useEffect(()=>{
        DepartmentShowdata(handleLocationshow,handleLocationshowException);
        setDepartment(editAssetType?.Department || '');
        setSection(editAssetType?.Section || '');
        setAssetType(editAssetType?.AssetTypeView || '');
        console.log("editAssetType",editAssetType)
    },[editAssetType])

    const handleLocationshow=(dataObject)=>{
        setDepartmentList(dataObject?.data);
        console.log(dataObject?.data);
        if(editAssetType?.Department)
        {
            FetchAssetTypeSec({id:editAssetType?.Department},handleBranchSuccess, handleBranchException);
        }
    }

    const handleLocationshowException=(error,errorMessage)=>{
        console.log(errorMessage);
    }

    const handleBranchSuccess = (dataObject) =>{
        console.log('data Branch');
        setSectionList(dataObject.data);
    }
      
    const handleBranchException= (errorStaus, errorMessage) =>{
        console.log(errorMessage);
    }

    const onDepartmentChange=(e)=>{
        setDepartment(e.target.value);
        FetchAssetTypeSec({id:e.target.value},handleBranchSuccess, handleBranchException);
    }

    const onSectionChange=(e)=>{
        setSection(e.target.value);
    }

    
    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            AssetTypeAdd({
                id:department,
                Department:department,
                Section:section,
                AssetTypeView:assetType,
            }, handleAddSuccess, handleException)
        ) : (
            AssetTypeUpdate({
                id: editAssetType.id,
                Department:department,
                Section:section,
                AssetTypeView:assetType,
          }, handleUpdateSuccess, handleException)
        );
    }

    const handleAddSuccess = (dataObject) => {
        console.log(dataObject); 
        setRefreshData(oldValue => !oldValue);
        setNotification({
          status: true,
          type: 'success',
          message: dataObject.message,
        });
        setTimeout(() => {
            setOpen(false);
        }, 2000);
        setRefreshData(oldValue => !oldValue);
        clearForm();
    }

    const clearForm = () => {
        setDepartment('');
        setSection('');
        setAssetType('');
        setSectionList([]);
        setRefreshData(oldValue => !oldValue);
    }  
    
    const handleUpdateSuccess = (dataObject) => {
        console.log(dataObject);
        setNotification({
          status: true,
          type: 'success',
          message: dataObject.message,
        });
        setTimeout(() => {
            setOpen(false);
        }, 2000);
        setRefreshData(oldValue => !oldValue);
        clearForm();
    }

    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
          status: true,
          type: 'error',
          message: errorMessage,
        });
        setDepartment('');
        setSection('');
        setAssetType('');
        setSectionList([]);
        clearForm();
    }

    const onAssetTypeChange = (e) => {
        setAssetType(e.target.value);
    };

    return (
        <div>
            <Dialog
            sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle  sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton === true ? 'Add ' : 'Update '}Asset Type
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{marginTop:'20px'}}>  
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Department</InputLabel>
                                    <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Department"
                                    placeholder='Department'
                                    value={department}
                                    required
                                    onChange={(e) => onDepartmentChange(e) }>
                                    {
                                        departmentList?.map((data, index) => {
                                            return (
                                                <MenuItem value={data.id} key={index}>{data.departmentName}</MenuItem>
                                            )
                                        })
                                    }      
                                    
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Section</InputLabel>
                                    <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Section"
                                    placeholder='Section'
                                    value={section}
                                    required
                                    onChange={(e) => onSectionChange(e) }>
                                        {
                                            sectionList.length !== 0 ? (

                                            <MenuItem value="" key={0}>
                                            <em>Select Section</em>
                                            </MenuItem>
                                            )
                                        :
                                         (   <MenuItem value="" key={0}>
                                            <em>Select Department </em>
                                            </MenuItem>
                                        )}
                                    {
                                        sectionList?.map((data, index) => {
                                            return (
                                                <MenuItem value={data.id} key={index}>{data.Section}</MenuItem>
                                            )
                                        })

                                    }      
                                    
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            {/* <TextField 
                                fullWidth 
                                label="Asset Type"
                                placeholder="Asset Type"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                setAssetType(filteredValue);
                                }}
                                value={assetType}
                            /> */}
                               <FormControl fullWidth required>
                                <InputLabel id="asset-type-label">Asset Type</InputLabel>

                                <Select
                                    labelId="asset-type-label"
                                    id="asset-type"
                                    value={assetType || ""}
                                    // label="Asset Type"
                                    displayEmpty
                                    onChange={(e) => onAssetTypeChange(e)}
                                    // renderValue={(selected) =>
                                    // selected ? selected : "Select Asset Type"
                                    // }
                                >
                                    <MenuItem value="Machine Asset">Machine Asset</MenuItem>
                                    <MenuItem value="Tool Asset">Tool Asset</MenuItem>
                                    <MenuItem value="Instrumental Asset">Instrumental Asset</MenuItem>
                                </Select>
                                </FormControl>
                        </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button 
                        onClick={handleClose}
                        >
                        Cancel
                        </Button>
                        <Button 
                        type="submit"
                        >
                        {isAddButton ? "Add" : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        
        </div>
    )
}

export default AssetTypeModel
