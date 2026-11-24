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
import { AddMachine, MachineEdit, ShowMachineOperator, GetShift, ShowProcessMaster, getMachineUOM, AddTemplateLayout, UpdateBodyLayoutLists } from '../../Services/NodeJsApiServices';

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

const BodyChecklistItemModule = ({
    isAddButton, editData, /*setRefreshData,*/ setBodyCheckListModal, bodyCheckListModal, frequency, questionType, answerType, selectedLayout, seletcedRow, setRefresh, setIsAddButton
}) => {
    const [checklistName, setChecklistName] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('')
    const [section, setSection] = useState('')
    const [documentVersion, setDocumentVersion] = useState('');
    // const [frequency, setFrequency] = useState('');
    const [template, setTemplate] = useState('');
    // const [answerType, setAnswerType] = useState('');
    const [createdBy, setCreatedBy] = useState('');
    const [rowId, setRowId] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    // const [selectedLayout, setSelectedLayout] = useState('Header');
    const [selectedLine1, setSelectedLine1] = useState('');
    const [selectedLine2, setSelectedLine2] = useState('');
    const [selectedLine3, setSelectedLine3] = useState('');
    const [selectedLine4, setSelectedLine4] = useState('');
    const [selectedLine5, setSelectedLine5] = useState('');
    const [selectedLine6, setSelectedLine6] = useState('');
    const [selectedLine7, setSelectedLine7] = useState('');
    const [selectedLine8, setSelectedLine8] = useState('');

    // NEW STATE
    const [checklistItem, setChecklistItem] = useState('');
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');

    const [objective1, setObjective1] = useState('');
    const [objective2, setObjective2] = useState('');

    const [userDefineData, setUserDefineData] = useState('');

    useEffect(() => {
        setBodyCheckListModal(bodyCheckListModal);
        !isAddButton && loaderData();
    }, [editData, bodyCheckListModal]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isAddButton) {
            if (questionType === 'multiple' && answerType === 'multiple') {
                AddTemplateLayout({
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        option1: option1,
                        option2: option2,
                        option3: option3,
                        option4: option4,
                    }
                }, handleSuccess, handleException);
            } else if (questionType === 'objective' && answerType === 'objective') {
                AddTemplateLayout({
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        option1: objective1,
                        option2: objective2,
                    }
                }, handleSuccess, handleException);
            } else if (questionType === 'fillInTheBlanks' && answerType === 'objective' || answerType === 'userData') {
                AddTemplateLayout({
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        ...(answerType === 'objective'
                            ? {
                                option1: objective1,
                                option2: objective2
                            }
                            : {
                                option1: objective1
                            })
                    }
                }, handleSuccess, handleException);

            }
        } else {
            if (questionType === 'multiple' && answerType === 'multiple') {
                UpdateBodyLayoutLists({
                    id: rowId,
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        option1: option1,
                        option2: option2,
                        option3: option3,
                        option4: option4,
                    }
                }, handleSuccess, handleException);
            } else if (questionType === 'objective' && answerType === 'objective') {
                UpdateBodyLayoutLists({
                    id: rowId,
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        option1: objective1,
                        option2: objective2,
                    }
                }, handleSuccess, handleException);
            } else if (questionType === 'fillInTheBlanks' && answerType === 'objective' || answerType === 'userData') {
                UpdateBodyLayoutLists({
                    id: rowId,
                    layout: selectedLayout,
                    frequency: frequency,
                    questiontype: questionType,
                    answertype: answerType,
                    template: seletcedRow.id,
                    checklistitem: {
                        item: checklistItem,
                        ...(answerType === 'objective'
                            ? {
                                option1: objective1,
                                option2: objective2
                            }
                            : {
                                option1: objective1
                            })
                    }
                }, handleSuccess, handleException);
            }
        }

    };

    const handleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefresh(preData => !preData);
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
        // setBodyCheckListModal(false);
        setIsAddButton(true)
        setChecklistItem('');
        setOption1('');
        setOption2('');
        setOption3('');
        setOption4('');
        setObjective1('');
        setObjective2('');
        setUserDefineData('');
    }

    const loaderData = () => {
        console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm", editData)
        setRowId(editData?.id || '');
        setChecklistItem(editData.item || '');
        setOption1(editData?.option1 || '');
        setOption2(editData?.option2 || '');
        setOption3(editData?.option3 || '');
        setOption4(editData?.option4 || '');
        setObjective1(editData?.option1 || '');
        setObjective2(editData?.option2 || '');
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
            sx={{ '& .MuiDialog-paper': { minWidth: '30%' } }}
            maxWidth="sm"
            open={bodyCheckListModal}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                {`Add Checklist Item [Body]`}
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {questionType === 'multiple' && answerType === 'multiple' &&
                        <Grid container spacing={2} >
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography style={{ width: '130px', textAlign: 'left' }}>Checklist Item</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Checklist Item'
                                    value={checklistItem}
                                    onChange={(e) => setChecklistItem(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography style={{ width: '130px', textAlign: 'left' }}>Option 1</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Option 1'
                                    value={option1}
                                    onChange={(e) => setOption1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography style={{ width: '130px', textAlign: 'left' }}>Option 2</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Option 2'
                                    value={option2}
                                    onChange={(e) => setOption2(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography style={{ width: '130px', textAlign: 'left' }}>Option 3</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Option 3'
                                    value={option3}
                                    onChange={(e) => setOption3(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography style={{ width: '130px', textAlign: 'left' }}>Option 4</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Option 4'
                                    value={option4}
                                    onChange={(e) => setOption4(e.target.value)}
                                />
                            </Grid>
                        </Grid>}

                    {questionType === 'objective' && answerType === 'objective' &&
                        <Grid container spacing={2} >
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Checklist Item</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Checklist Item'
                                    value={checklistItem}
                                    onChange={(e) => setChecklistItem(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Objective 1</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Objective 1'
                                    value={objective1}
                                    onChange={(e) => setObjective1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Objective 2</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Objective 2'
                                    value={objective2}
                                    onChange={(e) => setObjective2(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    }

                    {questionType === 'fillInTheBlanks' && answerType === 'objective' &&
                        <Grid container spacing={2} >
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Checklist Item</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Checklist Item'
                                    value={checklistItem}
                                    onChange={(e) => setChecklistItem(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Objective 1</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Objective 1'
                                    value={objective1}
                                    onChange={(e) => setObjective1(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Objective 2</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Objective 2'
                                    value={objective2}
                                    onChange={(e) => setObjective2(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    }

                    {questionType === 'fillInTheBlanks' && answerType === 'userData' &&
                        <Grid container spacing={2} >
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>Checklist Item</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='Checklist Item'
                                    value={checklistItem}
                                    onChange={(e) => setChecklistItem(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                <Typography>User Define Data</Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    required
                                    placeholder='User Define Data'
                                    value={objective1}
                                    onChange={(e) => setObjective1(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    }

                    <DialogActions>
                        <Button
                            type="submit"
                            variant="contained"
                            style={{ background: '#002D68', color: 'white' }}
                        >
                            Add
                        </Button>
                        <Button
                            variant="contained"
                            style={{ width: '150px', background: '#002D68', color: 'white' }}
                            onClick={() => {
                                setBodyCheckListModal(false)
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

export default BodyChecklistItemModule