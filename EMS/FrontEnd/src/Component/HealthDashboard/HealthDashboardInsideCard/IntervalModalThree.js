import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Divider from '@mui/material/Divider';
import { GetSensorDropdown, UpdateMachineHeaderData, GetChartData, GetChartThreeData } from '../../../Services/NodeJsApiServices';

export const IntervalModalThree = (props) => {
    const {
        intervalModalThree,
        setIntervalModalThree,
        selectedGraph,
        setSelectedDropdown,
        selectedGropdown,
        machineId,
        // FIRST GRAPH
        setChartData,
        setChartThreeData,
        selectedLast,
        setSelectedLast,
        selectedAggregation,
        setSelectedAggregation,
        selectedInterval,
        setSelectedInterval,
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
        chartThreeTagId,
        chartThreeSlaveId,
        setBackDropLoader
    } = props;
    // const [selectedLast, setSelectedLast] = useState('8hr');
    // const [selectedAggregation, setSelectedAggregation] = useState('min');
    // const [selectedInterval, setSelectedInterval] = useState('1hr');

    // CHART ONE SUCCESS HANDLER
    const handleGetChartDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartThreeData(dataObject || [])
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
            open={intervalModalThree}
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
                                value={thirdSelectedLast}
                                label="Last"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setThirdSelectedLast(e.target.value)
                                    GetChartThreeData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: thirdSelectedAggregation,
                                        interval: thirdSelectedInterval,
                                        sortDataType: e.target.value,
                                        tagIds: chartThreeTagId,
                                        chartNo: 3,
                                        slaveId: chartThreeSlaveId
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
                                value={thirdSelectedAggregation}
                                label="Data Aggregations"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setThirdSelectedAggregation(e.target.value)
                                    GetChartThreeData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: e.target.value,
                                        interval: thirdSelectedInterval,
                                        sortDataType: thirdSelectedLast,
                                        tagIds: chartThreeTagId,
                                        chartNo: 3,
                                        slaveId: chartThreeSlaveId
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
                                value={thirdSelectedInterval}
                                label="Grouping Interval"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setThirdSelectedInterval(e.target.value)
                                    GetChartThreeData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: thirdSelectedAggregation,
                                        interval: e.target.value,
                                        sortDataType: thirdSelectedLast,
                                        tagIds: chartThreeTagId,
                                        chartNo: 3,
                                        slaveId: chartThreeSlaveId
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
                <Button onClick={() => setIntervalModalThree(false)}>Close</Button>
                {/* <Button onClick={handleSubmitForm}>
                    Update
                </Button> */}
            </DialogActions>
        </Dialog>
    )
}
