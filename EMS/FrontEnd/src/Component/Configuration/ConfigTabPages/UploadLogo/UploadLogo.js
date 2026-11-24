import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { addMachine, showCapacityMeasure, showDepartment, editMachine, showDeviceCategory, addEdgeDevice, editEdgeDevices, getCompanyDetails } from '../../../../Actions';
import noImage from '../../../../Assets/Images/noImage.png'
import NotificationBar from './NotificationBar';
import { UploadCompanyLogo } from '../../../../Services/NodeJsApiServices';

const UploadLogo = (props) => {
    const [file, setFile] = useState(null);
    const [base64Image, setBase64Image] = useState(null);
    const [companyName, setCompanyName] = useState('')
    console.log("base64Image", base64Image)
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    // const handleFileChange = (event) => {
    //     // const selectedFile = event.target.files[0];
    //     // setFile(selectedFile);

    //     const selectedFile = event.target.files[0];

    //     // Check if the selected file meets the dimensions criteria (225x225)
    //     if (selectedFile) {
    //         const img = new Image();
    //         img.src = URL.createObjectURL(selectedFile);


    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        // Check if the selected file meets the dimensions criteria (225x225)
        if (selectedFile) {
            const img = new Image();
            img.src = URL.createObjectURL(selectedFile);

            img.onload = () => {
                if (img.width === 225 && img.height === 225) {
                    setFile(selectedFile);

                    // Convert the selected file to base64
                    const reader = new FileReader();

                    reader.onloadend = () => {
                        setBase64Image(reader.result);
                    };

                    reader.readAsDataURL(selectedFile);
                } else {
                    // Display an error message or handle accordingly
                    alert('Please upload an image with dimensions 225x225.');
                }
            };
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        UploadCompanyLogo({
            customerLogo: base64Image,
            customerTheme: "",
            companyName: companyName
        }, handleSuccess, handleException)
    }
    const handleSuccess = (dataObject) => {
        console.log("the dataObject ", dataObject);
        props.getCompanyDetails();
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            clearData();
            handleClose();
        }, 2000);
    };


    const handleException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            clearData();
            handleClose();
        }, 2000);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const clearData = () => {
        setFile('')
        setBase64Image('')
        setCompanyName('')
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Paper
                            style={{
                                backgroundColor: '#ffffff',
                                padding: '20px',
                                textAlign: 'center',
                                color: '#fff',
                                height: '300px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                flexDirection: 'column'
                            }}
                        >
                            <>
                                <TextField
                                    value={companyName}
                                    id="outlined-basic"
                                    label="Company Name"
                                    variant="outlined"
                                    fullWidth
                                    onChange={(e) => { setCompanyName(e.target.value); }}
                                    autoComplete="off"
                                    required
                                    style={{ marginBottom: '20px' }}
                                />
                            </>
                            <>
                                <TextField
                                    type="file"
                                    id="outlined-basic"
                                    variant="outlined"
                                    fullWidth
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
                            </>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Paper
                            style={{
                                backgroundColor: '#ffffff',
                                padding: '20px',
                                textAlign: 'center',
                                color: '#fff',
                                height: '300px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            {file ?
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt="Uploaded Logo"
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                />
                                :
                                <img
                                    src={noImage}
                                    alt="No Image"
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                />
                            }
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            // onClick={handleUploadButtonClick}
                            size="large"
                            type="submit"
                        >Upload</Button>
                    </Grid>

                    <NotificationBar
                        handleClose={handleClose}
                        notificationContent={openNotification.message}
                        openNotification={openNotification.status}
                        type={openNotification.type}
                    />
                </Grid >
            </form>
        </Box >
    );
};

const mapStateToProps = ({ config, MachineParaAllocationReducer }) => {
    const { capacityMeasureList, departmentList } = config;
    const { deviceCategoryList } = MachineParaAllocationReducer;
    return { capacityMeasureList, departmentList, deviceCategoryList };
};

export default connect(mapStateToProps, { addMachine, showCapacityMeasure, showDepartment, editMachine, showDeviceCategory, addEdgeDevice, editEdgeDevices, getCompanyDetails })(UploadLogo);
