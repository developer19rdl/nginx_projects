import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';

import { MeterAddService, MeterEditService, FetchMeterService, FetchCompanyService, FetchDeviceListService } from '../../../Services/LoginPageService.js'



import { AddCustomerValidate } from '../../../Pages/validation/formValidation.js'
import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import { EdgeDevicename, MeterAllocationAdd, MeterAllocationViewedit, MeterPlantDropdown, allocMachinesList, getDeviceSlaveId, MeterFederDropdown, MeterPlantAdd, MeterPlantEdit, PlantIncomerAdd, PlantIncomerUpdate, IncomerAdd, IncomerUpdate } from '../../../Services/NodeJsApiServices.js';
import AddPlantModal from './AddPlantModal.js';

function MeterPlantAllocationModal({ open, setOpen, isAddButton, meterData, setRefreshData }) {
    const [id, setId] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [valueKW, setValueKW] = useState('');
    const [slaveId, setSlaveId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [meterTypeName, setMeterTypeName] = useState('');
    const [machineSlaveList, setMachineSlaveList] = useState([])
    const [plantModalOpen, setPlantModalOpen] = useState(false)
    const [pageRefresher, setPageRefresher] = useState(false);
    const [plantList, setPlantList] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('')
    const [meterDisplay, setMeterDisplay] = useState(false)
    const [selectedLine, setSelectedLine] = useState('')

    const [deviceList, setDeviceList] = useState([]);
    const [errorObject, setErrorObject] = useState({});

    const [federList, setFederList] = useState([]);
    const [selectedFeader, setSelectedFeader] = useState('')
    const [plantName, setPlantName] = useState('')
    const [plantDescription , setPlantDescription ] = useState('')








    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loadData();
        open && EdgeDevicename(handleFetchSuccess, handleFetchException);
        open && MeterPlantDropdown(handlePlantDropSuccess, handlePlantDropException);
    }, [meterData, pageRefresher]);

    const handleFetchSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };
    const handleFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const handlePlantDropSuccess = (dataObject) => {
        setPlantList(dataObject.data)
    }
    const handlePlantDropException = () => { }

    const loadData = () => {
        setId(meterData.id || '');
        setDeviceId(meterData.deviceId || '');
        setPlantDescription((meterData.plantDescription || ''))
        setPlantName((meterData.plantName || ''))
        setSlaveId(meterData.slaveId || '');
        setDisplayName(meterData.displayName || '');
        setValueKW(meterData.valueKW || '');
        setMeterTypeName(meterData.meterType || '');
        setSelectedPlant(meterData.plantId || '')
        setMeterDisplay(meterData.displayMeter === 1 ? true : false || false)
        setSelectedLine(meterData.dashDisplayNumber || '')
        // setSelectedFeader(meterData.feederName || '')
        !isAddButton && getDeviceSlaveId({ deviceId: meterData.deviceId }, handleGetSlaveSucess, handleGetSlaveException)
    };

    //SLAVEID HANDLER
    const handleGetSlaveSucess = (dataObject) => {
        setMachineSlaveList(dataObject.data);
    }
    const handleGetSlaveException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }



    //SLAVEID HANDLER
    const handleGetFeadrSucess = (dataObject) => {
        setFederList(dataObject.data);
    }
    const handleGetFeadrException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }

    const validateForNullValue = (value, type) => {
        AddCustomerValidate(value, type, setErrorObject);
    };

    const handleSuccess = (dataObject) => {
        setRefreshData((oldvalue) => !oldvalue);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            id: id,
            // regionId: editData?.id,
            plantName : plantName,
            plantDescription: plantDescription,
            // feederName:selectedFeader
        };

        const serviceFunction = isAddButton ? MeterPlantAdd : MeterPlantEdit;
        serviceFunction(formData, handleSuccess, handleException);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
        }, 5000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const MeterTypeList = [
        { id: 1, MeterType: 'Electric board (incomer)' },
        { id: 2, MeterType: 'Solar' },
        { id: 3, MeterType: 'Generator' },
        { id: 4, MeterType: 'Asset' },
        { id: 5, MeterType: 'Distributors' },
        { id: 6, MeterType: 'Windmill' },
        { id: 7, MeterType: 'UPS' },
        { id: 8, MeterType: 'Sub distributors' },
        { id: 9, MeterType: 'Isolation transformer' },
        { id: 10, MeterType: 'Feeder' },
    ]

    return (
        <Dialog open={open}>
            <DialogTitle >{isAddButton ? 'Manage Plant' : 'Edit Manage Plant'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={4} sm={4} md={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Button variant="contained" style={{ backgroundColor: '#051622' }} onClick={() => setPlantModalOpen(true)}>Manage Plant</Button>
                        </Grid> */}

                        <Grid item xs={12} sm={12} md={12}>
                            <TextField
                                label="Plant Name"
                                type="text"
                                value={plantName}
                                variant="outlined"
                                placeholder="Plant Name"
                                required
                                onChange={(e) => setPlantName(e.target.value)}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <TextField
                                label="Plant Description"
                                type="text"
                                value={plantDescription}
                                variant="outlined"
                                placeholder="Plant Description"
                                required
                                onChange={(e) => setPlantDescription(e.target.value)}
                                autoComplete="off"
                                fullWidth
                            />
                        </Grid>



                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" style={{ background: '#0e2d5d', color: '#f5f5fc' }}>{isAddButton ? 'Add' : 'Update'}</Button>
                    <Button style={{ background: '#0e2d5d', color: '#f5f5fc' }} onClick={() => {
                        setOpen(false);
                        setErrorObject({});
                        loadData();

                    }}>
                        Cancel
                    </Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <AddPlantModal
                plantModalOpen={plantModalOpen}
                setPlantModalOpen={setPlantModalOpen}
                setPageRefresher={setPageRefresher}
            />
        </Dialog>
    );
}

export default MeterPlantAllocationModal;
