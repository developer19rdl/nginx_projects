import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Button, Grid, TextField } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
// import { LoactionShow, LocationAdd, LocationUpdate } from '../../Services/LocationService';
import { LoactionShow, LocationAdd, LocationDelete, LocationUpdate } from '../../Services/NodeJsApiServices';
import LocationMapPicker from './LocationMapPicker';



const AddRegionLocation = ({ editData }) => {

    const [locationList, setLocationList] = useState([]);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [loctionAdd, setLoctionAdd] = useState(true);
    const [editeLocation, setEditLocation] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [id, setId] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const columns = [
        {
            field: 'locationName',
            headerName: 'LOCATION',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'description',
            headerName: 'DESCRIPTION',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'latitude',
            headerName: 'LATITUDE',
            type: 'number',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'longitude',
            headerName: 'LONGITUDE',
            type: 'number',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerClassName: 'super-app-theme--header',
            width: 100,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,

            ],
        },
    ];

    const rows = [
        {
            id: 1,
            locationName: "Location A",
            description: "Main Office Area",
        },
        {
            id: 2,
            locationName: "Location B",
            description: "Warehouse Section",
        },
        {
            id: 3,
            locationName: "Location C",
            description: "Production Floor",
        },
        {
            id: 4,
            locationName: "Location D",
            description: "R&D Lab",
        },
        {
            id: 5,
            locationName: "Location E",
            description: "Parking Zone",
        },
        {
            id: 6,
            locationName: "Location F",
            description: "Reception Lobby",
        },
        {
            id: 7,
            locationName: "Location G",
            description: "Conference Hall",
        },
        {
            id: 8,
            locationName: "Location H",
            description: "Server Room",
        },
        {
            id: 9,
            locationName: "Location I",
            description: "Cafeteria",
        },
        {
            id: 10,
            locationName: "Location J",
            description: "Training Center",
        },
    ];

    useEffect(() => {
        setGridLoading(true);

        LoactionShow({ regionId: editData?.id }, handlelocationShowSucess, handlelocationShowException);

        setLocation(editeLocation?.locationName || '');
        setDescription(editeLocation?.description || '');
        setLatitude(editeLocation?.latitude ? Number(editeLocation.latitude) : null);
        setLongitude(editeLocation?.longitude ? Number(editeLocation.longitude) : null);

    }, [refreshData, editData, editeLocation]);

    const ClearData = () => {
        setLocation('');
        setEditLocation(true);
        setDescription('');
        setLatitude(null);
        setLongitude(null);
        setLoctionAdd(true);
    }

    const handleMapPick = (lat, lng) => {
        setLatitude(Number(lat.toFixed(6)));
        setLongitude(Number(lng.toFixed(6)));
    }

    const handlelocationShowSucess = (dataObject) => {
        setLocationList(dataObject?.data || []);
        setGridLoading(false);
    }

    const handlelocationShowException = (errorObject, errorMessage) => {

    }


    function EditData(props) {
        return (
            <EditIcon

                onClick={(event) => {
                    event.stopPropagation();
                    setLoctionAdd(false);
                    setEditLocation(props.selectedRow);

                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                onClick={() => {
                    setId(props.selectedRow.id);
                    setConfirmOpen(true);
                }}

            />
        );
    }
    const onDeleteSelet = () => {
        // LocationDelete({ id }, DeleteSuccess, DeleteException);
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
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const AddLocatoinRegion = () => {
        if (loctionAdd === true) {

            LocationAdd({
                regionId: editData?.id,
                locationName: location,
                description: description,
                latitude: latitude,
                longitude: longitude,

            }, handleLocationAddSucess, handleLocationAddException);
        } else {
            LocationUpdate({
                id: editeLocation?.id,
                regionId: editData?.id,
                locationName: location,
                description: description,
                latitude: latitude,
                longitude: longitude,

            }, handleLocationAddSucess, handleLocationAddException);
        }

    }

    const handleLocationAddSucess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setRefreshData(oldValue => !oldValue);
        ClearData();

        setTimeout(() => {
            handleClose();


        }, 2000);
    }

    const handleLocationAddException = (errorObject, errorMessage) => {

        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }
    return (
        <div style={{ height: '70%', width: '100%' }}>
            <form >

                <Grid container spacing={1} style={{ marginTop: '5px' }}>

                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Location"
                            size='small'
                            variant="outlined"
                            value={location}
                            onChange={(e) => {
                                const newText = e.target.value.toUpperCase();
                                setLocation(newText);
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Description"
                            variant="outlined"
                            size='small'
                            value={description}
                            onChange={(e) => {
                                const newText = e.target.value.toUpperCase();
                                setDescription(newText);
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}
                        style={{ display: 'flex', justifyContent: 'flex-start' }} >
                        <Button size='small'
                            onClick={AddLocatoinRegion} style={{ background: '#e6e3da', color: 'black' }}>
                            {
                                loctionAdd ? 'Add' : 'Update'
                            }
                        </Button>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Latitude"
                            size='small'
                            variant="outlined"
                            value={latitude ?? ''}
                            InputProps={{ readOnly: true }}
                            helperText="Click on the map to set"
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Longitude"
                            size='small'
                            variant="outlined"
                            value={longitude ?? ''}
                            InputProps={{ readOnly: true }}
                            helperText="Click on the map to set"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <LocationMapPicker latitude={latitude} longitude={longitude} onPick={handleMapPick} />
                    </Grid>

                </Grid>
            </form>
            {/* <Grid style={{ marginTop: '10px' }}> */}
            <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                    style={{ border: 'none', color: 'black' }}
                    rows={locationList}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    sx={{
                        height: '90%',
                        minHeight: '410px',

                        width: '100%',
                        '& .super-app-theme--header': {
                            WebkitTextStrokeWidth: '0.6px',

                        },
                    }}
                />
            </div>

            {/* </Grid> */}
            <DeleteConfirmationDailog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                deleteId={id}
                deleteService={LocationDelete}
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
    )
}

export default AddRegionLocation