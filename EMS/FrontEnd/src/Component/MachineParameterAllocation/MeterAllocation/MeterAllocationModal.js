import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';

import { MeterAddService, MeterEditService, FetchMeterService, FetchCompanyService, FetchDeviceListService } from '../../../Services/LoginPageService.js'



import { AddCustomerValidate } from '../../../Pages/validation/formValidation.js'
import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import {
    EdgeDevicename, MeterAllocationAdd, MeterAllocationViewedit,
    MeterPlantDropdown, allocMachinesList, getDeviceSlaveId,
    MeterFederDropdown, getPlantDistributorFeeder, GetIncomer, MeterBuildingShowList,
    UtilityMeterAdd, UtilityMeterViewedit,
    MeterCategoryByKind, MeterTypeByCategory,
} from '../../../Services/NodeJsApiServices.js';
import AddPlantModal from './AddPlantModal.js';

function MeterAllocationModal({ open, setOpen, isAddButton, meterData, setRefreshData }) {
    const [meterKind, setMeterKind] = useState('Energy Meter');

    // Energy meter fields
    const [id, setId] = useState('');
    const [deviceId, setDeviceId] = useState('');
    const [valueKW, setValueKW] = useState('');
    const [slaveId, setSlaveId] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [meterTypeName, setMeterTypeName] = useState('');
    const [meterTypeId, setMeterTypeId] = useState('');
    const [machineSlaveList, setMachineSlaveList] = useState([])
    const [plantModalOpen, setPlantModalOpen] = useState(false)
    const [pageRefresher, setPageRefresher] = useState(false);
    const [meterDisplay, setMeterDisplay] = useState(false)
    const [selectedLine, setSelectedLine] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [deviceList, setDeviceList] = useState([]);
    const [errorObject, setErrorObject] = useState({});

    const [buildingList, setBuildingList] = useState([]);
    const [buildingName, setBuildingName] = useState('');

    const [incomerList, setIncomerList] = useState([]);
    const [selectedIncomer, setSelectedIncomer] = useState("");
    const [plantList, setPlantList] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [distributerList, setDistributerList] = useState([]);
    const [selectedDistributer, setSelectedDistributer] = useState('');
    const [subDistributerList, setSubDistributerList] = useState([]);
    const [selectedSubDistributer, setSelectedSubDistributer] = useState('');

    // Dynamic category and meter type lists
    const [energyCategoryList, setEnergyCategoryList] = useState([]);
    const [utilityCategoryList, setUtilityCategoryList] = useState([]);
    const [energyMeterTypeList, setEnergyMeterTypeList] = useState([]);
    const [utilityMeterTypeList, setUtilityMeterTypeList] = useState([]);

    // Utility meter specific fields
    const [uamSet, setUamSet] = useState('');
    const [threshold, setThreshold] = useState('');
    const [minLimit, setMinLimit] = useState('');
    const [maxLimit, setMaxLimit] = useState('');
    const [utilityCategory, setUtilityCategory] = useState('');

    // Alert config (alertEnabled/alertCount/alertResetCount/emailAlert/smsAlert/latchAlert) is
    // edited from the dedicated Alert Settings modal (MeterAlertConfigModal.js), not here — but
    // this form's own Add/Update must still carry the current values through unchanged on every
    // save, otherwise a routine Edit Allocate would silently reset/disable whatever was configured.
    const [alertEnabled, setAlertEnabled] = useState(false);
    const [alertCount, setAlertCount] = useState('');
    const [alertResetCount, setAlertResetCount] = useState('');
    const [emailAlert, setEmailAlert] = useState(false);
    const [smsAlert, setSmsAlert] = useState(false);
    const [latchAlert, setLatchAlert] = useState(false);

    // Meter rollover counter (max accumulated value before meter resets to 0)
    const [counterValue, setCounterValue] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        loadData();
        if (open) {
            EdgeDevicename(handleFetchSuccess, handleFetchException);
            getPlantDistributorFeeder({}, handlePlantSuccess, handlePlantException);
            MeterBuildingShowList(handleBuildingSuccess, handleBuildingException);

            // Load energy categories; for edit also pre-load meter types
            MeterCategoryByKind('Energy Meter', (res) => {
                const list = res?.data || [];
                setEnergyCategoryList(list);
                if (!isAddButton && meterData.meterKind !== 'Utility Meter' && meterData.category) {
                    const cat = list.find((c) => c.categoryName === meterData.category);
                    if (cat) MeterTypeByCategory(cat.id, (r) => setEnergyMeterTypeList(r?.data || []), () => {});
                }
            }, () => {});

            // Load utility categories; for edit also pre-load meter types
            MeterCategoryByKind('Utility Meter', (res) => {
                const list = res?.data || [];
                setUtilityCategoryList(list);
                if (!isAddButton && meterData.meterKind === 'Utility Meter' && meterData.category) {
                    const cat = list.find((c) => c.categoryName === meterData.category);
                    if (cat) MeterTypeByCategory(cat.id, (r) => setUtilityMeterTypeList(r?.data || []), () => {});
                }
            }, () => {});
        }
    }, [meterData, pageRefresher]);

    const handleBuildingSuccess = (dataObject) => {
        setBuildingList(dataObject?.data || []);
    }
    const handleBuildingException = () => { }
    const handleIncomerSuccess = (dataObject) => {
        setIncomerList(dataObject?.data || []);
    }
    const handleIncomerException = () => { }

    const handlePlantSuccess = (dataObject) => {
        setPlantList(dataObject?.data || [])
    }
    const handlePlantException = (dataObject) => { }

    const handleFetchSuccess = (dataObject) => {
        setDeviceList(dataObject.data);
    };
    const handleFetchException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    };

    const loadData = () => {
        setMeterKind(meterData.meterKind || 'Energy Meter');
        setSelectedIncomer(meterData.incomerId || '');
        setSelectedPlant(meterData.plantId || '');
        setSelectedDistributer(meterData.distributerId || '');
        setSelectedSubDistributer(meterData.feederId || '');
        setId(meterData.id || '');
        setDeviceId(meterData.deviceId || '');
        setSlaveId(meterData.slaveId ? String(meterData.slaveId) : '');
        setBuildingName(meterData.buildingId || '');
        setDisplayName(meterData.displayName || meterData.meterName || '');
        setValueKW(meterData.valueKW || '');
        setMeterTypeName(meterData.meterType || '');
        setMeterTypeId(meterData.meterTypeId || '');
        setSelectedCategory(meterData.meterKind === 'Utility Meter' ? '' : (meterData.category || ''));
        setUtilityCategory(meterData.meterKind === 'Utility Meter' ? (meterData.category || '') : '');
        setMeterDisplay(meterData.displayMeter === 1 ? true : false || false)
        setSelectedLine(meterData.dashDisplayNumber || '')
        setUamSet(meterData.uamSet || '');
        setThreshold(meterData.threshold || '');
        setMinLimit(meterData.minLimit ?? '');
        setMaxLimit(meterData.maxLimit ?? '');
        setAlertEnabled(Number(meterData.alertEnabled) ? true : false);
        setAlertCount(meterData.alertCount ?? '');
        setAlertResetCount(meterData.alertResetCount ?? '');
        setEmailAlert(Number(meterData.emailAlert) ? true : false);
        setSmsAlert(Number(meterData.smsAlert) ? true : false);
        setLatchAlert(Number(meterData.latchAlert) ? true : false);
        setCounterValue(meterData.counter_value ? String(meterData.counter_value) : '');
        if (!isAddButton) {
            getDeviceSlaveId({ deviceId: meterData.deviceId }, handleGetSlaveSucess, handleGetSlaveException);
            meterData.plantId && GetIncomer({ plantId: meterData.plantId }, handleIncomerSuccess, handleIncomerException);
            getPlantDistributorFeeder({ plantId: meterData.plantId }, handleDistributorSuccess, handleDistributorException);
            getPlantDistributorFeeder({ plantId: meterData.plantId, distributerId: meterData.distributerId }, handleSubDistributorSuccess, handleSubDistributorException);
        }
    };

    const handleGetSlaveSucess = (dataObject) => {
        setMachineSlaveList(dataObject.data);
    }
    const handleGetSlaveException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
    }

    const handleGetFeadrSucess = (dataObject) => { }
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

        if (meterKind === 'Utility Meter') {
            const formData = {
                id,
                plantId: selectedPlant,
                buildingId: buildingName,
                meterName: displayName,
                meterType: meterTypeName,
                meterTypeId: meterTypeId || null,
                category: utilityCategory,
                deviceId,
                slaveId,
                uamSet,
                threshold,
                minLimit: minLimit === '' ? null : minLimit,
                maxLimit: maxLimit === '' ? null : maxLimit,
                // Carried through unchanged — edited via the separate Alert Settings modal, not here.
                alertEnabled,
                alertCount: alertCount === '' ? null : alertCount,
                alertResetCount: alertResetCount === '' ? null : alertResetCount,
                emailAlert,
                smsAlert,
                latchAlert,
                displayMeter: JSON.parse(meterDisplay),
                counterValue: counterValue ? Number(counterValue) : null,
                meterKind: 'Utility Meter',
            };
            const serviceFunction = isAddButton ? UtilityMeterAdd : UtilityMeterViewedit;
            serviceFunction(formData, handleSuccess, handleException);
            return;
        }

        // Energy Meter submit — Incomer category has no distributor/feeder hierarchy
        const isIncomerCategory = selectedCategory === 'Incomer';
        const formData = {
            id,
            incomerId: selectedIncomer,
            buildingId: buildingName,
            category: selectedCategory,
            plantId: selectedPlant,
            distributerId: isIncomerCategory ? null : (selectedDistributer || null),
            feederId: isIncomerCategory ? null : (selectedSubDistributer || null),
            deviceId,
            slaveId,
            displayName,
            valueKW,
            meterType: meterTypeName,
            meterTypeId: meterTypeId || null,
            displayMeter: JSON.parse(meterDisplay),
            dashDisplayNumber: selectedLine,
            counterValue: counterValue ? Number(counterValue) : null,
            meterKind: 'Energy Meter',
        };

        const serviceFunction = isAddButton ? MeterAllocationAdd : MeterAllocationViewedit;
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

    // Hierarchy visible only for Outgoing category
    const showEnergyHierarchy = selectedCategory !== '' && selectedCategory !== 'Incomer' && meterTypeName;

    const handleDistributorSuccess = (dataObject) => {
        setDistributerList(dataObject?.data || [])
    }
    const handleDistributorException = (dataObject) => { }

    const handleSubDistributorSuccess = (dataObject) => {
        setSubDistributerList(dataObject?.data || [])
    }
    const handleSubDistributorException = (dataObject) => { }

    const handleKindChange = (e, newKind) => {
        if (newKind !== null) {
            setMeterKind(newKind);
            setMeterTypeName('');
            setSelectedCategory('');
            setUtilityCategory('');
            setEnergyMeterTypeList([]);
            setUtilityMeterTypeList([]);
        }
    };

    return (
        <Dialog open={open} sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '95%' } }} maxWidth="md">
            <DialogTitle>{isAddButton ? 'Allocate Meter' : 'Edit Allocate'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        {/* Meter Kind Toggle */}
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                            <ToggleButtonGroup
                                value={meterKind}
                                exclusive
                                onChange={handleKindChange}
                                size="small"
                                sx={{
                                    '& .MuiToggleButton-root.Mui-selected': {
                                        backgroundColor: '#0e2d5d',
                                        color: '#fff',
                                        '&:hover': { backgroundColor: '#0e2d5d' },
                                    },
                                }}
                            >
                                <ToggleButton value="Energy Meter" sx={{ px: 3, fontWeight: 600 }}>
                                    Energy Meter
                                </ToggleButton>
                                <ToggleButton value="Utility Meter" sx={{ px: 3, fontWeight: 600 }}>
                                    Utility Meter
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>

                        {/* ===== ENERGY METER FIELDS ===== */}
                        {meterKind === 'Energy Meter' && (
                            <>
                                <Grid item xs={8} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Plant</InputLabel>
                                        <Select
                                            label="Plant"
                                            value={selectedPlant}
                                            onChange={(e) => {
                                                const plantId = e.target.value;
                                                setSelectedPlant(plantId);
                                                setSelectedIncomer('');
                                                setIncomerList([]);
                                                setSelectedDistributer('');
                                                setSelectedSubDistributer('');
                                                GetIncomer({ plantId }, handleIncomerSuccess, handleIncomerException);
                                                getPlantDistributorFeeder({ plantId }, handleDistributorSuccess, handleDistributorException);
                                            }}
                                        >
                                            {plantList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.plantName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={8} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Incomer</InputLabel>
                                        <Select
                                            label="Select Incomer"
                                            value={selectedIncomer}
                                            disabled={!selectedPlant}
                                            onChange={(e) => setSelectedIncomer(e.target.value)}
                                        >
                                            {incomerList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.incomerName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={8} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Building Name</InputLabel>
                                        <Select
                                            label="Building Name"
                                            value={buildingName}
                                            onChange={(e) => setBuildingName(e.target.value)}
                                        >
                                            {buildingList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.buildingName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={8} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={selectedCategory}
                                            label="Category"
                                            onChange={(e) => {
                                                const catName = e.target.value;
                                                setSelectedCategory(catName);
                                                setMeterTypeName('');
                                                setEnergyMeterTypeList([]);
                                                const cat = energyCategoryList.find((c) => c.categoryName === catName);
                                                if (cat) MeterTypeByCategory(cat.id, (r) => setEnergyMeterTypeList(r?.data || []), () => {});
                                            }}
                                        >
                                            {energyCategoryList.length === 0 && (
                                                <MenuItem disabled value="">No categories — add in Configuration</MenuItem>
                                            )}
                                            {energyCategoryList.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.categoryName}>{cat.categoryName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="Display Name"
                                        type="text"
                                        value={displayName}
                                        variant="outlined"
                                        placeholder="displayName"
                                        required
                                        onBlur={() => validateForNullValue(displayName, 'address')}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        autoComplete="off"
                                        error={errorObject?.customerID?.errorStatus}
                                        helperText={errorObject?.customerID?.helperText}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Meter Type</InputLabel>
                                        <Select
                                            value={meterTypeName}
                                            label="Meter Type"
                                            onChange={(e) => {
                                                const selected = energyMeterTypeList.find((d) => d.meterType === e.target.value);
                                                setMeterTypeName(e.target.value);
                                                setMeterTypeId(selected ? selected.id : '');
                                            }}
                                            disabled={!selectedCategory}
                                        >
                                            {energyMeterTypeList.length === 0 && (
                                                <MenuItem disabled value="">Select a Category first</MenuItem>
                                            )}
                                            {energyMeterTypeList.map((data) => (
                                                <MenuItem key={data.id} value={data.meterType}>{data.meterType}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {showEnergyHierarchy && (
                                    <Grid item xs={8} sm={6} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Distributor</InputLabel>
                                            <Select
                                                label="Distributor"
                                                value={selectedDistributer}
                                                onChange={(e) => {
                                                    setSelectedDistributer(e.target.value);
                                                    setSelectedSubDistributer('');
                                                    getPlantDistributorFeeder({ plantId: selectedPlant, distributerId: e.target.value }, handleSubDistributorSuccess, handleSubDistributorException);
                                                }}
                                            >
                                                {distributerList.map((data) => (
                                                    <MenuItem key={data.id} value={data.id}>{data.distributorName}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                {showEnergyHierarchy && (
                                    <Grid item xs={8} sm={6} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Feeder/Sub Distributor</InputLabel>
                                            <Select
                                                label="Feeder/Sub Distributor"
                                                value={selectedSubDistributer}
                                                onChange={(e) => setSelectedSubDistributer(e.target.value)}
                                            >
                                                {subDistributerList.map((data) => (
                                                    <MenuItem key={data.id} value={data.id}>{data.feederName}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth margin="normal" sx={{ marginTop: 0 }}>
                                        <InputLabel>IO Model</InputLabel>
                                        <Select
                                            sx={{ minWidth: 250 }}
                                            value={deviceId}
                                            required
                                            fullWidth
                                            label="IO Model"
                                            onChange={(e) => {
                                                setDeviceId(e.target.value);
                                                getDeviceSlaveId({ deviceId: e.target.value }, handleGetSlaveSucess, handleGetSlaveException);
                                            }}
                                        >
                                            {deviceList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.edgeDeviceName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Slave Id</InputLabel>
                                        <Select
                                            value={slaveId}
                                            label="Slave Id"
                                            onChange={(e) => setSlaveId(e.target.value)}
                                            required
                                        >
                                            {machineSlaveList.map((data) => (
                                                <MenuItem key={data.slaveId} value={String(data.slaveId)}>
                                                    {data.slaveInformation ? `${data.slaveId} - ${data.slaveInformation}` : data.slaveId}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="set kW"
                                        type="text"
                                        value={valueKW}
                                        variant="outlined"
                                        placeholder="Set kW"
                                        required
                                        onBlur={() => validateForNullValue(setValueKW, 'address')}
                                        onChange={(e) => setValueKW(e.target.value)}
                                        autoComplete="off"
                                        error={errorObject?.customerID?.errorStatus}
                                        helperText={errorObject?.customerID?.helperText}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Counter Value</InputLabel>
                                        <Select
                                            value={counterValue}
                                            label="Counter Value"
                                            onChange={(e) => setCounterValue(e.target.value)}
                                        >
                                            <MenuItem value="9999">9,999 — 4-digit meter</MenuItem>
                                            <MenuItem value="99999">99,999 — 5-digit meter</MenuItem>
                                            <MenuItem value="999999">999,999 — 6-digit meter</MenuItem>
                                            <MenuItem value="9999999">9,999,999 — 7-digit meter</MenuItem>
                                            <MenuItem value="99999999">99,999,999 — 8-digit meter</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Select Line</InputLabel>
                                        <Select
                                            value={selectedLine}
                                            label="Select Line"
                                            onChange={(e) => setSelectedLine(e.target.value)}
                                            required
                                        >
                                            <MenuItem value={'1'}>L1</MenuItem>
                                            <MenuItem value={'2'}>L2</MenuItem>
                                            <MenuItem value={'3'}>L3</MenuItem>
                                            <MenuItem value={'4'}>L4</MenuItem>
                                            <MenuItem value={'none'}>None</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid container justifyContent="space-between" alignItems="center" marginTop={1.5}>
                                    <Grid item lg={3} md={3} container justifyContent="flex-start">
                                        <Typography style={{ marginLeft: '30px' }}>Display Meter</Typography>
                                    </Grid>
                                    <Grid item lg={9} md={9} container justifyContent='flex-start'>
                                        <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '0px' }}>
                                            <RadioGroup
                                                aria-label="options"
                                                name="options"
                                                value={meterDisplay}
                                                onChange={(e) => setMeterDisplay(e.target.value)}
                                                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                            >
                                                <FormControlLabel value={true} control={<Radio required />} label="Yes" />
                                                <FormControlLabel value={false} control={<Radio />} label="No" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </>
                        )}

                        {/* ===== UTILITY METER FIELDS ===== */}
                        {meterKind === 'Utility Meter' && (
                            <>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Plant</InputLabel>
                                        <Select
                                            label="Plant"
                                            value={selectedPlant}
                                            onChange={(e) => setSelectedPlant(e.target.value)}
                                        >
                                            {plantList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.plantName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Building Name</InputLabel>
                                        <Select
                                            label="Building Name"
                                            value={buildingName}
                                            onChange={(e) => setBuildingName(e.target.value)}
                                        >
                                            {buildingList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.buildingName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="Meter Name"
                                        type="text"
                                        value={displayName}
                                        variant="outlined"
                                        placeholder="Meter Name"
                                        required
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        autoComplete="off"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Category</InputLabel>
                                        <Select
                                            value={utilityCategory}
                                            label="Category"
                                            onChange={(e) => {
                                                const catName = e.target.value;
                                                setUtilityCategory(catName);
                                                setMeterTypeName('');
                                                setUtilityMeterTypeList([]);
                                                const cat = utilityCategoryList.find((c) => c.categoryName === catName);
                                                if (cat) MeterTypeByCategory(cat.id, (r) => setUtilityMeterTypeList(r?.data || []), () => {});
                                            }}
                                        >
                                            {utilityCategoryList.length === 0 && (
                                                <MenuItem disabled value="">No categories — add in Configuration</MenuItem>
                                            )}
                                            {utilityCategoryList.map((cat) => (
                                                <MenuItem key={cat.id} value={cat.categoryName}>{cat.categoryName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Meter Type</InputLabel>
                                        <Select
                                            value={meterTypeName}
                                            label="Meter Type"
                                            onChange={(e) => {
                                                const selected = utilityMeterTypeList.find((d) => d.meterType === e.target.value);
                                                setMeterTypeName(e.target.value);
                                                setMeterTypeId(selected ? selected.id : '');
                                            }}
                                            disabled={!utilityCategory}
                                        >
                                            {utilityMeterTypeList.length === 0 && (
                                                <MenuItem disabled value="">Select a Category first</MenuItem>
                                            )}
                                            {utilityMeterTypeList.map((data) => (
                                                <MenuItem key={data.id} value={data.meterType}>{data.meterType}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>IO Model</InputLabel>
                                        <Select
                                            value={deviceId}
                                            label="IO Model"
                                            onChange={(e) => {
                                                setDeviceId(e.target.value);
                                                getDeviceSlaveId({ deviceId: e.target.value }, handleGetSlaveSucess, handleGetSlaveException);
                                            }}
                                        >
                                            {deviceList.map((data) => (
                                                <MenuItem key={data.id} value={data.id}>{data.edgeDeviceName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Slave Id</InputLabel>
                                        <Select
                                            value={slaveId}
                                            label="Slave Id"
                                            onChange={(e) => setSlaveId(e.target.value)}
                                        >
                                            {machineSlaveList.map((data) => (
                                                <MenuItem key={data.slaveId} value={String(data.slaveId)}>
                                                    {data.slaveInformation ? `${data.slaveId} - ${data.slaveInformation}` : data.slaveId}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="UAM Set"
                                        type="text"
                                        value={uamSet}
                                        variant="outlined"
                                        placeholder="UAM Set"
                                        required
                                        onChange={(e) => setUamSet(e.target.value)}
                                        autoComplete="off"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="Threshold Set"
                                        type="text"
                                        value={threshold}
                                        variant="outlined"
                                        placeholder="Threshold Set"
                                        required
                                        onChange={(e) => setThreshold(e.target.value)}
                                        autoComplete="off"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="Min Limit"
                                        type="number"
                                        value={minLimit}
                                        variant="outlined"
                                        placeholder="e.g. 15 (optional — safe-range minimum)"
                                        helperText="Drives gauge coloring and alerts. Leave blank to skip."
                                        onChange={(e) => setMinLimit(e.target.value)}
                                        autoComplete="off"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <TextField
                                        label="Max Limit"
                                        type="number"
                                        value={maxLimit}
                                        variant="outlined"
                                        placeholder="e.g. 35 (optional — safe-range maximum)"
                                        helperText="Drives gauge coloring and alerts. Leave blank to skip."
                                        onChange={(e) => setMaxLimit(e.target.value)}
                                        autoComplete="off"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={6}>
                                    <Grid container justifyContent="space-between" alignItems="center">
                                        <Grid item xs={5}>
                                            <Typography>Display on Dashboard</Typography>
                                        </Grid>
                                        <Grid item xs={7}>
                                            <FormControl component="fieldset" sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                                                <RadioGroup
                                                    row
                                                    aria-label="displayMeter"
                                                    name="displayMeterUtility"
                                                    value={meterDisplay}
                                                    onChange={(e) => setMeterDisplay(e.target.value)}
                                                    sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}
                                                >
                                                    <FormControlLabel value={true} control={<Radio required />} label="Yes" />
                                                    <FormControlLabel value={false} control={<Radio />} label="No" />
                                                </RadioGroup>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6} sm={6} md={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Counter Value</InputLabel>
                                        <Select
                                            value={counterValue}
                                            label="Counter Value"
                                            onChange={(e) => setCounterValue(e.target.value)}
                                        >
                                            <MenuItem value="9999">9,999 — 4-digit meter</MenuItem>
                                            <MenuItem value="99999">99,999 — 5-digit meter</MenuItem>
                                            <MenuItem value="999999">999,999 — 6-digit meter</MenuItem>
                                            <MenuItem value="9999999">9,999,999 — 7-digit meter</MenuItem>
                                            <MenuItem value="99999999">99,999,999 — 8-digit meter</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" style={{ background: '#0e2d5d', color: '#f5f5fc' }}>
                        {isAddButton ? 'Add' : 'Update'}
                    </Button>
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
        </Dialog>
    );
}

export default MeterAllocationModal;
