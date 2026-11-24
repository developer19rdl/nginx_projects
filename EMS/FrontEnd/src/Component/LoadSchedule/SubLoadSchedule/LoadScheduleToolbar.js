import React, { useState } from 'react';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import UpdateIcon from '@mui/icons-material/Update';
import { DownloadShiftTemplate } from '../../../Services/DownloadCsvReportsService';
import { ImportUpdatedScheduleList } from '../../../Services/NodeJsApiServices';
import NotificationBar from './NotificationBar';

const LoadScheduleToolbar = (props) => {
    const { setUploadLoader, setRefreshData } = props;

    const [searchDate, setSearchDate] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleTemplateDownloadSuccess = () => {
    }
    const handleTemplateDownloadException = () => {
    }

    const handleItemImportSucess = (dataObject) => {
        console.log("the dataObject ", dataObject);
        setUploadLoader(false)
        setRefreshData(oldvalue => !oldvalue);
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    };


    const handleItemImportException = (errorObject, errorMessage) => {
        console.log("the error ", errorMessage);
        setUploadLoader(false)
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
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

    return (
        <Box
            sx={{
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                backgroundColor: '#f8f8ff',
                padding: '15px 15px 15px 15px',
                border: '1px solid #e0e0e0'
            }}
        >
            <Typography
                sx={{ m: 0 }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                {/* Load Schedule */}
                Assign Shift
            </Typography>
            {/* {props.userAccess.add && ( */}
            <Box style={{}}>
                <Button
                    variant="contained"
                    style={{ backgroundColor: '#051622', marginRight: '15px' }}
                    endIcon={<FileDownloadIcon />}
                    onClick={() => DownloadShiftTemplate(handleTemplateDownloadSuccess, handleTemplateDownloadException)}
                >
                    Export
                </Button>

                <Button
                    variant="contained"
                    style={{ backgroundColor: '#051622', marginRight: '15px' }}
                    endIcon={<UploadIcon />}
                    component="label"
                    htmlFor="import"
                >
                    Import
                </Button>
                <input
                    id="import"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            const reader = new FileReader();
                            reader.onload = () => {
                                if (reader.readyState === 2) {
                                    setUploadLoader(true)
                                    ImportUpdatedScheduleList({
                                        file: reader.result,
                                    }, handleItemImportSucess, handleItemImportException);
                                }
                            };
                            reader.readAsDataURL(e.target.files[0]);
                        }
                    }}

                />

                <Button
                    variant="contained"
                    style={{ backgroundColor: '#051622' }}
                    endIcon={<UpdateIcon />}
                    component="label"
                    htmlFor="reschedule"
                    onClick={() => {
                        props.setIsAddButton(true);
                        props.setEditConfigSetup([]);
                        props.setOpen(true);
                    }}
                >
                    Reschedule
                </Button>

                {}
                {}
            </Box>
            {}
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    );
}
export default LoadScheduleToolbar;
