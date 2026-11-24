import React, { useState } from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
// import NotificationBar from '../../../Notification/NotificationBar.js'
// import NotificationBar from '../EdgeDevice/SubEdgeDevice/NotificationBar.js';
import { TagExcelUpload } from '../../../Services/LoginPageService.js'
import * as XLSX from 'xlsx';
import NotificationBar from '../../../Utility/NotificationBar.js';
import { TagAddAddexcel } from '../../../Services/NodeJsApiServices.js';

const TagsToolbar = (props) => {
    const { setRefreshData } = props;

    const [file, setFile] = useState(null);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const DownloadTagExcelTemplateSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            // setOpen(false);
        }, 2000);
        // setRefreshData((oldvalue) => !oldvalue);
    }

    const DownloadTagExcelTemplateException = (errorObject, errorMessage) => {
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

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    // const handleDownloadClick = () => {
    //     DownloadTagExcelTemplate(DownloadTagExcelTemplateSuccess, DownloadTagExcelTemplateException);
    // }

    // const handleDownloadClick = () => {
    //     // Generate the CSV template content
    //     const csvContent = `Sl.No,Tag Name,Device Id,Category,JsonType,Warning Min,Warning Max,Out of Range Min,Out of Range Max,Critical Min,Critical Max,Alert\nValue1,Value2,Value3,Value4,Value5,Value6,Value7,Value8,Value9,Value10,Value11,Value12\n`;

    //     // Create a Blob from the CSV content
    //     const blob = new Blob([csvContent], { type: 'text/csv' });

    //     // Create a temporary URL for the Blob
    //     const url = window.URL.createObjectURL(blob);

    //     // Create an anchor element to trigger the download
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'Template.csv'; // Set the filename for the downloaded file
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
                Category: '',
                Device_Name: '',
                Tag_Name: '',
                Json_Type: '',
                Warning_Min: '',
                Warning_Max: '',
                Out_of_Range_Min: '',
                Out_of_Range_Max: '',
                Critical_Min: '',
                Critical_Max: '',
                Alert: ''
            }
        ]
        const keyMapping = {
            'Category': 'Category',
            'Device_Name': 'Device Name',
            'Tag_Name': 'Tag Name',
            'Json_Type': 'Json Type',
            'Warning_Min': 'Warning Min',
            'Warning_Max': 'Warning Max',
            'Out_of_Range_Min': 'Out of Range Min',
            'Out_of_Range_Max': 'Out of Range Max',
            'Critical_Min': 'Critical Min',
            'Critical_Max': 'Critical Max',
            'Alert': 'Alert',
        };

        // Define column widths (optional)
        const columnWidths = [15, 15, 15, 15, 15, 15, 20, 20, 15, 15, 15];

        const worksheet = arrayToWorksheet(temPlateHeader, keyMapping, columnWidths);
        downloadExcelFile(worksheet, 'Tag_Template.xlsx');
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
        <>
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
                    sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}
                    variant="h5"
                    component="span"
                    fontFamily={'Roboto Slab'}
                >
                    Add Tag
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
                                    //     DownloadTagExcelTemplate(DownloadTagExcelTemplateSuccess, DownloadTagExcelTemplateException);
                                    // }}
                                    onClick={handleDownloadClick}
                                >
                                    Download Template
                                </Button>
                                {/* <ExcelTemplateDownloader /> */}
                                <input
                                    id="upload-photo"
                                    type="file"
                                    accept=".xls, .xlsx"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            const reader = new FileReader();
                                            reader.onload = () => {
                                                if (reader.readyState === 2) {
                                                    setFile(reader.result);
                                                    TagAddAddexcel(
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
                                    Upload Multiple Tag
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
                                    style={{ background: '#051622', color: 'white' }}
                                    variant="extended" size="medium" color="primary" aria-label="add">
                                    Add Tag
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

        </>
    );
}
export default TagsToolbar;