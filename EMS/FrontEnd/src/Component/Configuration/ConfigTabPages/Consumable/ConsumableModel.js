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
import { AddToolsMachineView, SelectMachineAlert, SetConsumableAdd, SetConsumableUpdate } from '../../../../Services/NodeJsApiServices';

const ConsumableModel = ({ open, setOpen, isAddButton, editConfigSetup, setNotification, setRefreshData }) => {
    const [machine, setMachine] = useState('');
    const [machineList, setMachineList] = useState([]);
    const [consumableName, setConsumableName] = useState('');
    const [consumableType, setConsumableType] = useState('');

    useEffect(() => {
        console.log("editConfigSetup==", editConfigSetup)
        AddToolsMachineView(handleMachineSelectshow, handleMachineSelectshowException);
        // SelectMachineAlert(handleMachineSelectshow,handleMachineSelectshowException);
        setMachine(editConfigSetup?.SelectMachine || '');
        setConsumableName(editConfigSetup?.ConsumableName || '');
        setConsumableType(editConfigSetup?.ConsumableType || '');
    }, [editConfigSetup])

    const handleMachineSelectshow = (dataObject) => {
        setMachineList(dataObject?.data);
        console.log(dataObject?.data);
    }

    const handleMachineSelectshowException = (error, errorMessage) => {
        console.log(errorMessage);
    }

    const onMachineChange = (e) => {
        setMachine(e.target.value);
    };

    const handleClose = () => {
        setOpen(false);
        ClearData();
    };

    const ClearData = () => {
        setMachine('');
        setConsumableName('');
        setConsumableType('');
        setRefreshData(oldValue => !oldValue);
    }


    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
            (
                SetConsumableAdd({
                    machine_name: machine,
                    ConsumableName: consumableName,
                    ConsumableType: consumableType,
                }, handleSuccess, handleException)
            ) : (
                SetConsumableUpdate({
                    id: editConfigSetup.id,
                    machine_name: machine,
                    ConsumableName: consumableName,
                    ConsumableType: consumableType,
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

    const handleConsumableNameChange = (e) => {
        const value = e.target.value;
        const regex = /^[A-Za-z\s]*$/;
        if (regex.test(value)) {
            setConsumableName(value);
        }
    };

    const handleConsumableTypeChange = (e) => {
        const value = e.target.value;
        const regex = /^[A-Za-z0-9\s]*$/;
        if (regex.test(value)) {
            setConsumableType(value);
        }
    };

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle>
                        {isAddButton ? 'Add ' : 'Update '}Consumable
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="machine-select-label">Machine</InputLabel>
                                    <Select
                                        labelId="machine-select-label"
                                        id="machine-select"
                                        label="Machine"
                                        value={machine}
                                        required
                                        onChange={(e) => onMachineChange(e)}
                                    >
                                        {
                                            machineList?.map((data, index) => {
                                                return (
                                                    <MenuItem value={data.id} key={index}>{data.machine_name}</MenuItem>
                                                )
                                            })
                                        }
                                    </Select>
                                </FormControl>
                            </Grid>
                            < Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Consumable Name"
                                    placeholder="Consumable Name"
                                    variant="outlined"
                                    required
                                    value={consumableName}
                                    onChange={handleConsumableNameChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <TextField
                                    fullWidth
                                    label="Consumable Type"
                                    placeholder="Consumable Type"
                                    variant="outlined"
                                    required
                                    value={consumableType}
                                    onChange={handleConsumableTypeChange}
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

export default ConsumableModel;
