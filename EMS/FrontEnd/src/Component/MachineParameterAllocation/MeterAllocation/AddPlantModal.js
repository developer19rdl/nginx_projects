import React, { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogContent, DialogTitle, TextField,
    Grid, DialogActions, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { MeterAddService, MeterEditService, FetchMeterService, FetchCompanyService, FetchDeviceListService } from '../../../Services/LoginPageService.js'
import { AddCustomerValidate } from '../../../Pages/validation/formValidation.js'
import NotificationBar from '../../../Component/Notification/NotificationBar.js'
import { EdgeDevicename, MeterAllocationAdd, MeterAllocationViewedit, MeterPlantAdd, MeterPlantEdit, MeterPlantShow, allocMachinesList, getDeviceSlaveId, MeterPlantDelete } from '../../../Services/NodeJsApiServices.js';
import { DataGrid } from '@mui/x-data-grid';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';

function AddPlantModal({ setPlantModalOpen, plantModalOpen, setPageRefresher }) {
    const [id, setId] = useState('');
    const [plantList, setPlantList] = useState('')
    const [plantName, setPlantName] = useState('')
    const [isEdit, setIsEdit] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');

    const [refresher, setRefresher] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const columns = [
        {
            field: 'sNo',
            headerName: 'SNo',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'plantName',
            headerName: 'Plant Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />, <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function EditData(props) {
        return (
            <EditIcon
                style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    setId(props.selectedRow.id);
                    setPlantName(props.selectedRow.plantName);
                    setIsEdit(true);
                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                onClick={() => {
                    setDeleteId(props.selectedRow.id);
                    setDeleteDailogOpen(true);
                }}
                style={{ cursor: 'pointer' }}
            />
        );
    }

    useEffect(() => {
        plantModalOpen && MeterPlantShow(handleMeterShowSuccess, handleMeterShowException)
    }, [refresher, plantModalOpen, refresher])

    const handleMeterShowSuccess = (dataObject) => {
        const updatedData = dataObject.data.map((plant, index) => ({ ...plant, sNo: index + 1 }))
        setPlantList(updatedData)
    }
    const handleMeterShowException = () => { }

    useEffect(() => {
        if (plantName === '') {
            setId('');
            setPlantName('');
            setIsEdit(false);
        }
    }, [plantName])

    const clearData = () => {
        setPlantName('')
        setId('');
        setPlantName('');
        setIsEdit(false);
        setDeleteId('');
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        !isEdit ?
            MeterPlantAdd({ plantName: plantName }, handlePlantSuccess, handlePlantException)
            :
            MeterPlantEdit({ id: id, plantName: plantName }, handlePlantSuccess, handlePlantException)
    }

    const handlePlantSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setTimeout(() => {
            handleClose();
            setRefresher((oldvalue) => !oldvalue);
            setPageRefresher((oldvalue) => !oldvalue);
            setPlantName('');
        }, 3000);
    };

    const handlePlantException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            // handleClose();
        }, 3000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefresher((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setDeleteDailogOpen(false);
        }, 3000);
    };
    const handleDeleteException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            // handleClose();
        }, 3000);
    };

    return (
        <Dialog open={plantModalOpen}>
            <DialogTitle >Add Plant</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>

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
                            <DataGrid
                                rows={plantList}
                                columns={columns}
                                pageSize={5}
                                // loading={isLoading}
                                rowsPerPageOptions={[5]}
                                disableSelectionOnClick
                                style={{ backgroundColor: '#ffffff', height: '300px' }}
                            />
                        </Grid>

                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" style={{ background: '#0e2d5d', color: '#f5f5fc' }}>{!isEdit ? 'Add' : 'Update'}</Button>
                    <Button style={{ background: '#0e2d5d', color: '#f5f5fc' }} onClick={() => {
                        setPlantModalOpen(false);
                        // setErrorObject({});
                        // loadData();
                        clearData();
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

            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={MeterPlantDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </Dialog>
    );
}

export default AddPlantModal;
