
import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import NotificationBar from '../../../Notification/NotificationBar';
import { DownloadGSTExcelTemplate } from '../../../../Services/DownloadCsvReportsService';

const MachineParameterToolbar = (props) => {
    const [file, setFile] = useState(null);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const DownloadGSTExcelTemplateSuccess = () => {

    }

    const DownloadGSTExcelTemplateException = () => {

    }

    const handleDownloadClick = () => {
        // Generate the CSV template content
        const csvContent = `Sl.No,Machine Id,Device Id,Tag Name,Function,Prod/Capacity\nValue1,Value2,Value3,Value4,Value5,Value6\n`;

        // Create a Blob from the CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create an anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'MachineParameterAllocation.csv'; // Set the filename for the downloaded file
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };





    return (<>

        <Box
            sx={{
                mb: '10px',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                marginLeft: '10px',
                marginRight: '10px'
            }}
        >
            <Typography
                sx={{ m: 1 }}
                variant="h5"
            >
                Add Tag
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
                                sx={{ marginRight: '16px', backgroundColor: '#002D68', height: '40px', borderRadius: '20px' }}
                                // onClick={() => {
                                //     DownloadGSTExcelTemplate(DownloadGSTExcelTemplateSuccess, DownloadGSTExcelTemplateException);
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
                                                // SupExcelImport(
                                                //   { file: reader.result },
                                                //   SupExcelImportSuccess,
                                                //   DownloadSupExcelTemplateException
                                                // );
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
                                sx={{ backgroundColor: '#002D68', height: '40px', borderRadius: '20px' }}
                            >
                                Upload Multiple Allocation
                            </Button>

                        </div>
                    </Grid>

                    <Grid item>
                        <Stack direction="row" spacing={2}
                            onClick={() => {
                                props.setIsAddButton(true);
                                props.setEditConfigSetup([]);
                                props.setOpen(true);
                            }}>
                            <Fab
                                style={{ background: '#002D68', color: 'white' }}
                                variant="extended" size="medium" color="primary" aria-label="add">
                                Allocate Machine
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







        {}
    </>
    );
}
export default MachineParameterToolbar;
