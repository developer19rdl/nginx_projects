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
import { AddToolsMachineView, FailuremetricAdd, FailuremetricUpdate, SelectMachineAlert } from '../../../../Services/NodeJsApiServices';

const FailureMetriceTargetModel = ({ open, setOpen, isAddButton, editConfigSetup, setNotification, setRefreshData }) => {
    const [machine, setMachine] = useState('');
    const [machineList, setMachineList] = useState([]);
    const [mtbfTarget, setMtbfTarget] = useState('');
    const [mttrTarget, setMttrTarget] = useState('');
    const [mttfTarget, setMttfTarget] = useState('');

    useEffect(() => {
        // SelectMachineAlert(handleMachineSelectshow,handleMachineSelectshowException);
        AddToolsMachineView(handleMachineSelectshow, handleMachineSelectshowException);
        setMachine(editConfigSetup?.Machine || '');
        setMtbfTarget(editConfigSetup?.mtbfTarget || '');
        setMttrTarget(editConfigSetup?.mttrTarget || '');
        setMttfTarget(editConfigSetup?.mttfTarget || '');
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
    };

    const onSubmit = (e) => {
        e.preventDefault();
        isAddButton === true ?
            (
                FailuremetricAdd({
                    machine_name: machine,
                    mtbfTarget: mtbfTarget,
                    mttfTarget: mttrTarget,
                    mttrTarget: mttfTarget,
                }, handleSuccess, handleException)
            ) : (
                FailuremetricUpdate({
                    id: editConfigSetup.id,
                    machine_name: machine,
                    mtbfTarget: mtbfTarget,
                    mttfTarget: mttrTarget,
                    mttrTarget: mttfTarget,
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
        }, 2000);
        setRefreshData(oldValue => !oldValue);
        // ClearData();  
    }

    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        // ClearData();
    }

    return (
        <div>
            <Dialog sx={{ '& .MuiDialog-paper': { width: '62%', maxHeight: '100%' } }}
                maxWidth="lg"
                open={open}>
                <form onSubmit={onSubmit}>
                    <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                        {isAddButton ? 'Add ' : 'Update '}Failure Metric Target
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} style={{ marginTop: '20px' }}>
                            <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
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
                            < Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                                <TextField
                                    fullWidth
                                    label="MTBF Target "
                                    placeholder="MTBF Target"
                                    variant="outlined"
                                    required
                                    value={mtbfTarget}
                                    onChange={(e) => setMtbfTarget(e.target.value)}

                                />
                            </Grid>
                            < Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                                <TextField
                                    fullWidth
                                    label="MTTR Target "
                                    placeholder="MTTR Target"
                                    variant="outlined"
                                    required
                                    value={mttrTarget}
                                    onChange={(e) => setMttrTarget(e.target.value)}

                                />
                            </Grid>
                            < Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
                                <TextField
                                    fullWidth
                                    label="MTTF Target "
                                    placeholder="MTTF Target"
                                    variant="outlined"
                                    required
                                    value={mttfTarget}
                                    onChange={(e) => setMttfTarget(e.target.value)}

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

export default FailureMetriceTargetModel;
