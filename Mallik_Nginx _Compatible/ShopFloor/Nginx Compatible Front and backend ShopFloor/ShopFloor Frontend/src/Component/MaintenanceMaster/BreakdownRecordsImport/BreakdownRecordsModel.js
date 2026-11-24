import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { NatureAdd, NatureUpdate, ProblemShowdata } from '../../../Services/NodeJsApiServices';

const BreakdownRecordsModel = ({open, setOpen, isAddButton, editNature,setRefreshData,setNotification}) => {
    const[problem,setProblem]=useState('');
    const[problemList,setProblemList]=useState([]);
    const[nature,setNature]=useState('');
    const[description,setDescription]=useState('');

    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    useEffect(()=>{
        ProblemShowdata(handleProblemshow,handleProblemshowException);
        setProblem(editNature?.Category_name || '');
        setNature(editNature?.Nature_problem || '');
        setDescription(editNature?.description || '');
    },[editNature])

    const handleProblemshow=(dataObject)=>{
        setProblemList(dataObject?.data);
        console.log(dataObject?.data);
    }
    
    const handleProblemshowException=(error,errorMessage)=>{
        console.log(errorMessage);
    }

    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
        (
            NatureAdd({
                Category_name: problem,
                Nature_problem:nature,
                description :description,
            }, handleSuccess, handleException)
        ) : (
            NatureUpdate({
                id:editNature.id,
                Category_name: problem,
                Nature_problem:nature,
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
    

    const ClearData=()=>{
        setProblem('');
        setNature('');
        setDescription('');
        setRefreshData(oldValue => !oldValue);
    }

    const onProblemChange=(e)=>{
        setProblem(e.target.value);
    }
    
    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle style={{background:'#051622',color:'white'}}>
                        {isAddButton === true ? 'Add ' : 'Update '}Nature of Problem
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{marginTop:'20px'}}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Problem Category</InputLabel>
                                    <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Problem Category"
                                    placeholder='Problem Category'
                                    value={problem}
                                    required
                                    onChange={(e) => onProblemChange(e) }>
                                    {
                                        problemList?.map((data, index) => {
                                            return (
                                                <MenuItem value={data.id} key={index}>{data.Category_name}</MenuItem>
                                            )
                                        })
                                    }      
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                            <TextField 
                                fullWidth 
                                label="Nature of Problem"
                                placeholder="Nature of Problem"
                                variant="outlined"
                                required
                                onChange={(e) => {
                                const value = e.target.value;
                                // Only allow alphanumeric characters and spaces
                                const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
                                setNature(filteredValue);
                                }}
                                value={nature}
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
                        style={{ background: '#051622', color: 'white' }}
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

export default BreakdownRecordsModel
