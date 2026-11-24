import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import NotificationBar from '../../Utility/NotificationBar';
import { ChecklistImport } from '../../Services/NodeJsApiServices';
import { ChecklistTemplateDownload } from '../../Services/DownloadCsvReportsService';

const AddChecklistTitle = (props) => {
    const { setUploadLoader, uploadLoader } = props;
    const [file, setFile] = useState(null);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleTemplateDownload = () => {
        ChecklistTemplateDownload(handleDownloadSuccess, handleDownloadException);
    }

    const handleDownloadSuccess = () => {
        setNotification({
            status: true,
            type: 'success',
            message: "Download Success",
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    }
    const handleDownloadException = () => {
        setNotification({
            status: true,
            type: 'error',
            message: "Failed to download Template",
        });
        setTimeout(() => {
        }, 2000);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // XL UPLOAD HANDLER
    const handleItemImportSucess = (dataObject) => {
        setUploadLoader(false);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    }
    const handleItemImportException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            setUploadLoader(false);
            // handleClose();
        }, 2000);
    }

    return (
        <Box
            // sx={{
            //     mb: '10px',
            //     alignItems: 'center',
            //     display: 'flex',
            //     justifyContent: 'space-between',
            //     flexWrap: 'wrap',
            //     marginLeft: '10px',
            //     marginRight: '10px',
            //     marginTop: '10px'
            // }}
            sx={{
                // mb: '0px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                backgroundColor: '#f8f8ff',
                padding: '15px',
                border: '1px solid #e0e0e0'
            }}
        >
            <Typography
                // sx={{ m: 1, fontFamily: 'Roboto Slab', fontWeight: 'bold' }}
                // variant="h5"
                sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                Checklist
            </Typography>
            <Box
                sx={{ m: 1 }}
            >
                <Grid container alignItems={'center'} spacing={2}>

                    <Grid item>
                        <div>
                            <Button
                                variant="contained"
                                // color="primary"
                                component="label"
                                sx={{ marginRight: '16px', backgroundColor: "#051622", height: '40px', borderRadius: '20px' }}
                                onClick={handleTemplateDownload}
                            >
                                Download Template
                            </Button>

                            <Button
                                variant="contained"
                                component="label"
                                htmlFor="upload-photo"
                                sx={{ backgroundColor: "#051622", height: '40px', borderRadius: '20px' }}
                            >
                                Upload File
                            </Button>
                            <input
                                id="upload-photo"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            if (reader.readyState === 2) {
                                                setUploadLoader(true)
                                                ChecklistImport({
                                                    file: reader.result,
                                                }, handleItemImportSucess, handleItemImportException);
                                            }
                                        };
                                        reader.readAsDataURL(e.target.files[0]);
                                    }
                                }}

                            />
                        </div>
                    </Grid>
                    <Grid item>
                        <Stack
                            direction="row"
                            spacing={2}

                        >
                            <Fab
                                // style={{ width: '100%', background: '#002D68', color: 'white' }}
                                sx={{
                                    backgroundColor: "#051622", color: "#ffff",
                                    "&:hover": {
                                        backgroundColor: "#183b52", // Change to your desired hover color
                                    },
                                }}
                                onClick={() => {
                                    props.setIsAddButton(true);
                                    props.setEditData([]);
                                    props.setOpen(true);
                                }}
                                variant="extended" size="medium" color="primary" aria-label="add">
                                <AddIcon sx={{ mr: 1 }} />
                                Add Checklist
                            </Fab>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    )
}

export default AddChecklistTitle