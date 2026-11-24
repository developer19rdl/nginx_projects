import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Checkbox, FormControlLabel, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import { CslMissing, SobExlImport, CellMasterDropdownList } from '../../../ApiService/LoginPageService';
import NotificationBar from '../../GlobleFiles/ServiceNotificationBar';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ImportSOBfile = ({ open, setOpen, cslId, setRefreshData }) => {
    const [selectedFileName, setSelectedFileName] = useState(null);
    const [Kanbandate, setKanbandate] = useState('');
    const [isloader, setIsloader] = useState(false);
    const [importloading, setimportLoading] = useState(false);
    const [cellMasterList, setCellMasterList] = useState([]);
    const [selectedCellMaster, setSelectedCellMaster] = useState("");

    useEffect(() => {
        if (open) {

            CellMasterDropdownList(
                (dataObject) => {
                    setCellMasterList(dataObject?.data || []);
                    if (dataObject?.data?.length > 0) {
                        setSelectedCellMaster(dataObject?.data?.name || dataObject?.data?.id);
                    }
                },
                (errorObject, errorMessage) => {
                    console.log(errorMessage);
                }
            );
        }
    }, [open]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [missData, setMissData] = useState([]);
    const [file, setFile] = useState(null);
    const currentDate = new Date();


    const SupExcelImportSuccess = (dataObject) => {
        setimportLoading(false);

        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            // handleClose();
            setOpen(false);
            setKanbandate('');
            // setRefreshData((oldValue) => !oldValue);
            setFile('');
            setIsloader(false);
        }, 2000);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    const DownloadSupExcelTemplateException = (errorObject, errorMessage) => {
        setimportLoading(false);

        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {

        }, 1000);
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setSelectedFileName(e.target.files[0].name); // Set the selected file name

                    // SobExlImport(
                    //     {
                    //         cslId: cslId,
                    //         file: reader.result,

                    //     },
                    //     SupExcelImportSuccess,
                    //     DownloadSupExcelTemplateException
                    // );
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const onClickImport = (e) => {
        e.preventDefault();
        setIsloader(true);
        setimportLoading(true);
        SobExlImport(
            {
                cslId: cslId,
                file: selectedFileName,
                kanbanDate: currentDate.toLocaleDateString(),
                cell: selectedCellMaster,
            },
            SupExcelImportSuccess,
            DownloadSupExcelTemplateException
        );

    }

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '30%', maxHeight: '100%', marginTop: '20px' } }}
            maxWidth="small"
            open={open}
        >
            {/* <DialogTitle style={{ background: '#002D68', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                Import SOB
            </DialogTitle> */}

            <form onSubmit={onClickImport}>
                <DialogContent>
                    <Grid container spacing={2} >
                        {!isloader ? (
                            <>
                                <Grid item md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                                    <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Date: {currentDate.toLocaleDateString()}</p>
                                </Grid>
                                {localStorage.getItem("showCellMasterDropdown") === "true" && (
                                    <Grid item md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                                        <FormControl fullWidth>
                                            <InputLabel id="cell-master-select-label">Select Cell Master</InputLabel>
                                            <Select
                                                labelId="cell-master-select-label"
                                                value={selectedCellMaster}
                                                label="Select Cell Master"
                                                onChange={(e) => setSelectedCellMaster(e.target.value)}
                                            >
                                                {cellMasterList.map((item) => (
                                                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid item md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <>
                                        <TextField
                                            fullWidth
                                            required
                                            style={{
                                                // margin: '10px'
                                            }}
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) {
                                                    const reader = new FileReader();
                                                    reader.onload = () => {
                                                        if (reader.readyState === 2) {
                                                            setSelectedFileName(reader.result);
                                                        }
                                                    };
                                                    reader.readAsDataURL(e.target.files[0]);
                                                }
                                            }}
                                            InputLabelProps={{ shrink: true }}
                                            type="file" />
                                    </>
                                </Grid>
                            </>
                        ) : (

                            <Grid item md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex' }}>
                                    <CircularProgress />
                                </Box>
                            </Grid>
                        )

                        }
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        type='submit'
                        disabled={importloading}
                    >
                        {importloading ? (
                            <CircularProgress size={24} style={{ color: 'white' }} />
                        ) : (
                            "Import"
                        )}
                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={(e) => {
                            setOpen(false);
                            setIsloader(false);
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </form>

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />

        </Dialog>
    )
}

export default ImportSOBfile
