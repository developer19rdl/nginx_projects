import {
    Button, Dialog, DialogContent, DialogTitle, TextField, Grid, DialogActions,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../../Utility/NotificationBar';
// import { RegionAddData, RegionAddUpdate } from '../../Services/LocationService';
import { RegionAddData, RegionAddUpdate } from '../../Services/NodeJsApiServices';


const RegionModel = ({ open, setOpen, isAddButton, editData, setRefreshData, }) => {

    const [region, setRegion] = useState('');
    const [description, setDescription] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleCloseMenu = () => {
        setOpen(false);
    }

    useEffect(() => {

        setRegion(editData?.regionName || '');
        setDescription(editData?.description || '');
    }, [editData]);

    const ClearData = () => {
        setRegion('');
        setDescription('');
    }
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAddButton) {
            RegionAddData({
                regionName: region,
                description: description

            }, handleRegionAddDataSucess, handleRegionAddDataException);
        } else {
            RegionAddUpdate({
                id: editData?.id,
                regionName: region,
                description: description
            }, handleRegionAddDataSucess, handleRegionAddDataException)

        }
    }


    const handleRegionAddDataSucess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleCloseMenu();
            handleClose();
            setRefreshData(oldValue => !oldValue);
            ClearData();
        }, 2000);
    }

    const handleRegionAddDataException = (errorObject, errorMessage) => {
        console.log(errorMessage);

    }


    const handleTextRegion = (e) => {
        const newText = e.target.value.toUpperCase();
        setRegion(newText);
    };
    const handleTextDescription = (e) => {
        const newText = e.target.value.toUpperCase();
        setDescription(newText);
    };
    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}
        >
            <DialogTitle style={{ color: 'black' }}>
                {isAddButton ? 'Add Region' : 'Edit Region'}
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} style={{ marginTop: '0px' }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Region"
                                variant="outlined"
                                value={region}
                                onChange={handleTextRegion}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Description"
                                variant="outlined"
                                value={description}
                                onChange={handleTextDescription}
                                required
                            />

                        </Grid>

                    </Grid>

                    <DialogActions style={{ marginTop: '5px' }}>
                        <Button type='submit' style={{ color: 'black' }}>
                            {isAddButton ? 'Save ' : 'Update'}
                        </Button>
                        <Button onClick={handleCloseMenu} style={{ color: 'black' }}>
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

export default RegionModel
