import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Divider from '@mui/material/Divider';
import { GetSensorDropdown, UpdateMachineHeaderData, GetChartData } from '../../../Services/NodeJsApiServices';

export const IntervalModal = (props) => {
    const { intervalModal,
        setIntervalModal,
        selectedGraph,
        setSelectedDropdown,
        selectedGropdown,
        machineId,
        // FIRST GRAPH
        setChartData,
        selectedLast,
        setSelectedLast,
        selectedAggregation,
        setSelectedAggregation,
        selectedInterval,
        setSelectedInterval,
        chartOneTagId,
        // SECOND GRAPH
        secondSelectedLast,
        setSecondSelectedLast,
        secondSelectedAggregation,
        setSecondSelectedAggregation,
        secondSelectedInterval,
        setSecondSelectedInterval,
        //THIRD GRAPH
        thirdSelectedLast,
        setThirdSelectedLast,
        thirdSelectedAggregation,
        setThirdSelectedAggregation,
        thirdSelectedInterval,
        setThirdSelectedInterval,
        chartOneSlaveId,
        setBackDropLoader
    } = props;
    // const [selectedLast, setSelectedLast] = useState('8hr');
    // const [selectedAggregation, setSelectedAggregation] = useState('min');
    // const [selectedInterval, setSelectedInterval] = useState('1hr');

    // CHART ONE SUCCESS HANDLER
    const handleGetChartDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartData(dataObject || [])
    }
    const handleGetChartDataException = () => { }

    // CHART TWO SUCCESS HANDLER
    const handleGetChartTwoDataSuccess = (dataObject) => {
        // setChartData(dataObject || [])
    }
    const handleGetChartTwoDataException = () => { }

    // CHART THREE SUCCESS HANDLER
    const handleGetChartThreeDataSuccess = (dataObject) => {
        setChartData(dataObject || [])
    }
    const handleGetChartThreeDataException = () => { }

    return (
        <Dialog
            open={intervalModal}
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="sm"
        >
            {/* <DialogTitle id="alert-dialog-title">
                Header Filter
            </DialogTitle> */}
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Last</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedLast}
                                label="Last"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSelectedLast(e.target.value)
                                    GetChartData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: selectedAggregation,
                                        interval: selectedInterval,
                                        sortDataType: e.target.value,
                                        tagIds: chartOneTagId,
                                        chartNo: 1,
                                        slaveId: chartOneSlaveId
                                    }, handleGetChartDataSuccess, handleGetChartDataException)
                                }}
                            >
                                <MenuItem value={'8hr'}>8hrs</MenuItem>
                                <MenuItem value={'1day'}>1day</MenuItem>
                                <MenuItem value={'1week'}>1week</MenuItem>
                                <MenuItem value={'15days'}>15days</MenuItem>
                                <MenuItem value={'30days'}>30days</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Data Aggregations</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedAggregation}
                                label="Data Aggregations"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSelectedAggregation(e.target.value)
                                    GetChartData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: e.target.value,
                                        interval: selectedInterval,
                                        sortDataType: selectedLast,
                                        tagIds: chartOneTagId,
                                        chartNo: 1,
                                        slaveId: chartOneSlaveId
                                    }, handleGetChartDataSuccess, handleGetChartDataException)
                                }}
                            >
                                <MenuItem value={'count'}>Count</MenuItem>
                                <MenuItem value={'avg'}>Average</MenuItem>
                                <MenuItem value={'max'}>Max</MenuItem>
                                <MenuItem value={'min'}>Min</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Grouping Interval</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={selectedInterval}
                                label="Grouping Interval"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSelectedInterval(e.target.value)
                                    GetChartData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: selectedAggregation,
                                        interval: e.target.value,
                                        sortDataType: selectedLast,
                                        tagIds: chartOneTagId,
                                        chartNo: 1,
                                        slaveId: chartOneSlaveId
                                    }, handleGetChartDataSuccess, handleGetChartDataException)
                                }}
                            >
                                <MenuItem value={'15min'}>15Min</MenuItem>
                                <MenuItem value={'30min'}>30Min</MenuItem>
                                <MenuItem value={'1hr'}>1Hr</MenuItem>
                                <MenuItem value={'1day'}>1day</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setIntervalModal(false)}>Close</Button>
                {/* <Button onClick={handleSubmitForm}>
                    Update
                </Button> */}
            </DialogActions>
        </Dialog>
    )
}
