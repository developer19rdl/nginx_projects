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
import { AddMachine, MachineEdit, ShowMachineOperator, GetShift, ShowProcessMaster, getMachineUOM, AllShowMasterAdd, AddChecklist, ShowTemplate, UpdateChecklist } from '../../Services/NodeJsApiServices';

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

const AddChecklistModule = ({
    open, setOpen, isAddButton, editData, setRefreshData,
}) => {
    const [departmentList, setDepartmentList] = useState([]);
    const [sectionList, setSectionList] = useState([]);
    const [templateList, setTemplateList] = useState([]);
    const [checklistName, setChecklistName] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('')
    const [section, setSection] = useState('')
    const [documentVersion, setDocumentVersion] = useState('');
    const [frequency, setFrequency] = useState('');
    const [template, setTemplate] = useState('');
    const [answerType, setAnswerType] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [rowId, setRowId] = useState('');

    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setOpen(open);
        !isAddButton && loaderData();
    }, [editData]);

    useEffect(() => {
        open && AllShowMasterAdd({
            masterType: "department"
        }, handleDepartmentSucess, handleDepartmentException);
        open && AllShowMasterAdd({
            masterType: "section"
        }, handleSectionSucess, handleSectionException);
        open && ShowTemplate(handleTemplateSucess, handleTemplateException);
    }, [open])

    // DEPARTMENT
    const handleDepartmentSucess = (dataObject) => {
        setDepartmentList(dataObject.data || []);
    }
    const handleDepartmentException = () => { }

    // SECTION
    const handleSectionSucess = (dataObject) => {
        setSectionList(dataObject.data || []);
    }
    const handleSectionException = () => { }

    // TEMPLATE
    const handleTemplateSucess = (dataObject) => {
        setTemplateList(dataObject.data || []);
    }
    const handleTemplateException = () => { }

    // SUBMIT
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
            AddChecklist({
                checkname: checklistName,
                description: description,
                // department: department,
                // section: section,
                Documentvrsn: documentVersion,
                frequency: frequency,
                template: template,
                answertype: answerType,
                created_by: createdBy,
                fromDate,
                toDate
                
            }, handleSuccess, handleException);
        } else {
            UpdateChecklist({
                id: rowId,
                checkname: checklistName,
                description: description,
                // department: department,
                // section: section,
                Documentvrsn: documentVersion,
                frequency: frequency,
                template: template,
                answertype: answerType,
                created_by: createdBy,
                fromDate,
                toDate
            }, handleSuccess, handleException);
        }
    };


        const formatDate = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);

            // Get local date in Asia/Kolkata time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
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
        setChecklistName('');
        setDescription('');
        setDepartment('');
        setSection('');
        setDocumentVersion('');
        setFrequency('');
        setTemplate('');
        setAnswerType('');
        setCreatedBy('');
        setNotification('');
        setRefreshData(oldvalue => !oldvalue);
    }

    const loaderData = () => {
        setRowId(editData?.checklistid || '');
        setChecklistName(editData?.checkname || '');
        setDescription(editData?.description || '');
        setDepartment(editData?.department || '');
        setSection(editData?.section || '');
        setDocumentVersion(editData?.documentVersion || '');
        setFrequency(editData?.frequency || '');
        setTemplate(editData?.templateid || '');
        setAnswerType(editData?.answertype || '');
        setCreatedBy(editData?.createdBy || '');
        setFromDate(formatDate(editData?.fromDate));
        setToDate(formatDate(editData?.toDate));
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
            <DialogTitle style={{ color: 'black', fontSize: "25px" }}>
                {isAddButton ? "Add Checklist" : "Edit Checklist"}
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Checklist Name"
                                variant="filled"
                                margin="dense"
                                fullWidth
                                required
                                size='small'
                                value={checklistName}
                                onChange={(e) => setChecklistName(e.target.value)}
                                placeholder="Checklist Name"
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Description"
                                variant="filled"
                                margin="dense"
                                size='small'
                                fullWidth
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description"
                            />
                        </Grid>

                        {/* <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Department</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Department"
                                    variant="filled"
                                    size='small'
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                >
                                    {departmentList.map((data) => (
                                        <MenuItem key={data.id} value={data?.id} >{data?.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}

                        {/* <Grid item xs={12} sm={12} md={6} lg={6} xl={6} >
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Section</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Section"
                                    variant="filled"
                                    size='small'
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                >
                                    {sectionList.map((data) => (
                                        <MenuItem key={data.id} value={data?.id} >{data?.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid> */}

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Document Version"
                                variant="filled"
                                margin="dense"
                                size='small'
                                fullWidth
                                required
                                value={documentVersion}
                                onChange={(e) => setDocumentVersion(e.target.value)}
                                placeholder="Document Version"
                            />
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Template</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Template"
                                    variant="filled"
                                    size='small'
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                >
                                    {templateList.map((data) => (
                                        <MenuItem key={data.id} value={data?.id} >{data?.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                            <TextField
                                id="filled-basic"
                                label="Created By"
                                variant="filled"
                                sx={{ mb: 1 }}
                                margin="dense"
                                size='small'
                                fullWidth
                                required
                                value={createdBy}
                                onChange={(e) => setCreatedBy(e.target.value)}
                                placeholder="Created By"
                            />
                        </Grid>

                <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <TextField
                    label="From Date"
                    type="date"
                    variant="filled"
                    margin="dense"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3} xl={3}>
                <TextField
                    label="To Date"
                    type="date"
                    variant="filled"
                    margin="dense"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
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
                            }}
                        // style={{ width: '150px', background: '#002D68', color: 'white' }}
                        >
                            {isAddButton ? 'Add' : 'Update'}
                        </Button>
                        <Button
                            variant="contained"
                            // style={{ width: '150px', background: '#002D68', color: 'white' }}
                            sx={{
                                backgroundColor: "#051622", color: "#ffff", width: '150px',
                                "&:hover": {
                                    backgroundColor: "#183b52", // Change to your desired hover color
                                },
                            }}
                            onClick={() => {
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

export default AddChecklistModule