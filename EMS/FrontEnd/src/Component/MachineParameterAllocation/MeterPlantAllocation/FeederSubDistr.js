import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import {
    DistributerShowDataFiltered,
    FeederAdd,
    FeederDelete,
    FeederShowDataFiltered,
    FeederUpdate,
    IncomerPlantShowdata,
} from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../Utility/NotificationBar';

const FeederSubDistr = ({ meterData }) => {
    const [incomer, setIncomer] = useState('');
    const [incomerList, setIncomerList] = useState([]);
    const [distributer, setDistributer] = useState('');
    const [distributerList, setDistributerList] = useState([]);
    const [editFeeder, setEditFeeder] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [feederName, setFeederName] = useState('');
    const [feederDescription, setFeederDescription] = useState('');
    const [rows, setRows] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    // Load incomer list once on mount
    useEffect(() => {
        IncomerPlantShowdata({ id: meterData?.id }, handleIncomerShow, handleIncomerShowException);
    }, [meterData?.id]);

    const handleIncomerShow = (dataObject) => {
        setIncomerList(dataObject?.data || []);
    };
    const handleIncomerShowException = (error, errorMessage) => {
        console.log(errorMessage);
    };

    // Load distributor list when incomer changes
    useEffect(() => {
        if (incomer) {
            DistributerShowDataFiltered(
                { plantId: meterData?.id, incomerId: incomer },
                handleDistributerShow,
                handleDistributerShowException
            );
        } else {
            setDistributerList([]);
            setDistributer('');
        }
    }, [incomer, meterData?.id]);

    const handleDistributerShow = (dataObject) => {
        setDistributerList(dataObject?.data || []);
    };
    const handleDistributerShowException = (error, errorMessage) => {
        console.log(errorMessage);
    };

    // Load feeder grid when distributor changes or after CRUD
    useEffect(() => {
        if (incomer && distributer) {
            setGridLoading(true);
            FeederShowDataFiltered(
                { plantId: meterData?.id, incomerId: incomer, distributorId: distributer },
                handleFeederShowData,
                handleFeederShowDataException
            );
        } else {
            setRows([]);
        }
    }, [refreshData, incomer, distributer, meterData?.id]);

    const handleFeederShowData = (dataObject) => {
        setRows(dataObject?.data || []);
        setGridLoading(false);
    };
    const handleFeederShowDataException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
        setGridLoading(false);
    };

    const onIncomerChange = (e) => {
        setIncomer(e.target.value);
        setDistributer('');
        setRows([]);
    };

    const onDistributerChange = (e) => {
        setDistributer(e.target.value);
    };

    const columns = [
        {
            field: 'feederName',
            headerName: 'Feeder Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerName: 'Feeder Description',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function DeleteData(props) {
        return (
            <DeleteIcon
                onClick={() => {
                    setDeleteId(props.selectedRow.id);
                    setDeleteDialogOpen(true);
                }}
            />
        );
    }

    function EditData(props) {
        return (
            <EditIcon
                onClick={() => {
                    const row = props.selectedRow;
                    // incomer + distributer are already set from the user's filter selection
                    // (feeder rows are only visible after both are chosen — no need to touch them)
                    setIsAddButton(false);
                    setEditFeeder(row);
                    setFeederName(row.feederName);
                    setFeederDescription(row.description);
                }}
            />
        );
    }

    const AddFeeder = () => {
        if (isAddButton) {
            FeederAdd({
                plantId: meterData?.id,
                incomerId: incomer,
                distributerId: distributer,
                feederName: feederName,
                description: feederDescription,
            }, handleSuccess, handleException);
        } else {
            FeederUpdate({
                id: editFeeder.id,
                plantId: meterData?.id,
                incomerId: incomer,
                distributerId: distributer,
                feederName: feederName,
                description: feederDescription,
            }, handleSuccess, handleException);
        }
    };

    const handleSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setTimeout(() => {
            setRefreshData(oldValue => !oldValue);
            resetForm();
        }, 2000);
    };

    const handleException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage });
    };

    const DeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message });
        setTimeout(() => {
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
        }, 2000);
    };

    const DeleteException = () => {};

    const handleClose = () => {
        setNotification({ status: false, type: '', message: '' });
    };

    // Resets form fields only — keeps incomer + distributer so grid stays filtered
    const resetForm = () => {
        setEditFeeder('');
        setFeederName('');
        setFeederDescription('');
        setIsAddButton(true);
    };

    // Full clear — resets everything including dropdowns
    const handleClear = () => {
        resetForm();
        setIncomer('');
        setDistributer('');
        setDistributerList([]);
        setRows([]);
    };

    return (
        <div style={{ height: '100%', width: '100%', padding: '20px' }}>
            <form>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="incomer-select-label">Incomer</InputLabel>
                            <Select
                                labelId="incomer-select-label"
                                id="incomer-select"
                                label="Incomer"
                                value={incomer}
                                required
                                onChange={onIncomerChange}
                            >
                                {incomerList?.map((data, index) => (
                                    <MenuItem value={data.id} key={index}>
                                        {data.incomerName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel id="distributer-select-label">Distributer</InputLabel>
                            <Select
                                labelId="distributer-select-label"
                                id="distributer-select"
                                label="Distributer"
                                value={distributer}
                                required
                                onChange={onDistributerChange}
                            >
                                {distributerList?.map((data, index) => (
                                    <MenuItem value={data.id} key={index}>
                                        {data.distributorName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            value={feederName}
                            margin="dense"
                            label="Feeder Name"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setFeederName(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            value={feederDescription}
                            margin="dense"
                            label="Feeder Description"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => setFeederDescription(e.target.value)}
                            autoComplete="off"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} container justifyContent="flex-end" flexDirection="row">
                        <Button size="large" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button size="large" onClick={AddFeeder}>
                            {isAddButton ? 'Add' : 'Update'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
            <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    loading={isLoading}
                    disableSelectionOnClick
                    style={{ backgroundColor: '#FFFFFF' }}
                />
            </div>
            <DeleteConfirmationDailog
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                deleteId={deleteId}
                deleteService={FeederDelete}
                handleSuccess={DeleteSuccess}
                handleException={DeleteException}
            />
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </div>
    );
};

export default FeederSubDistr;
