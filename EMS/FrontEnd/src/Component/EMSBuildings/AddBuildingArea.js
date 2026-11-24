

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, Dialog, DialogTitle, DialogContent, IconButton, } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import AddfloorArea from './AddfloorArea';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { AreaAdd, AreaUpdate, AreShowList, BuildingAdd, BuildingDelete, BuildingShowList, BuildingUpdate, LoactionShow } from '../../Services/NodeJsApiServices';
import CloseIcon from '@mui/icons-material/Close';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';

const AddBuildingArea = ({ editData }) => {

    const [areaLoactionShowList, setAreaLoactionShowList] = useState([]);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [buildingShowlist, setBuildingShowlist] = useState([]);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [area, setArea] = useState('');
    const [buildingName, setBuildingName] = useState('');
    const [areaData, setAreaData] = useState(true);
    const [areaShowList, setAreaShowList] = useState([]);
    const [editArea, setEditArea] = useState([]);
    const [id, setId] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [locfloorOpen, setLoFloorOpen] = useState(false);
    const [buildImageOpen, setBuildImageOpen] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [locationList, setLocationList] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const columns = [
        {
            field: 'areaName',
            headerName: 'Area Name',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'buildingName',
            headerName: 'Building Name',
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
            field: 'description1',
            headerName: 'Total Floor',
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
                <AddFloor selectedRow={params.row} />,
                <BuildingShoow selectedRow={params.row} />,

            ],
        },
    ];
    const rows = [
        {
            id: 1,
            areaName: 'Sunshine Towers',
            buildingName: 'Building 1',
            description: 'Corporate office building in downtown',
            description1: '12',
        },
        {
            id: 2,
            areaName: 'Green Valley Apartments',
            buildingName: 'Building 2',
            description: 'Residential complex with gardens',
            description1: '8',
        },
        {
            id: 3,
            areaName: 'Tech Park One',
            buildingName: 'Building 3',
            description: 'IT business hub with multiple blocks',
            description1: '10',
        },
        {
            id: 4,
            areaName: 'Ocean View Plaza',
            buildingName: 'Building 4',
            description: 'Commercial space with ocean view',
            description1: '6',
        },
        {
            id: 5,
            areaName: 'Maple Residency',
            buildingName: 'Building 5',
            description: 'Luxury residential flats',
            description1: '15',
        },
    ];



    useEffect(() => {
        setGridLoading(true);
        LoactionShow({ regionId: editData?.id }, handleloactionShowSucess, handleloactionShowException);
        AreShowList({ regionId: editData?.id }, handleAreaShowListSuccess, handleAreaShowListException);
        BuildingShowList({ regionId: editData?.id }, handleBuildingShowListSuccess, handleBuildingShowListException);
        setLocation(editArea?.locationId || '');   // or editArea?.location?.id if nested
        setArea(editArea?.areaId || '');
        setBuildingName(editArea?.buildingName || '');
        setDescription(editArea?.description || '');
        // setBase64Image(editArea?.imagePath || null);

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
    const handleBuildingShowListSuccess = (dataObject) => {
        console.log('dataObject', dataObject.data)
        setBuildingShowlist(dataObject?.data || []);
        setGridLoading(false);
    }


    const handleBuildingShowListException = (errorObject, errorMessage) => {

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

    function AddFloor(props) {
        return (
            <AddLocationAltIcon onClick={(e) => {
                e.stopPropagation();
                setLoFloorOpen(true);
                // setEditArea(props.selectedRow);

            }} />
        )
    }
    function BuildingShoow(props) {
        return (
            <AddBusinessIcon
                onClick={(e) => {
                    e.stopPropagation();

                    // Backend returns relative path like "floor/cc9501e5-1d14-4a34-bdee-1dcd37ac4270.png"
                    const imagePath = props.selectedRow?.imagePath;

                    // ✅ Construct full image URL
                    const fullImageURL = imagePath
                        ? `http://192.168.1.4:8003/${imagePath}`
                        : "";

                    setImageURL(fullImageURL);
                    setBuildImageOpen(true);
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
            BuildingAdd({
                regionId: editData.id,
                locationId: location,
                areaId: area,
                buildingName: buildingName,
                description: description,
                image: base64Image
            }, handleAddAdreaSuccess, handleAddAreaException);
        } else {
            BuildingUpdate({
                id: editArea.id,
                regionId: editData.id,
                locationId: location,
                buildingName: buildingName,
                areaId: area,
                description: description,
                image: base64Image

            }, handleAddAdreaSuccess, handleAddAreaException)
        }

    }

    const handleAddAdreaSuccess = (dataObject) => {

        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setTimeout(() => {
            setArea('');
            setDescription('');
            setBase64Image(null);
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
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
        setAreaShowList(dataObject?.data || []);
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

    // const handleFileChange = (event) => {
    //     const selectedFile = event.target.files[0];

    //     // Check if the selected file meets the dimensions criteria (225x225)
    //     if (selectedFile) {
    //         const img = new Image();
    //         img.src = URL.createObjectURL(selectedFile);

    //         img.onload = () => {
    //             if (img.width === 225 && img.height === 225) {
    //                 setFile(selectedFile);

    //                 // Convert the selected file to base64
    //                 const reader = new FileReader();

    //                 reader.onloadend = () => {
    //                     setBase64Image(reader.result);
    //                 };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        // ✅ Allow only PNG files
        if (selectedFile.type !== "image/png") {
            alert("Please upload a PNG file only.");
            event.target.value = ""; // Reset file input
            return;
        }

        // ✅ Convert directly to Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            if (typeof base64 === "string") {
                setBase64Image(base64); // Save the Base64 string
            }
        };
        reader.readAsDataURL(selectedFile);
    };




    return (
        <div style={{ height: '100%', width: '100%' }}>
            <Grid container spacing={1} style={{ marginTop: '5px', }}>

                <Grid item xs={4}>

                    <FormControl sx={{ mb: 1 }} fullWidth>
                        <InputLabel id="demo-simple-select-label">Location</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={location}
                            size='small'

                            label="Location"
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

                    <FormControl sx={{ mb: 1 }} fullWidth>
                        <InputLabel id="demo-simple-select-label">Area</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={area}
                            label="Area"
                            size='small'

                            onChange={(e) => {
                                setArea(e.target.value);
                                // RegionShow({
                                //     regionId: editData?.id,
                                //     locationId: e.target.value
                                // }, handleLoctionSelect, handleLoctionSelectException);
                            }}
                        >
                            {areaLoactionShowList.map((data) => (

                                <MenuItem key={data.id} value={data.id}>
                                    {data.areaName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                </Grid>
                <Grid item xs={4}>
                    <TextField
                        fullWidth
                        id="outlined-basic"
                        label="Building Name"
                        variant="outlined"
                        size='small'

                        value={buildingName}
                        onChange={(e) => {
                            setBuildingName(e.target.value);

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
                            setDescription(e.target.value);
                        }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        type="file"
                        id="outlined-basic"
                        variant="outlined"
                        fullWidth
                        size='small'

                        onChange={handleFileChange}
                        autoComplete="off"
                        required
                        InputProps={{
                            inputProps: {
                                // accept: 'image/*',
                                accept: '.png', // Restrict to PNG images
                            },
                        }}
                    />
                    <label htmlFor="outlined-basic" style={{ cursor: 'pointer' }}>
                        <Typography variant="body2" color="secondary">
                            Upload an .PNG image (225x225)
                        </Typography>
                    </label>
                </Grid>
                <Grid item xs={4} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '13px' }} >

                    <Button size='small'
                        onClick={AddAreaData} style={{ background: '#e6e3da', color: 'black', }} >
                        {
                            areaData ? 'Add' : 'Update'
                        }

                    </Button>
                </Grid>
            </Grid>
            <div style={{ height: 400, width: '100%' }}>

                <DataGrid
                    style={{ border: 'none', color: 'black' }}
                    rows={buildingShowlist}
                    columns={columns}
                    pageSize={8}
                    // loading={isLoading}
                    rowsPerPageOptions={[8]}
                    disableSelectionOnClick
                    sx={{
                        height: '90%',
                        minHeight: '400px',

                        width: '100%',
                        '& .super-app-theme--header': {
                            WebkitTextStrokeWidth: '0.6px',

                        },
                    }}
                />
            </div>
            <AddfloorArea
                editData={editData}
                locfloorOpen={locfloorOpen}
                setRefreshData={setRefreshData}
                setLoFloorOpen={setLoFloorOpen}
            />
            <DeleteConfirmationDailog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                deleteId={id}
                deleteService={BuildingDelete}
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
            <Dialog open={buildImageOpen} onClose={() => setBuildImageOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Building Image Preview
                    <IconButton
                        aria-label="close"
                        onClick={() => setBuildImageOpen(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {imageURL ? (
                        <img
                            src={imageURL}
                            alt="Building"
                            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                    ) : (
                        <Typography variant="body2" color="error">
                            No image available.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

        </div >
    )
}

export default AddBuildingArea
