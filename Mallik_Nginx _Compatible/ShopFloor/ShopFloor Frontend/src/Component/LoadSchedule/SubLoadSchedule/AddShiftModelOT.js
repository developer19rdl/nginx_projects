import {
    Button, Grid, Dialog, DialogContent, DialogTitle, TextField, Select, FormControl, MenuItem, InputLabel, FormControlLabel, Radio, RadioGroup,
    LinearProgress,
    Box,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import DialogActions from '@mui/material/DialogActions';
import { connect } from 'react-redux';
import { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure } from '../../../Actions';
import { AddLaodSheduling, GetShowOtVerification, ImportReScheduleList, ImportReScheduleOT, UpdateLoadSchedule } from '../../../Services/NodeJsApiServices';
import UploadIcon from '@mui/icons-material/Upload';
import { DataGrid } from '@mui/x-data-grid';


const AddShiftModelOT = (props) => {
    const { open, setOpen, isAddButton, setRefreshData, configSetupData } = props;

  
    const [error, setError] = useState(false); //Validation

    // upload
   
    // NEW STATE
    const [Id, setId] = useState('')
    // const [selectedFromDate, setSelectedFromDate] = useState('');
    const today = new Date().toISOString().split("T")[0];
    const [selectedFromDate, setSelectedFromDate] = useState(today);

    const [selectedToDate, setSelectedToDate] = useState('');
    const [uploadLoader, setUploadLoader] = useState(false);

const [refreshData, setRefreshDataState] = useState(false);
const [otRows, setOtRows] = useState([]);   

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        //to get the dropdown machine list
        // props.getLoadScheduleMachineList();
        GetShowOtVerification( handleSuccess, handleException);

        setOpen(open);
        loaderData();
    }, [configSetupData]);



    const handleSubmit = (e) => {
        // e.preventDefault();
        // if (isAddButton) {
        //     AddLaodSheduling({
        //         scheduleDate: selectedDate,
        //         shiftNumber: selectedShift,
        //         file: uploadFile,

        //     }, handleSuccess, handleException);
        // } else {
        //     UpdateLoadSchedule({
        //         id: Id,
        //         scheduleDate: scheduleDate,
        //         shiftNumber: asignShift,
        //         machine_name: machineName
        //     }, handleSuccess, handleException);
        // }
    };

    const handleSuccess = (dataObject) => {
      setOtRows(dataObject?.data || []);    
    };


    const handleException = (errorObject, errorMessage) => {
        
    };

    const loaderData = () => {
        console.log("configSetupData", configSetupData)
        setId(configSetupData?.id || '');

    }
  
    const ClearData = () => {
        setOpen(false);
        setSelectedFromDate('');
        setSelectedToDate('');
        setRefreshData(oldvalue => !oldvalue);
    }


    // Get tomorrow's date
    const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // Format the date as "YYYY-MM-DD" for the input field
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const shiftMap = {
    1: "1st Shift",
    2: "2nd Shift",
    3: "3rd Shift",
    4: "General Shift"
};


    

    const otColumns = [
    { field: 'id', headerName: 'Sl No', width: 90 },
    { field: 'operatorName', headerName: 'Operator', width: 150 },
    { field: 'operatorId', headerName: 'Operator ID', width: 130 },
    { field: 'scheduleDate', headerName: 'Date', width: 130 },

    {
    field: 'shift',
    headerName: 'Shift',
    width: 120,
    valueGetter: (params) => shiftMap[params.row.shiftNumber] || "-"
},
    { field: 'machineName', headerName: 'Machine Name', width: 160 },
    { field: 'loginTime', headerName: 'Login Time', width: 150 },
    { field: 'logoutTime', headerName: 'Logout Time', width: 150 },
    { field: 'totalTime', headerName: 'Total Time', width: 130 },
    { field: 'approvedTime', headerName: 'Approved Time', width: 150 },
];

// Example dummy rows (you can replace with API data)
// const otRows = [
//     { id: 1, operator: 'Rohan', shift: 'A', machineName: 'MCH-01', loginTime: '08:00', logoutTime: '16:00', totalTime: '8h', approvedTime: '8h' },
//     { id: 2, operator: 'Manju', shift: 'B', machineName: 'MCH-04', loginTime: '16:00', logoutTime: '00:00', totalTime: '8h', approvedTime: '7.5h' },
// ];

    return (
        <Dialog
            fullWidth
            maxWidth="md"
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            open={open}
        >
            <form onSubmit={handleSubmit}>
                {uploadLoader &&
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress />
                    </Box>
                }
                <DialogTitle style={{ fontFamily: 'Roboto Slab' }}>
                    OT Verification
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} padding={1}>
                       
                        <>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                                <TextField
                                    value={selectedFromDate}
                                    type='date'
                                    id="outlined-basic"
                                    label="Today"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => { setSelectedFromDate(e.target.value); }}
                                    autoComplete="off"
                                    required
                                    InputLabelProps={{
                                        shrink: true, style: { fontFamily: 'customfont', fontSize: '17px', fontWeight: 'bold' }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                        <div style={{ height: 400, width: '100%' }}>
                            <DataGrid
                                rows={otRows}
                                columns={otColumns}
                                pageSize={5}
                                rowsPerPageOptions={[5, 10]}
                                disableSelectionOnClick
                            />
                        </div>
</Grid>
                        </>
                           

                    </Grid>
                </DialogContent>
                <DialogActions sx={{ margin: '10px' }}>
                    <Button
                        size="large"
                        autoFocus
                        onClick={() => {
                            setOpen(false);
                            loaderData();
                            setSelectedFromDate('');
                            setSelectedToDate('');
                            setError(false); //Validation
                            // setMachineMaxCapacity('') //Validation
                        }}
                    >
                        Cancel
                    </Button>
                 
                </DialogActions>
            </form>
           
        </Dialog >
    );
}

const mapStateToProps = ({ LoadSchedule }) => {
    const { loadScheduleLoader, loadScheduleList } = LoadSchedule;
    return { loadScheduleLoader, loadScheduleList }
}
export default connect(mapStateToProps, { addLoadSchedule, getLoadScheduleMachineList, editLoadSchedule, editCapacityMeasure })(AddShiftModelOT);