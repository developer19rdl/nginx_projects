
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import NotificationBar from '../../Utility/NotificationBar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { AreShowList, BuildingShowList, FloorAdd, FloorDelete, FloorShowList, FloorUpdate, LoactionShow } from '../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import CloseIcon from '@mui/icons-material/Close';


function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const AddfloorArea = ({ locfloorOpen, setLoFloorOpen, isAddButton, editData, }) => {
    // const [value, setValue] = React.useState(0);
    console.log("editData", editData);
    const [floorShow, setFloorShow] = useState([]);
    const [buildingShow, setBuildingShow] = useState([]);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [floorImageOpen, setfloorImageOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [floorName, setFloorName] = useState('');
    const [buildingName, SetBuildingName] = useState('');
    const [area, setArea] = useState('');
    const [areaData, setAreaData] = useState(true);
    const [areaShowList, setAreaShowList] = useState([]);
    const [editArea, setEditArea] = useState([]);
    const [id, setId] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [areaLoactionShowList, setAreaLoactionShowList] = useState([]);
    const [imageURL, setImageURL] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [locationList, setLocationList] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleCloseMenu = () => {
        setLoFloorOpen(false);
        setAreaData(true)
    }


    const columns = [
        {
            field: 'locationName',
            headerName: 'Location',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'areaName',
            headerName: 'Area',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'buildingName',
            headerName: 'Building Name',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
        },
        {
            field: 'floorName',
            headerName: 'Floor Name',
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
                <BuildingShoow selectedRow={params.row} />,

            ],
        },
    ];
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
                    setfloorImageOpen(true);
                }}
            />
        );
    }
    useEffect(() => {
        setGridLoading(true);
        LoactionShow({ regionId: editData?.id }, handleloactionShowSucess, handleloactionShowException);
        AreShowList({ regionId: editData?.id }, handleAreaShowListSuccess, handleAreaShowListException);
        BuildingShowList({ regionId: editData?.id }, handleBuildingShowListSuccess, handleBuildingShowListException);
        locfloorOpen && FloorShowList({ regionId: editData?.id }, handleFloorShowListSuccess, handleFloorShowListException);
        setFloorName(editArea?.floorName || '');
        setLocation(editArea?.locationId || '');   // or editArea?.location?.id if nested
        setArea(editArea?.areaId || '');
        SetBuildingName(editArea?.buildingId || '');
        // setBase64Image(editArea?.imagePath || null);
    }, [refreshData, editArea, locfloorOpen]);
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
        setBuildingShow(dataObject?.data || []);
        setGridLoading(false);
    }


    const handleBuildingShowListException = (errorObject, errorMessage) => {
    };
    const handleFloorShowListSuccess = (dataObject) => {
        console.log('dataObject', dataObject.data)
        setFloorShow(dataObject?.data || []);
        setGridLoading(false);
    }


    const handleFloorShowListException = (errorObject, errorMessage) => {
    };
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
            FloorAdd({
                regionId: editData.id,
                locationId: location,
                areaId: area,
                buildingId: buildingName,
                floorName: floorName,
                image: base64Image
            }, handlefloorSuccess, handleAddfloorException);
        } else {
            FloorUpdate({
                id: editArea.id,
                regionId: editData.id,
                locationId: location,
                areaId: area,
                buildingId: buildingName,
                floorName: floorName,
                image: base64Image

            }, handlefloorSuccess, handleAddfloorException)
        }

    }

    const handlefloorSuccess = (dataObject) => {

        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });

        setTimeout(() => {
            setArea('');
            setFloorName('');
            setBase64Image(null);
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
            setAreaData(true);
        }, 2000);

        // RegionShow({
        //     regionId: editData?.id,
        //     locationId: location,
        // }, handleLoctionSelect, handleLoctionSelectException);



    }
    const handleAddfloorException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
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
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '70%', maxHeight: '85%' } }}
            maxWidth="xl"
            open={locfloorOpen}
        >
            <DialogTitle style={{ color: 'black' }}>
                Add Floor
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={1} style={{ marginTop: '5px', }}>

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
                        <FormControl sx={{ mb: 1 }} fullWidth>
                            <InputLabel id="demo-simple-select-label">Building Name</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={buildingName}
                                label="uilding Name"
                                size='small'
                                onChange={(e) => {
                                    SetBuildingName(e.target.value);
                                    // RegionShow({
                                    //     regionId: editData?.id,
                                    //     locationId: e.target.value
                                    // }, handleLoctionSelect, handleLoctionSelectException);
                                }}
                            >
                                {buildingShow.map((data) => (

                                    <MenuItem key={data.id} value={data.id}>
                                        {data.buildingName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="outlined-basic"
                            label="Floor Name"
                            variant="outlined"
                            size='small'

                            value={floorName}
                            onChange={(e) => {
                                setFloorName(e.target.value);
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

                        <Button onClick={AddAreaData} style={{ background: '#e6e3da', color: 'black' }}>
                            {
                                areaData ? 'Add' : 'Update'
                            }

                        </Button>
                    </Grid>
                </Grid>
                <div style={{ height: 400, width: '100%' }}>

                    <DataGrid
                        style={{ border: 'none', color: 'black' }}
                        rows={floorShow}
                        columns={columns}
                        pageSize={8}
                        // loading={isLoading}
                        rowsPerPageOptions={[8]}
                        disableSelectionOnClick
                        sx={{
                            height: '100%',
                            minHeight: '410px',

                            width: '100%',
                            '& .super-app-theme--header': {
                                WebkitTextStrokeWidth: '0.6px',

                            },
                        }}
                    />
                </div>


                <DialogActions style={{ marginTop: '5px' }}>

                    <Button onClick={handleCloseMenu} style={{ background: '#e6e3da', color: 'black' }}>
                        Cancel
                    </Button>
                </DialogActions>


            </DialogContent>

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <Dialog open={floorImageOpen} onClose={() => setfloorImageOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    Floor Image Preview
                    <IconButton
                        aria-label="close"
                        onClick={() => setfloorImageOpen(false)}
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
            <DeleteConfirmationDailog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                deleteId={id}
                deleteService={FloorDelete}
                handleSuccess={DeleteSuccess}
                handleException={DeleteException}
                setRefreshData={setRefreshData}
            />
        </Dialog>
    )
}

export default AddfloorArea
