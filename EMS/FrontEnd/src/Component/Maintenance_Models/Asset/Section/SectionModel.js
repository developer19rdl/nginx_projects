import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { DepartmentShowdata, SectionAdd, SectionUpdate } from '../../../../Services/NodeJsApiServices';
// import { DepartmentShowdata, SectionAdd } from '../../../../services/LoginServiceNod';

const SectionModel = ({open, setOpen, isAddButton, editSection,setRefreshData,setNotification}) => {
    const[department,setDepartment]=useState('');
    const[departmentList,setDepartmentList]=useState([]);
    const[section,setSection]=useState('');

    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    useEffect(()=>{
        DepartmentShowdata(handleDepartmentshow,handleDepartmentshowException);
        setDepartment(editSection?.Department || '');
        setSection(editSection?.Section || '');
    },[editSection])

    const handleDepartmentshow=(dataObject)=>{
        setDepartmentList(dataObject?.data);
        console.log(dataObject?.data);
    }
    
    const handleDepartmentshowException=(error,errorMessage)=>{
        console.log(errorMessage);
    }

    const ClearData=()=>{
        setDepartment('');
        setSection('');
        setRefreshData(oldValue => !oldValue);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            SectionAdd({
                Department: department,
                Section :section,
            }, handleSuccess, handleException)
        ) : (
            SectionUpdate({
                id:editSection.id,
                Department: department,
                Section :section,
            }, handleSuccess, handleException)
        );
    }

    const handleSuccess = (dataObject) => {
        console.log(dataObject);
        setRefreshData(oldValue => !oldValue); 
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(()=>{
            setOpen(false);
        }, 2000);

        setRefreshData(oldValue => !oldValue);  
        ClearData();  
    }

    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        ClearData();
    }

    const onDepartmentChange=(e)=>{
        setDepartment(e.target.value);
    }
    
    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle >
                        {isAddButton === true ? 'Add ' : 'Update '}Section
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
                            <TextField 
                                fullWidth 
                                label="Section"
                                placeholder="Section"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                                setSection(filteredValue);
                                }}
                                value={section}
                            />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button 
                        type="submit"
                        >
                        {isAddButton ? "Add" : "Update"}
                        </Button>
                        <Button 
                        onClick={handleClose}
                        >
                        Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
      
        </div>
    )
}

export default SectionModel
