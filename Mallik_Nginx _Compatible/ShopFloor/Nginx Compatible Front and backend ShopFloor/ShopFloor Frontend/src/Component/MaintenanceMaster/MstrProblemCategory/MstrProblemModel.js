import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { ProblemAdd, ProblemUpdate } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
// import { ProblemAdd, ProblemUpdate } from '../../../../services/LoginServiceNod';

const MstrProblemModel = ({ open, setOpen, isAddButton, editProblem, setRefreshData }) => {
    const [problem, setProblem] = useState('');
    const [description, setDescription] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    useEffect(() => {
        setProblem(editProblem?.Category_name || '');
        setDescription(editProblem?.description || '');
    }, [editProblem])

    const ClearData = () => {
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
                    description: description,
                }, handleSuccess, handleException)
            ) : (
                ProblemUpdate({
                    id: editProblem.id,
                    Category_name: problem,
                    description: description,
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
        setTimeout(() => {
            setOpen(false);
            handleClose();
            ClearData();
        }, 2000);

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

    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton === true ? 'Add ' : 'Update '}Problem
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
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
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    )
}

export default MstrProblemModel
