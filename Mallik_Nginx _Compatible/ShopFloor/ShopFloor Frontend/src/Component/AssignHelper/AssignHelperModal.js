
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { AssignHelperAddService, AssignHelperEditService, ShowAssignMachine } from '../../Services/LoginPageService';

const AssignHelperModal = ({ open, setOpen, isAddButton, HelperData, setRefreshData }) => {
    const [id, setId] = useState('')
    const [helperCount, setHelperCount] = useState('');
    const [machine, setMachine] = useState('');
    const [perHalfcost, setPerHalfCost] = useState('')
    const [showAssignMachineList, setShowAssignMachinetList] = useState([]);
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isAddButton) {
            AssignHelperAddService({
                machineId: machine,
                helperCount: helperCount,
                helperPerHrCost: perHalfcost,


            }, handleUserSuccess, handleUserException);
        } else {
            AssignHelperEditService({
                id,
                machineId: machine,
                helperCount: helperCount,
                perHalfcost: perHalfcost,
            }, handleUserSuccess, handleUserException);
        }
    };
    const handleUserSuccess = () => {
        setRefreshData((oldvalue) => !oldvalue);
        setOpen(false);
    };
    const handleUserException = () => {

    };


    useEffect(() => {
        ShowAssignMachine(ShowAssignMachinetSuccess, ShowAssignMachinetException);
        setOpen(open)
        loadData();
    }, [HelperData]);

    const ShowAssignMachinetSuccess = (dataObject) => {
        setShowAssignMachinetList(dataObject?.data || []);

    };

    const ShowAssignMachinetException = () => {

    };
    const loadData = () => {
        setId(HelperData.id || '');
        setMachine(HelperData.machineId || '');
        setHelperCount(HelperData.helperCount || '');
        setPerHalfCost(HelperData.helperPerHrCost || '');


    };

    return (
        <Dialog sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth='sm'
            open={open} >
            <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
                {isAddButton ? 'Add Assign Helper' : 'Edit  Assign Helper'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2} >

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} style={{ display: 'flex', justifyContent: 'center' }}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Machine</InputLabel>
                                <Select
                                    // size="small"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Machine"
                                    value={machine}
                                    onChange={(e) => setMachine(e.target.value)}
                                >
                                    {showAssignMachineList && showAssignMachineList.map((item) => (
                                        <MenuItem value={item.id} key={item.id}>{item.machine_name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Helper Count"
                                type='number'
                                variant="outlined"
                                value={helperCount}
                                required
                                onChange={(e) => { setHelperCount(e.target.value) }}

                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6}>
                            <TextField
                                fullWidth
                                // size="small"
                                id="outlined-basic"
                                label="Helper/PerHalf Cost"
                                type="text"
                                variant="outlined"
                                value={perHalfcost}
                                required
                                onChange={(e) => { setPerHalfCost(e.target.value) }}

                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        style={{}}
                        onClick={(e) => {
                            setOpen(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        style={{}}
                    >
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>

                </DialogActions>
            </form>
        </Dialog>
    )
}

export default AssignHelperModal