import React, { useState, useEffect } from 'react'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import Divider from '@mui/material/Divider';
import { GetSensorDropdown, UpdateMachineHeaderData, GetChartData, GetChartTwoData } from '../../../Services/NodeJsApiServices';

export const IntervalModalTwo = (props) => {
    const {
        intervalModalTwo,
        setIntervalModalTwo,
        selectedGraph,
        setSelectedDropdown,
        selectedGropdown,
        machineId,
        // FIRST GRAPH
        setChartTwoData,
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
        chartTwoTagId,
        //THIRD GRAPH
        thirdSelectedLast,
        setThirdSelectedLast,
        thirdSelectedAggregation,
        setThirdSelectedAggregation,
        thirdSelectedInterval,
        setThirdSelectedInterval,
        chartTwoSlaveId,
        setBackDropLoader
    } = props;
    // const [selectedLast, setSelectedLast] = useState('8hr');
    // const [selectedAggregation, setSelectedAggregation] = useState('min');
    // const [selectedInterval, setSelectedInterval] = useState('1hr');

    // CHART ONE SUCCESS HANDLER
    const handleGetChartDataSuccess = (dataObject) => {
        setBackDropLoader(false)
        setChartTwoData(dataObject || [])
    }
    const handleGetChartDataException = () => { }

    // CHART TWO SUCCESS HANDLER
    const handleGetChartTwoDataSuccess = (dataObject) => {
        // setChartData(dataObject || [])
    }
    const handleGetChartTwoDataException = () => { }

    // CHART THREE SUCCESS HANDLER
    const handleGetChartThreeDataSuccess = (dataObject) => {
        // setChartData(dataObject || [])
    }
    const handleGetChartThreeDataException = () => { }

    return (
        <Dialog
            open={intervalModalTwo}
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
                                value={secondSelectedLast}
                                label="Last"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSecondSelectedLast(e.target.value)
                                    GetChartTwoData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: secondSelectedAggregation,
                                        interval: secondSelectedInterval,
                                        sortDataType: e.target.value,
                                        tagIds: chartTwoTagId,
                                        chartNo: 2,
                                        slaveId: chartTwoSlaveId
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
                                value={secondSelectedAggregation}
                                label="Data Aggregations"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSecondSelectedAggregation(e.target.value)
                                    GetChartTwoData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: e.target.value,
                                        interval: secondSelectedInterval,
                                        sortDataType: secondSelectedLast,
                                        tagIds: chartTwoTagId,
                                        chartNo: 2,
                                        slaveId: chartTwoSlaveId
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
                                value={secondSelectedInterval}
                                label="Grouping Interval"
                                onChange={(e) => {
                                    setBackDropLoader(true)
                                    setSecondSelectedInterval(e.target.value)
                                    GetChartTwoData({
                                        machineId: machineId,
                                        selected: selectedGropdown,
                                        aggregation: secondSelectedAggregation,
                                        interval: e.target.value,
                                        sortDataType: secondSelectedLast,
                                        tagIds: chartTwoTagId,
                                        chartNo: 2,
                                        slaveId: chartTwoSlaveId
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
                <Button onClick={() => setIntervalModalTwo(false)}>Close</Button>
                {/* <Button onClick={handleSubmitForm}>
                    Update
                </Button> */}
            </DialogActions>
        </Dialog>
    )
}
