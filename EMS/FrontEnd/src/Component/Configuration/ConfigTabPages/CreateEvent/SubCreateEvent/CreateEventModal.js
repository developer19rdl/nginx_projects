import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import { AddEvent, AddEventUpdate } from '../../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../../Utility/NotificationBar';

const CreateEventModal = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;

    const [rowId, setRowId] = useState('')
    const [eventTitle, setEventTitle] = useState('')
    const [error, setError] = useState(false); //ADD THIS STATE

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loaderData();
    }, [configSetupData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('success');
        if (isAddButton) {
            if (eventTitle.trim() === '') { //ADD THIS CONDITION
                setError(true);
            } else {
                AddEvent({ eventName: eventTitle, eventDescription: eventTitle }, handleSuccess, handleException)
            }
        } else {
            if (eventTitle.trim() === '') { //ADD THIS CONDITION
                setError(true);
            } else {
                AddEventUpdate({
                    id: rowId,
                    eventName: eventTitle,
                    eventDescription: eventTitle
                }, handleSuccess, handleException);
            }
        }
    }

    const handleSuccess = (dataObject) => {
        console.log("the dataObject ", dataObject);
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
        console.log("the error ", errorObject);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };

    const loaderData = () => {
        setRowId(configSetupData?.id || '')
        setEventTitle(configSetupData?.eventName || '');
    }

    const ClearData = () => {
        setError(false);
        setOpen(false);
        setRowId('');
        setEventTitle('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    return (
        <Dialog
            fullWidth
            maxWidth="sm"
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '100%' } }}
            open={open}
        >
            <>
                <DialogTitle>
                    {isAddButton ? 'Add' : 'Update'} Event
                </DialogTitle>

                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            {}
                            <TextField
                                value={eventTitle}
                                margin="dense"
                                id="outlined-basic"
                                label="Event Name"
                                variant="outlined"
                                fullWidth
                                onChange={(e) => { setEventTitle(e.target.value); }}
                                autoComplete="off"
                                error={error}                                           //ADD THIS CODE
                                helperText={error ? 'Event Name is required' : ''}      // ADD THIS CODE
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            loaderData();
                            setError(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        {' '}
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
                </DialogActions>
            </>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog >
    );
}

export default CreateEventModal;
