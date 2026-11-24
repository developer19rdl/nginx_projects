import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { DepartmentAdd, DepartmentUpdate } from '../../../../Services/NodeJsApiServices';
// import { DepartmentAdd, DepartmentUpdate } from '../../../../services/LoginServiceNod';

const AddDepartmentModel = ({open, setOpen, isAddButton, editDepartment,setNotification,setRefreshData}) => {
    const[department,setDepartment]=useState('');
    const[description,setDescription]=useState('');
    
    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    useEffect(()=>{
        setDepartment(editDepartment?.departmentName || '');
        setDescription(editDepartment?.departmentDescription || '');
    },[editDepartment])

    const ClearData=()=>{
        setDepartment('');
        setDescription('');
        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            DepartmentAdd({
                departmentName: department,
                departmentDescription :description,
            }, handleSuccess, handleException)
        ) : (
            DepartmentUpdate({
                id:editDepartment.id,
                departmentName: department,
                departmentDescription :description,
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
    
    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle  sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton === true ? 'Add ' : 'Update '}Department
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{marginTop:'20px'}}>
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Department"
                                placeholder="Department"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphabetic characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                setDepartment(filteredValue);
                                }}
                                value={department}
                            />
                        </Grid>

                           
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Description"
                                placeholder="Description"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
                                setDescription(filteredValue);
                                }}
                                value={description}
                            />
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

export default AddDepartmentModel
