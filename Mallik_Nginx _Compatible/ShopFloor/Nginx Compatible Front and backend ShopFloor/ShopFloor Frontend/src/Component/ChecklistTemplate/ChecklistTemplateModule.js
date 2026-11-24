import React, { useEffect, useState } from 'react';
import {
    Button, Box, Dialog, Tooltip, DialogContent, DialogTitle, TextField, Grid, DialogActions, InputLabel, Select, MenuItem, FormControl, FormControlLabel, Checkbox, CardContent, Typography, Autocomplete, InputAdornment, OutlinedInput, ListItemText, RadioGroup, Radio, FormGroup, FormLabel,
} from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import { Card } from 'react-bootstrap';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DownloadIcon from '@mui/icons-material/Download';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from "@mui/icons-material/Search";
import { AddMachine, MachineEdit, ShowMachineOperator, GetShift, ShowProcessMaster, getMachineUOM, AddTemplate, UpdateTemplate } from '../../Services/NodeJsApiServices';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const ChecklistTemplateModule = ({
    open, setOpen, isAddButton, editData, setRefreshData,
}) => {
    const [rowId, setRowId] = useState('');
    const [templateName, setTemplateName] = useState('');
    const [templateDescription, setTemplateDescription] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [frequency, setFrequency] = useState('');
    

    useEffect(() => {
        setOpen(open);
        !isAddButton && loaderData();
    }, [editData]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
            AddTemplate({
                name: templateName,
                description: templateDescription,
                frequency
            }, handleSuccess, handleException);
        } else {
            UpdateTemplate({
                id: rowId,
                name: templateName,
                description: templateDescription,
                frequency
            }, handleSuccess, handleException);
        }

    };

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            ClearData();
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
        }, 2000);
    };

    const ClearData = () => {
        setOpen(false);
        setTemplateName('');
        setTemplateDescription('');
        setNotification('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const loaderData = () => {
        setRowId(editData?.id || '');
        setTemplateName(editData?.name || '');
        setTemplateDescription(editData?.description || '');
         setFrequency(editData?.frequency || '');
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { minWidth: '50%' } }}
            maxWidth="lg"
            open={open}
        >
            <DialogTitle style={{ color: 'black', fontSize: '25px' }}>
                {isAddButton ? "Add CheckList Template" : "Edit CheckList Template"}
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        {/* <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Template Id"
                                variant="filled"
                                margin="dense"
                                fullWidth
                                required
                                size='small'
                                // value={checklistName}
                                // onChange={(e) => setChecklistName(e.target.value)}
                                placeholder="Template Id"
                            />
                        </Grid> */}

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Template Name"
                                variant="filled"
                                margin="dense"
                                fullWidth
                                required
                                size='small'
                                value={templateName}
                                onChange={(e) => setTemplateName(e.target.value)}
                                placeholder="Template Name"
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Template Description"
                                variant="filled"
                                margin="dense"
                                size='small'
                                fullWidth
                                required
                                value={templateDescription}
                                onChange={(e) => setTemplateDescription(e.target.value)}
                                placeholder="Template Description"
                            />
                        </Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Frequency</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Section"
                                    variant="filled"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                >
                                    <MenuItem value={'daily'} >Daily</MenuItem>
                                    <MenuItem value={'monthly'} >Monthly</MenuItem>
                                    <MenuItem value={'quarterly'} >Quarterly</MenuItem>
                                    <MenuItem value={'semi_annually'} >Semi Annually</MenuItem>
                                    <MenuItem value={'annually'} >Annually</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <DialogActions>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "#051622", color: "#ffff", width: '150px',
                                "&:hover": {
                                    backgroundColor: "#183b52", // Change to your desired hover color
                                },
                            }}                        >
                            {isAddButton ? 'Add' : 'Update'}
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                backgroundColor: "#051622", color: "#ffff", width: '150px',
                                "&:hover": {
                                    backgroundColor: "#183b52", // Change to your desired hover color
                                },
                            }} onClick={() => {
                                setOpen(false)
                                ClearData();
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </form>
            </DialogContent>
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    )
}

export default ChecklistTemplateModule