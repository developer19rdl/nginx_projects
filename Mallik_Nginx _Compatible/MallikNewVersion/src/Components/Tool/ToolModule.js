import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, InputAdornment,
    CircularProgress,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { Card } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { CheckBox } from '@mui/icons-material';
import SearchIcon from "@mui/icons-material/Search";
import Autocomplete from '@mui/material/Autocomplete';
import { AddToolList, EditShowToolList, FIMIDDataShow, GetProcessmachineList, GetUOM, HSNCodeDataShow, ItemAdd, ItemGroupShowMaster, ItemUpdate, MainLocationDataShow, NewGenerateTool, ProductFamilyDataShow, ProductFinishDataShow, RMItemcodeDataShow, SobAdd, SobUpdate, SubLocationDataShow, UOMShowMaster, UnderLedgerDataShow, GetToolProcessList } from '../../ApiService/LoginPageService';



const ToolModule = ({ open, setOpen, isAddButton, editData, setRefreshData, }) => {
    const [toolUsageLife, setToolUsageLife] = useState('');
    const [toolNo, setToolno] = useState('');
    const [msd, setMsd] = useState('');
    const [grindingSupport, setGrindingSupport] = useState('');
    const [grindingalert, setGrindingAlert] = useState('');
    const [grindingtoolLife, setGrindingToolLife] = useState('');
    const [selectedUOM, setSelectedUOM] = useState('');
    const [replaceCount, setReplaceCount] = useState('');
    const [openingCount, setOpeningCount] = useState('');
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [selectedMappingIds, setSelectedMappingIds] = useState([]);
    const [processList, setProcessList] = useState([]);
    const [uomList, setUOMList] = useState([]);
    const [toolview, setTollView] = useState(false)
    const [toolName, setToolName] = useState('');
    const [toolCost, setToolCost] = useState('');
    const [loading, setLoading] = useState(false);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        LoadingData();
        if (open) {
            GetUOM(handleUOMSucessShow, handleUOMExceptionShow);
            GetProcessmachineList(handleProcessMachineshow, handleProcessExceptionShow);
        }

    }, [editData, open]);

    const handleUOMSucessShow = (dataObject) => {
        setUOMList(dataObject?.data || []);
    }
    const handleUOMExceptionShow = (errorObject, errorMessage) => {
    }
    const handleProcessMachineshow = (dataObject) => {
        const fetchedList = dataObject?.data || [];
        setProcessList(fetchedList);

        // 🧩 Once process list is loaded, map editData values
        if (editData && fetchedList.length > 0) {
            if (!isAddButton && editData.id) {
                GetToolProcessList(editData.id, (res) => {
                    const mappedData = res?.data || [];
                    const matchedIds = [];
                    let machId = '';

                    mappedData.forEach(m => {
                        if (m.machineId) machId = m.machineId;
                        const match = fetchedList.find(item => item.machineId === m.machineId && item.processId === m.processId);
                        if (match) {
                            matchedIds.push(match.id);
                        }
                    });

                    if (matchedIds.length > 0) {
                        setSelectedMappingIds(matchedIds);
                        if (machId) {
                            setSelectedMachineId(machId);
                        }
                    } else {
                        runLocalFallback(fetchedList);
                    }
                }, (err) => {
                    console.error("Failed to fetch tool process list", err);
                    runLocalFallback(fetchedList);
                });
            } else {
                runLocalFallback(fetchedList);
            }
        }
    }

    const runLocalFallback = (fetchedList) => {
        let matchedIds = [];

        // 1. If we have editData.processList (array of IDs or objects)
        if (Array.isArray(editData.processList)) {
            const processIds = editData.processList.map(p => typeof p === 'object' ? p.processId || p.id : p);
            matchedIds = fetchedList
                .filter(item => item.machineId === editData.machineId && processIds.includes(item.processId))
                .map(item => item.id);
        }
        // 2. If we have editData.processId or editData.processIds
        else if (editData.processId) {
            const pId = Number(editData.processId);
            matchedIds = fetchedList
                .filter(item => item.machineId === editData.machineId && item.processId === pId)
                .map(item => item.id);
        }
        // 3. Fallback to process name if no IDs are available
        else if (editData.process) {
            const processNames = typeof editData.process === 'string'
                ? editData.process.split(',').map(s => s.trim())
                : [];
            matchedIds = fetchedList
                .filter(item => {
                    const matchesMachine = editData.machineId ? item.machineId === editData.machineId : true;
                    return matchesMachine && processNames.includes(item.process);
                })
                .map(item => item.id);
        }

        if (matchedIds.length > 0) {
            setSelectedMappingIds(matchedIds);
            const firstMapping = fetchedList.find(p => p.id === matchedIds[0]);
            if (firstMapping) {
                setSelectedMachineId(firstMapping.machineId);
            }
        } else if (editData.machineId) {
            setSelectedMachineId(editData.machineId);
        }
    }

    const handleProcessExceptionShow = (errorObject, errorMessage) => {
    }
    const LoadingData = () => {
        setToolno(editData?.toolNo || '');
        setToolUsageLife(editData?.toolUsageLife || '');
        setSelectedUOM(editData?.uom || '');
        setGrindingSupport(editData?.grindingSupportId || '');
        setGrindingAlert(editData?.grindingAlert || '');
        setGrindingToolLife(editData?.afterGrindingToolLife || '');
        setReplaceCount(editData?.replacementCount || '');
        setOpeningCount(editData?.openingCount || '');
        setToolName(editData?.toolName || '');
        setToolCost(editData?.toolCost || '');

        setSelectedMachineId(editData?.machineId || '');
        setSelectedMappingIds([]);
    }

    const ClearData = () => {
        setToolno('');
        setSelectedMachineId('');
        setSelectedMappingIds([]);
        setToolName('');
        setToolCost('');
        setSelectedUOM('');
        setGrindingSupport('');
        setGrindingAlert('');
        setReplaceCount('');
        setOpeningCount('');
    }

    const handleMappingChange = (event) => {
        const value = event.target.value;
        setSelectedMappingIds(value);

        if (value.length > 0) {
            const firstMapping = processList.find(p => p.id === value[0]);
            if (firstMapping) {
                setSelectedMachineId(firstMapping.machineId);
            }
        } else {
            setSelectedMachineId('');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTollView(true);

        const selectedMappings = processList.filter(item => selectedMappingIds.includes(item.id));
        const machineId = selectedMappings.length > 0 ? selectedMappings[0].machineId : selectedMachineId;
        const processListIds = selectedMappings.map(item => item.processId);

        if (isAddButton) {
            AddToolList({
                machineId: machineId,
                processList: processListIds,
                toolNo: toolNo,
                uomId: selectedUOM,
                status: 'submit',
                grindingSupportId: grindingSupport,
                ...(grindingSupport === 'YES' && {
                    grindingAlert: grindingalert,
                }),
                replacementCount: replaceCount,
                openingCount: openingCount,
                toolName: toolName,
                toolCost: toolCost
            }, handleSobAddSuccess, handleSobAddException);
        } else {
            EditShowToolList({
                id: editData?.id,
                machineId: machineId,
                processList: processListIds,
                toolNo: toolNo,
                uomId: selectedUOM,
                grindingSupportId: grindingSupport,
                ...(grindingSupport === 'YES' && {
                    grindingAlert: grindingalert,
                }),
                replacementCount: replaceCount,
                openingCount: openingCount,
                toolName: toolName,
                toolCost: toolCost
            }, handleSobupdateSuccess, handleSobupdateException);
        }

    }

    const handleSobAddSuccess = (dataObject) => {
        setTollView(false);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            ClearData();
            setOpen(false);

        }, 3000);
    }

    // const handleSobAddException = () => {
    //     ClearData();
    //     setTollView(false);

    // }
    const handleSobAddException = (errorObject, error) => {
        console.log("the error ", error);
        ClearData();
        setTollView(false);
        setNotification({
            status: true,
            type: 'error',
            message: errorObject.error,
        });
        setTimeout(() => {
            // handleClose();
            setLoading(false);
        }, 2000);
    };
    const handleSobupdateSuccess = (dataObject) => {
        setTollView(false);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            ClearData();
            setOpen(false);

        }, 3000);
    }

    const handleSobupdateException = () => {
        ClearData();
        setTollView(false);

    }
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleGenerateToolSuccess = (dataObject) => {
        // setToolno(dataObject?.tool || '')
    };

    const handleGenerateToolException = () => {

    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '100%', maxHeight: '100%' } }}
            maxWidth="lg"
            open={open}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {isAddButton ? 'Add Tool' : 'Edit Tool'}

            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent >
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <FormControl fullWidth variant="filled" size="small">
                                <InputLabel id="process-select-label">Process</InputLabel>
                                <Select
                                    labelId="process-select-label"
                                    id="process-select"
                                    multiple
                                    label="Process"
                                    required
                                    value={selectedMappingIds}
                                    onChange={handleMappingChange}
                                    renderValue={(selected) => {
                                        return selected
                                            .map(id => {
                                                const proc = processList.find(p => p.id === id);
                                                return proc ? `${proc.machineName} - ${proc.process}` : id;
                                            })
                                            .join(', ');
                                    }}
                                >
                                    {processList.map((data) => {
                                        const activeMachineId = selectedMappingIds.length > 0
                                            ? processList.find(p => p.id === selectedMappingIds[0])?.machineId
                                            : null;
                                        const isDisabled = activeMachineId && data.machineId !== activeMachineId;

                                        return (
                                            <MenuItem key={data.id} value={data.id} disabled={isDisabled}>
                                                <Checkbox checked={selectedMappingIds.indexOf(data.id) > -1} />
                                                {data.machineName} - {data.process}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>

                            <TextField
                                id="filled-basic"
                                label="Tool No"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size="small"
                                fullWidth
                                required
                                value={toolNo}
                                placeholder="Tool No"
                                onChange={(e) => {
                                    // const newValue = e.target.value;
                                    // const oldParts = toolNo.split("/");
                                    // const prefix = oldParts.slice(0, -1).join("/"); // fixed part
                                    // let suffix = newValue.split("/").pop();         // user input for last part

                                    // // ✅ Allow only numbers in suffix
                                    // if (/^\d*$/.test(suffix)) {
                                    //     setToolno(`${prefix}/${suffix}`);
                                    // }
                                    setToolno(e.target.value);
                                }}
                            />



                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                id="filled-basic"
                                label="Tool Name"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size='small'
                                fullWidth
                                required
                                value={toolName}
                                placeholder="Tool Name"
                                onChange={(e) => {
                                    setToolName(e.target.value);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                id="filled-basic"
                                label="Tool Cost"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size='small'
                                fullWidth
                                required
                                value={toolCost}
                                placeholder="Tool Cost"
                                onChange={(e) => {
                                    setToolCost(e.target.value);
                                }}
                            />
                        </Grid>
                        {/* <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                id="filled-basic"
                                label="Max Tool Usage | Life"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size='small'
                                fullWidth
                                required
                                value={toolUsageLife}
                                placeholder="Max Tool Usage | Life"
                                onChange={(e) => {
                                    setToolUsageLife(e.target.value);
                                }}
                            />
                        </Grid> */}
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">UOM</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    variant="filled"
                                    label='UOM'
                                    size='small'
                                    required
                                    value={selectedUOM}
                                    onChange={(e) => setSelectedUOM(e.target.value)}
                                >
                                    {uomList.map((data) => (
                                        <MenuItem key={data.id} value={data.id}>{data.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Grinding Supportd</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    variant="filled"
                                    label='Grinding Support'
                                    size='small'
                                    required
                                    value={grindingSupport}
                                    onChange={(e) => setGrindingSupport(e.target.value)}
                                >
                                    <MenuItem value='YES'>YES</MenuItem>
                                    <MenuItem value='NO'>NO</MenuItem>

                                </Select>
                            </FormControl>
                        </Grid>

                        {grindingSupport === 'YES' && (
                            <> <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                                <TextField
                                    id="filled-basic"
                                    label="Grinding Alert"
                                    variant="filled"
                                    sx={{ mb: 1 }}
                                    size='small'
                                    fullWidth
                                    required
                                    value={grindingalert}
                                    placeholder="Grinding Alert"
                                    onChange={(e) => {
                                        setGrindingAlert(e.target.value);
                                    }}
                                />
                            </Grid>
                                {/* <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>

                                    <TextField
                                        id="filled-basic"
                                        label="   After Grinding Tool Life"
                                        variant="filled"
                                        sx={{ mb: 1 }}
                                        size='small'
                                        fullWidth
                                        required
                                        value={grindingtoolLife}
                                        placeholder="   After Grinding Tool Life"
                                        onChange={(e) => {
                                            setGrindingToolLife(e.target.value);
                                        }}
                                    />
                                </Grid> */}
                            </>)}
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
                            <TextField
                                id="filled-basic"
                                label="Tool Replacement Count"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size='small'
                                fullWidth
                                required
                                value={replaceCount}
                                placeholder="Tool Replacement Count"
                                onChange={(e) => {
                                    setReplaceCount(e.target.value);
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>

                            <TextField
                                id="filled-basic"
                                label="Opening Count"
                                variant="filled"
                                sx={{ mb: 1 }}
                                size='small'
                                fullWidth
                                required
                                value={openingCount}
                                placeholder="Opening Count"
                                onChange={(e) => {
                                    setOpeningCount(e.target.value);
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        type="submit"
                        disabled={toolview}
                    >
                        {/* {isAddButton ? 'Add' : 'Update'} */}
                        {toolview ? (
                            <CircularProgress size={24} style={{ color: 'white' }} />
                        ) : (
                            isAddButton ? 'Add' : 'Update'
                        )}
                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={(e) => {
                            setOpen(false);

                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
                <NotificationBar
                    handleClose={handleClose}
                    notificationContent={openNotification.message}
                    openNotification={openNotification.status}
                    type={openNotification.type}
                />

            </form>
        </Dialog>
    )
}

export default ToolModule
