import React, { useState } from 'react';

import { Box, Button, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
// import NotificationBar from '../../Notification/NotificationBar.js';
import * as XLSX from 'xlsx';
import { DownloadMachineAllocateExcelTemplate } from '../../../Services/DownloadCsvReportsService.js';
import { MeterAllocationExcelUpload } from '../../../Services/LoginPageService';
import NotificationBar from '../../../Utility/NotificationBar.js';



export function MeterAllocationToolbar(props) {

    const { setRefreshData } = props;

    const [file, setFile] = useState(null);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    const DownloadMachAllocTemplateSuccess = () => {

    }

    const DownloadMachAllocTemplateException = () => {

    }

    // const handleDownloadClick = () => {
    //     // Generate the CSV template content
    //     const csvContent = `Sl.No,Device Id,Slave Id,Display Name,Meter Type\nValue1,Value2,Value3,Value4,Value5\n`;

    //     // Create a Blob from the CSV content
    //     const blob = new Blob([csvContent], { type: 'text/csv' });

    //     // Create a temporary URL for the Blob
    //     const url = window.URL.createObjectURL(blob);

    //     // Create an anchor element to trigger the download
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'MeterTemplate.csv'; // Set the filename for the downloaded file
    //     document.body.appendChild(a);
    //     a.click();

    //     // Cleanup
    //     window.URL.revokeObjectURL(url);
    //     document.body.removeChild(a);
    // };

    const arrayToWorksheet = (array, keyMapping, columnWidths) => {
        // Change the key names in each object according to keyMapping
        const transformedArray = array.map(obj =>
            Object.fromEntries(Object.entries(obj).map(([key, value]) =>
                [keyMapping[key] || key, value]
            ))
        );

        const worksheet = XLSX.utils.json_to_sheet(transformedArray);

        // Set column widths
        if (columnWidths) {
            worksheet['!cols'] = columnWidths.map(width => ({ width }));
        }

        return worksheet;
    };

    const downloadExcelFile = (worksheet, filename) => {
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');
        XLSX.writeFile(workbook, filename);
    };

    const handleDownloadClick = (data) => {
        // Define a key mapping for renaming keys
        const temPlateHeader = [
            {
                device_Name: '',
                slave_id: '',
                display_Name: '',
                meter_Type: '',
            }
        ]
        const keyMapping = {
            'device_Name': 'Device Name',
            'slave_id': 'Slave Id',
            'display_Name': 'Display Name',
            'meter_Type': 'Meter Type',
        };

        // Define column widths (optional)
        const columnWidths = [15, 15, 15, 15];

        const worksheet = arrayToWorksheet(temPlateHeader, keyMapping, columnWidths);
        downloadExcelFile(worksheet, 'Meter_Allocation.xlsx');
    };



    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const ExcelUploadSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            // setOpen(false);
        }, 2000);
        setRefreshData((oldvalue) => !oldvalue);

    }
    const ExcelUploadException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
            // setOpen(false);
        }, 2000);

    }

    return (
        <Box
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
                sx={{ m: 0 }}
                variant="h5"
                component="span"
                fontFamily={'Roboto Slab'}
            >
                Meter Allocation
            </Typography>
            <Box
                // sx={{ m: 1 }}
            >
                <Grid container alignItems={'center'} spacing={2}>

                    <Grid item>
                        <div>
                            <Button
                                variant="contained"
                                // color="primary"
                                component="label"
                                sx={{ marginRight: '16px', backgroundColor: '#051622', height: '40px', borderRadius: '20px' }}
                                // onClick={() => {
                                //     DownloadMachineAllocateExcelTemplate(DownloadMachAllocTemplateSuccess, DownloadMachAllocTemplateException);
                                // }}
                                onClick={handleDownloadClick}
                            >
                                Download Template
                            </Button>
                            {/* <ExcelTemplateDownloader /> */}

                            <input
                                id="upload-photo"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            if (reader.readyState === 2) {
                                                setFile(reader.result);
                                                MeterAllocationExcelUpload(
                                                    { file: reader.result },
                                                    ExcelUploadSuccess,
                                                    ExcelUploadException
                                                );
                                            }
                                        };
                                        reader.readAsDataURL(e.target.files[0]);
                                    }
                                }}
                            />

                            <Button
                                variant="contained"
                                component="label"
                                htmlFor="upload-photo"
                                sx={{ backgroundColor: '#051622', height: '40px', borderRadius: '20px' }}
                            >
                                Upload Multiple Meter
                            </Button>

                        </div>
                    </Grid>

                    <Grid item>
                        <Stack direction="row" spacing={2}
                            onClick={() => {
                                props.setIsAddButton(true);
                                props.setEditMeter([]);
                                props.setOpen(true);
                            }}>
                            <Fab
                                style={{ background: '#051622', color: 'white' }}
                                variant="extended" size="medium" color="primary" aria-label="add">
                                <AddIcon sx={{ mr: 1 }} />
                                Allocate Meter
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
    );
}
