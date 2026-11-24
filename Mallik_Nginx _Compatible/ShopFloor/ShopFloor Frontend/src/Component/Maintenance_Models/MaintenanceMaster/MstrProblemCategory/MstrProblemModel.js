import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { ProblemAdd, ProblemUpdate } from '../../../../services/LoginServiceNod';

const MstrProblemModel = ({open, setOpen, isAddButton, editProblem,setNotification,setRefreshData}) => {
    const[problem,setProblem]=useState('');
    const[description,setDescription]=useState('');
    
    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    useEffect(()=>{
        setProblem(editProblem?.Category_name || '');
        setDescription(editProblem?.description || '');
    },[editProblem])

    const ClearData=()=>{
        setProblem('');
        setDescription('');
        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            ProblemAdd({
                Category_name: problem,
                description :description,
            }, handleSuccess, handleException)
        ) : (
            ProblemUpdate({
                id:editProblem.id,
                Category_name: problem,
                description :description,
            }, handleSuccess, handleException)
        );
    }

    const handleSuccess = (dataObject) => {
        console.log(dataObject);
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
                    <DialogTitle style={{background:'#051622',color:'white'}}>
                        {isAddButton === true ? 'Add ' : 'Update '}Problem
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{marginTop:'20px'}}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Problem Category"
                                placeholder="Problem Category"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                                setProblem(filteredValue);
                                }}
                                value={problem}
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
                                const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                                setDescription(filteredValue);
                                }}
                                value={description}
                            />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button 
                        type="submit"
                        variant="contained"
                        style={{  background: '#051622', color: 'white' }}
                        >
                        {isAddButton ? "Add" : "Update"}
                        </Button>
                        <Button 
                        onClick={handleClose}
                        variant="contained"
                        style={{  background: '#051622', color: 'white' }}
                        >
                        Cancel
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    )
}

export default MstrProblemModel
