
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DistributerAdd, DistributerDelete, DistributerShowDataFiltered, DistributerUpdate, IncomerPlantShowdata } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../Utility/NotificationBar';
const DistruibutorsModel = ({ meterData, onChange }) => {
  
    const [incomer, setIncomer] = useState('');
    const [plantList, setPlantList] = useState([]);
    const [plantId, setPlantId] = useState(''); 
    const [incomerList, setIncomerList] = useState([]);
    const [distributer, setDistributer] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editDistributer, setEditDistributer] = useState('');
    const [distributerDescription, setDistributerDescription] = useState('');
    const [rows, setRows] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    console.log("12344.,", meterData)
    useEffect(() => {
        IncomerPlantShowdata({ id: meterData?.id, }, handlePlantIncomershow, handlePlantIncomershowException);
    }, [editDistributer]);

    const handlePlantIncomershow = (dataObject) => {
        console.log("Full Response: ", dataObject); // Log the entire response

        const plantData = dataObject?.data || [];
        console.log("Plant Data: ", plantData);
        setIncomerList(plantData);
    };
    // const handlePlantIncomershowException=(error,errorMessage)=>{
    const handlePlantIncomershowException = (error, errorMessage) => {
        console.error("Error: ", error); // Log the error
        console.log("Error Message: ", errorMessage); // Log the error message
    };
    const onIncomerChange = (e) => {
        setIncomer(e.target.value);
    };
    const AddDistributer = () => {
        if (isAddButton === true) {
            DistributerAdd({
                plantId: meterData?.id,
                distributorName: distributer,
                incomerId: incomer,
                description: distributerDescription,
            }, handleSuccess, handleException)
        } else {
            DistributerUpdate({
                id: editDistributer.id,
                incomerId: incomer,
                plantId: meterData?.id,
                distributorName: distributer,
                description: distributerDescription,
            }, handleSuccess, handleException)
        }
        if (onChange) {
            onChange(plantId, distributer);
        }
    }
    const handleSuccess = (dataObject) => {
        console.log(dataObject);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            setRefreshData(oldValue => !oldValue);
            resetForm();
        }, 2000);
    }
    const handleException = (errorObject, errorMessage) => {
        console.log(errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            setRefreshData(oldValue => !oldValue);
        }, 2000);
    }
    useEffect(() => {
        if (incomer) {
            setGridLoading(true);
            DistributerShowDataFiltered(
                { plantId: meterData?.id, incomerId: incomer },
                handleDistributerShow,
                handleDistributerShowException
            );
        } else {
            setRows([]);
        }
    }, [refreshData, incomer, meterData?.id]);
    const handleDistributerShow = (dataObject) => {
        setRows(dataObject.data);
        setGridLoading(false);
    };
    const handleDistributerShowException = (errorStatus, errorMessage) => {
        console.log(errorMessage);
        setGridLoading(false);
    };
    const columns = [
        {
            field: 'distributorName',
            headerName: 'Distributer Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerName: 'Description',
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
        )
    }
    function EditData(props) {
        return (
            <EditIcon
                onClick={(event) => {
                    setIsAddButton(false);
                    setEditDistributer(props.selectedRow);
                    setPlantId(props.selectedRow.plantId);
                    setIncomer(props.selectedRow.incomerId);
                    setDistributer(props.selectedRow.distributorName);
                    setDistributerDescription(props.selectedRow.description);
                }}
            />
        )
    }
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };
    const onDeleteSelet = () => {
        DistributerDelete(DeleteSuccess, DeleteException);
    }
    const DeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject?.message,
        });
        setTimeout(() => {
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
        }, 2000);
    }
    const DeleteException = () => {
    }

    const resetForm = () => {
        setPlantId("");
        setDistributer("");
        setDistributerDescription("");
        setIsAddButton(true);
    }

    const ClearDistributer = () => {
        resetForm();
        setIncomer("");
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <form >
                <Grid container>
                    <Grid xs={8} sm={12} md={12}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-label">Incomer</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                label="Incomer"
                                placeholder='Incomer'
                                value={incomer}
                                required
                                onChange={(e) => onIncomerChange(e)}
                            >
                                {incomerList?.map((data, index) => {
                                    console.log("Data: ", data);
                                    return (
                                        <MenuItem value={data.id} key={index}>
                                            {data.incomerName}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            value={distributer}
                            margin="dense"
                            id="outlined-basic"
                            label="Distributer"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => { setDistributer(e.target.value); }}
                            autoComplete="off"
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            value={distributerDescription}
                            margin="dense"
                            id="outlined-basic"
                            label="Distributer Description"
                            variant="outlined"
                            fullWidth
                            onChange={(e) => { setDistributerDescription(e.target.value); }}
                            autoComplete="off"
                            required
                        />
                    </Grid>
                    {}
                    <Grid item xs={12} container justifyContent="flex-end" flexDirection="row">
                        <Button
                            size="large"
                            type="submit"
                            onClick={ClearDistributer}
                        >
                            Clear
                        </Button>

                        <Button
                            size="large"
                            type="submit"
                            onClick={AddDistributer}
                        >
                            {' '}
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
                    disableSelectionOnClick
                    style={{ backgroundColor: '#FFFFFF' }}
                />
                <DeleteConfirmationDailog
                    open={deleteDialogOpen}
                    setOpen={setDeleteDialogOpen}
                    deleteId={deleteId}
                    deleteService={DistributerDelete}
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
        </div>
    )
}
export default DistruibutorsModel
