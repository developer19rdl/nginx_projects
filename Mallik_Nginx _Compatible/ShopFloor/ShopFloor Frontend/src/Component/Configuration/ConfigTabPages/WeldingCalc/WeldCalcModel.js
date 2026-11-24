import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Radio,
    FormControlLabel,
    RadioGroup,
    FormControl,
    Box,
    Card,
    CardContent,
    Typography,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useEffect } from 'react';
import { WeldCalcAdd, WeldCalcUpdate } from '../../../../Services/NodeJsApiServices';

const WeldCalcModel = ({ open, setOpen, isAddButton, editConfigSetup, setNotification, setRefreshData }) => {
    const [kgPerMeter, setKgPerMeter] = useState('');

    useEffect(() => {
        setKgPerMeter(editConfigSetup?.oneMeter_kg || '');
    }, [editConfigSetup])




    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    const ClearData = () => {
        setKgPerMeter('');

        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
            (
                WeldCalcAdd({
                    oneMeterKg: kgPerMeter
                }, handleSuccess, handleException)
            ) : (
                WeldCalcUpdate({
                    id: editConfigSetup.id,

                    oneMeterKg: kgPerMeter

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
            // setRefreshData(oldValue => !oldValue);
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
    const handleKgPerMeterChange = (e) => {
        const value = e.target.value;
        setKgPerMeter(value);
    };
    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle sx={{ color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton ? 'Add ' : 'Update '} KG PER METER
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>

                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="KG PER METER"
                                    placeholder="KG PER METER"
                                    variant="outlined"
                                    required
                                    value={kgPerMeter}
                                    onChange={handleKgPerMeterChange}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions style={{ justifyContent: 'flex-end' }}>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isAddButton ? "Add" : "Update"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default WeldCalcModel;
