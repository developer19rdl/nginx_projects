import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
// import { AreaAdd, AreaUpdate } from '../../Services/NodeJsApiServices';
import { AreaAdd, AreaAddShow, AreaDelete, AreaUpdate, AreShowList, LoactionShow, RegionShow } from '../../Services/NodeJsApiServices';

const AddfloorArea = ({ locfloorOpen, setLoFloorOpen, isAddButton, editData, }) => {

    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [locationList, setLocationList] = useState([]);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');
    const [areaData, setAreaData] = useState(true);
    const [areaLoactionShowList, setAreaLoactionShowList] = useState([]);
    const [editArea, setEditArea] = useState([]);
    const [id, setId] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);

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
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'areaName',
            headerName: 'AREA',
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
            field: 'actions',
            type: 'actions',
            headerName: 'ACTIONS',
            headerClassName: 'super-app-theme--header',
            // width: 100,
            flex: 1,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,

            ],
        },
    ];



    useEffect(() => {
        setGridLoading(true);
        LoactionShow({ regionId: editData?.id }, handleloactionShowSucess, handleloactionShowException);
        AreShowList({ regionId: editData?.id }, handleAreaShowListSuccess, handleAreaShowListException);

        setLocation(editArea?.locationId || '');   // or editArea?.location?.id if nested
        setArea(editArea?.areaName || '');
        setDescription(editArea?.description || '');
    }, [refreshData, editArea]);

    const handleloactionShowSucess = (dataObject) => {
        console.log('dataObject', dataObject.data)
        setLocationList(dataObject?.data || []);
        setGridLoading(false);
    }


    const handleloactionShowException = (errorObject, errorMessage) => {

    }
    const handleAreaShowListSuccess = (dataObject) => {
        console.log('dataObject', dataObject.data)
        setAreaLoactionShowList(dataObject?.data || []);
        setGridLoading(false);
    }


    const handleAreaShowListException = (errorObject, errorMessage) => {

    }

    function EditData(props) {
        return (
            <EditIcon

                onClick={(event) => {
                    event.stopPropagation();
                    setAreaData(false);
                    setEditArea(props.selectedRow);

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

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const AddAreaData = (e) => {
        e.preventDefault();
        if (areaData === true) {
            AreaAdd({
                regionId: editData.id,
                locationId: location,
                areaName: area,
                description: description,

            }, handleAddAdreaSuccess, handleAddAreaException);
        } else {
            AreaUpdate({
                id: editArea.id,
                regionId: editData.id,
                locationId: location,
                areaName: area,
                description: description,

            }, handleAddAdreaSuccess, handleAddAreaException)
        }

    }

    const handleAddAdreaSuccess = (dataObject) => {
        setRefreshData(oldValue => !oldValue);

        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setTimeout(() => {
            setArea('');
            setDescription('');
            setLocation('');
            setAreaData(true);
        }, 2000);

        // RegionShow({
        //     regionId: editData?.id,
        //     locationId: location,
        // }, handleLoctionSelect, handleLoctionSelectException);



    }
    const handleAddAreaException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
    }

    const handleLoctionSelect = (dataObject) => {
        // setAreaShowList(dataObject?.data || []);
    }

    const handleLoctionSelectException = (errorObject, errorMessage) => {

    }


    const onDeleteSelet = () => {
        // AreaDelete({ id }, DeleteSuccess, DeleteException);
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
    const DeleteException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
        }, 2000);
    }

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Grid container spacing={1} style={{ marginTop: '3px', }}>

                <Grid item xs={4}>

                    <FormControl sx={{ mb: 1 }} fullWidth>
                        <InputLabel id="demo-simple-select-label">Location</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={location}
                            label="Location"
                            size='small'

                            onChange={(e) => {
                                setLocation(e.target.value);
                                // RegionShow({
                                //     regionId: editData?.id,
                                //     locationId: e.target.value
                                // }, handleLoctionSelect, handleLoctionSelectException);
                            }}
                        >
                            {locationList.map((data) => (

                                <MenuItem key={data.id} value={data.id}>
                                    {data.locationName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Grid>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Area"
                        size='small'

                        variant="outlined"
                        value={area}
                        onChange={(e) => {
                            const newText = e.target.value.toUpperCase();
                            setArea(newText);

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
                <Grid item xs={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }} >

                    <Button size='small'
                        onClick={AddAreaData} style={{ background: '#e6e3da', color: 'black' }}>
                        {
                            areaData ? 'Add' : 'Update'
                        }

                    </Button>
                </Grid>
            </Grid>
            <div style={{ height: 400, width: '100%' }}>

                <DataGrid
                    style={{ border: 'none', color: 'black' }}
                    rows={areaLoactionShowList}
                    columns={columns}
                    pageSize={8}
                    // loading={isLoading}
                    rowsPerPageOptions={[8]}
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
            <DeleteConfirmationDailog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                deleteId={id}
                deleteService={AreaDelete}
                handleSuccess={DeleteSuccess}
                handleException={DeleteException}
                setRefreshData={setRefreshData}
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

export default AddfloorArea