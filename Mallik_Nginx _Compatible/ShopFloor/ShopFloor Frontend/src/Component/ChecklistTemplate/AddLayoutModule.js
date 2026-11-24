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
import { AddMachine, MachineEdit, ShowMachineOperator, GetShift, ShowProcessMaster, getMachineUOM, AddTemplateLayout, GetBodyLayoutLists, DeleteBodyLayoutLists, GetHeaderFooterData, UpdateTemplateLayout } from '../../Services/NodeJsApiServices';
import BodyChecklistItemModule from './BodyChecklistItemModule';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';

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

const AddLayoutModule = ({
    // isAddButton,
    editData,
    /*setRefreshData,*/
    setLayoutModuleOpen,
    layoutModuleOpen,
    seletcedRow
}) => {
    const [rowId, setRowId] = useState('');
    const [selectedLayout, setSelectedLayout] = useState('header');
    // HEADER STATE
    const [line1Label, setLine1Label] = useState('');
    const [selectedLine1, setSelectedLine1] = useState('file');
    const [line2Label, setLine2Label] = useState('');
    const [selectedLine2, setSelectedLine2] = useState('title');
    const [line3Label, setLine3Label] = useState('');
    const [selectedLine3, setSelectedLine3] = useState('');
    const [line4Label, setLine4Label] = useState('');
    const [selectedLine4, setSelectedLine4] = useState('');
    const [line5Label, setLine5Label] = useState('');
    const [selectedLine5, setSelectedLine5] = useState('');
    const [line6Label, setLine6Label] = useState('');
    const [selectedLine6, setSelectedLine6] = useState('');
    const [line7Label, setLine7Label] = useState('');
    const [selectedLine7, setSelectedLine7] = useState('');
    const [line8Label, setLine8Label] = useState('');
    const [selectedLine8, setSelectedLine8] = useState('');
    const [line9Label, setLine9Label] = useState('');
    const [selectedLine9, setSelectedLine9] = useState('REV');
    // BODY STATES
    const [bodyCheckListModal, setBodyCheckListModal] = useState();
    const [frequency, setFrequency] = useState('monthly');
    const [questionType, setQuestionType] = useState('');
    const [answerType, setAnswerType] = useState('');
    const [bodyChecklists, setBodyChecklists] = useState([]);
    const [gridData, setGridData] = useState([]);
    const [refresh, setRefresh] = useState(false);
    // HEADER_FOOTER VIEW DATA
    const [HeaderFooterViewData, setHeaderFooterViewData] = useState([]);
    const [editable, setEditable] = useState(false);

    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState('');

    const [isAddButton, setIsAddButton] = useState(true);
    const [editRowData, setEditRowData] = useState([]);
     const [layOutId, setLayOutId] = useState('');

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setLayoutModuleOpen(layoutModuleOpen);
        // !isAddButton && loaderData();
    }, [editData]);

    useEffect(() => {
        if (selectedLayout === 'body') {
            GetBodyLayoutLists({ id: seletcedRow.id, frequency: frequency, selectedLayout: selectedLayout }, handleBodylistsSuccess, handleBodylistsException)
        } else if (selectedLayout === 'footer' || selectedLayout === 'header') {
            GetHeaderFooterData({ id: seletcedRow.id, selectedLayout: selectedLayout }, handleHeaderFooterSuccess, handleHeaderFooterException);
        } else {
            console.log("No Layout Selected")
        }
        // layoutModuleOpen && GetBodyLayoutLists(handleBodylistsSuccess, handleBodylistsException)
    }, [layoutModuleOpen, selectedLayout, refresh])

    const handleHeaderFooterSuccess = (dataObject) => {
        if (selectedLayout === 'footer') {
            console.log("mmmmmmmmmmm", dataObject)
            dataObject?.message === 'No footer layouts found' ? setEditable(false) : setEditable(true);
             setLayOutId(dataObject?.data?.header[0]?.id || '');
            // setHeaderFooterViewData(dataObject?.data?.footer?.layout_details);
            setLine1Label(dataObject?.data?.footer[0]?.layout_details?.label1 || '');
            setSelectedLine1(dataObject?.data?.footer[0]?.layout_details?.label1field || '');
            setLine2Label(dataObject?.data?.footer[0]?.layout_details?.label2 || '');
            setSelectedLine2(dataObject?.data?.footer[0]?.layout_details?.label2field || '');
            setLine3Label(dataObject?.data?.footer[0]?.layout_details?.label3 || '');
            setSelectedLine3(dataObject?.data?.footer[0]?.layout_details?.label3field || '');
            setLine4Label(dataObject?.data?.footer[0]?.layout_details?.label4 || '');
            setSelectedLine4(dataObject?.data?.footer[0]?.layout_details?.label4field || '');
            setLine5Label(dataObject?.data?.footer[0]?.layout_details?.label5 || '');
            setSelectedLine5(dataObject?.data?.footer[0]?.layout_details?.label5field || '');
            setLine6Label(dataObject?.data?.footer[0]?.layout_details?.label6 || '');
            setSelectedLine6(dataObject?.data?.footer[0]?.layout_details?.label6field || '');
            setLine7Label(dataObject?.data?.footer[0]?.layout_details?.label7 || '');
            setSelectedLine7(dataObject?.data?.footer[0]?.layout_details?.label7field || '');
            setLine8Label(dataObject?.data?.footer[0]?.layout_details?.label8 || '');
            setSelectedLine8(dataObject?.data?.footer[0]?.layout_details?.label8field || '');
            setLine9Label(dataObject?.data?.footer[0]?.layout_details?.label9 || '');
            setSelectedLine9('REV');
        } else if (selectedLayout === 'header') {
            dataObject?.message === 'No header layouts found' ? setEditable(false) : setEditable(true);
            // setHeaderFooterViewData(dataObject?.data?.header?.layout_details);
            setLayOutId(dataObject?.data?.header[0]?.id || '');
            setLine1Label(dataObject?.data?.header[0]?.layout_details?.label1 || '');
            setSelectedLine1('file');
            setLine2Label(dataObject?.data?.header[0]?.layout_details?.label2 || '');
            setSelectedLine2('title');
            setLine3Label(dataObject?.data?.header[0]?.layout_details?.label3 || '');
            setSelectedLine3(dataObject?.data?.header[0]?.layout_details?.label3field || '');
            setLine4Label(dataObject?.data?.header[0]?.layout_details?.label4 || '');
            setSelectedLine4(dataObject?.data?.header[0]?.layout_details?.label4field || '');
            setLine5Label(dataObject?.data?.header[0]?.layout_details?.label5 || '');
            setSelectedLine5(dataObject?.data?.header[0]?.layout_details?.label5field || '');
            setLine6Label(dataObject?.data?.header[0]?.layout_details?.label6 || '');
            setSelectedLine6(dataObject?.data?.header[0]?.layout_details?.label6field || '');
            setLine7Label(dataObject?.data?.header[0]?.layout_details?.label7 || '');
            setSelectedLine7(dataObject?.data?.header[0]?.layout_details?.label7field || '');
            setLine8Label(dataObject?.data?.header[0]?.layout_details?.label8 || '');
            setSelectedLine8(dataObject?.data?.header[0]?.layout_details?.label8field || '');
        } else {
            console.log("No Body Selected")
        }
    }
    const handleHeaderFooterException = () => { }

    // useEffect(() => {
    //     if (selectedLayout === 'header') {
    //         GetBodyLayoutLists({ selectedLayout: selectedLayout }, handleHeaderlistsSuccess, handleHeaderlistsException)
    //     }
    //     // layoutModuleOpen && GetBodyLayoutLists(handleBodylistsSuccess, handleBodylistsException)
    // }, [layoutModuleOpen, selectedLayout, refresh])


    // useEffect(() => {
    //     if (selectedLayout === 'footer') {
    //         GetBodyLayoutLists({ selectedLayout: selectedLayout }, handleFooterlistsSuccess, handleFooterlistsException)
    //     }
    //     // layoutModuleOpen && GetBodyLayoutLists(handleBodylistsSuccess, handleBodylistsException)
    // }, [layoutModuleOpen, selectedLayout, refresh])


    const handleBodylistsSuccess = (dataObject) => {
        setBodyChecklists(dataObject?.data || '')
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
        }, 2000);
    }
    const handleBodylistsException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    }

    // const handleHeaderlistsSuccess = (dataObject) => {
    //     setBodyChecklists(dataObject?.data || [])
    //     setNotification({
    //         status: true,
    //         type: 'success',
    //         message: dataObject.message,
    //     });
    //     setTimeout(() => {
    //         handleClose();
    //     }, 2000);
    // }
    // const handleHeaderlistsException = (errorObject, errorMessage) => {
    //     setNotification({
    //         status: true,
    //         type: 'error',
    //         message: errorMessage,
    //     });
    //     setTimeout(() => {
    //     }, 2000);
    // }

    // const handleFooterlistsSuccess = (dataObject) => {
    //     setBodyChecklists(dataObject?.data || [])
    //     setNotification({
    //         status: true,
    //         type: 'success',
    //         message: dataObject.message,
    //     });
    //     setTimeout(() => {
    //         handleClose();
    //     }, 2000);
    // }
    // const handleFooterlistsException = (errorObject, errorMessage) => {
    //     setNotification({
    //         status: true,
    //         type: 'error',
    //         message: errorMessage,
    //     });
    //     setTimeout(() => {
    //     }, 2000);
    // }

    useEffect(() => {
        // const rowData = bodyChecklists.length > 0 ? bodyChecklists?.[0] : [];
        const rowData = bodyChecklists
        if (questionType === 'multiple' && answerType === 'multiple') {
            setGridData(rowData?.multiple || [])
        }
        else if (questionType === 'objective' && answerType === 'objective') {
            setGridData(rowData?.objective || [])
        }
        else if (questionType === 'fillInTheBlanks' && answerType === 'objective' || answerType === 'userData') {
            setGridData(rowData?.fillInTheBlanks || [])
        }
        else {
            setGridData([])
        }
    }, [questionType, bodyChecklists, answerType, frequency])

    const handleSubmit = (event) => {
        event.preventDefault();
        if (selectedLayout === 'body') {
            setBodyCheckListModal(true)
            setIsAddButton(true);
        } else {
            // if (isAddButton) {
            if (editable === false) {
                AddTemplateLayout({
                    layout: selectedLayout,
                    template: seletcedRow.id,
                    checklistitem: {
                        label1: line1Label,
                        label1field: selectedLine1,
                        label2: line2Label,
                        label2field: selectedLine2,
                        label3: line3Label,
                        label3field: selectedLine3,
                        label4: line4Label,
                        label4field: selectedLine4,
                        label5: line5Label,
                        label5field: selectedLine5,
                        label6: line6Label,
                        label6field: selectedLine6,
                        label7: line7Label,
                        label7field: selectedLine7,
                        label8: line8Label,
                        label8field: selectedLine8,
                        label9: line9Label,
                        label9field: selectedLine9
                    }
                }, handleSuccess, handleException);
            } else {
                UpdateTemplateLayout({
                    id: layOutId,
                    layout: selectedLayout,
                    template: seletcedRow.id,
                    checklistitem: {
                        label1: line1Label,
                        label1field: selectedLine1,
                        label2: line2Label,
                        label2field: selectedLine2,
                        label3: line3Label,
                        label3field: selectedLine3,
                        label4: line4Label,
                        label4field: selectedLine4,
                        label5: line5Label,
                        label5field: selectedLine5,
                        label6: line6Label,
                        label6field: selectedLine6,
                        label7: line7Label,
                        label7field: selectedLine7,
                        label8: line8Label,
                        label8field: selectedLine8,
                        label9: line9Label,
                        label9field: selectedLine9
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
        setTimeout(() => {
            ClearData();
            handleClose();
        }, 2000);
    };
    const handleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 2000);
    };

    const ClearData = () => {
        // setLayoutModuleOpen(false);
        setNotification('');
        setFrequency('monthly');
        setQuestionType('');
        setAnswerType('');
        // ---------------------------
        setSelectedLayout('Header');
        setLine1Label('');
        setSelectedLine1('file');
        setLine2Label('');
        setSelectedLine2('title');
        setLine3Label('');
        setSelectedLine3('');
        setLine4Label('');
        setSelectedLine4('');
        setLine5Label('');
        setSelectedLine5('');
        setLine6Label('');
        setSelectedLine6('');
        setLine7Label('');
        setSelectedLine7('');
        setLine8Label('');
        setSelectedLine8('');
        setLine9Label('');
        setSelectedLine9('');
    }

    const loaderData = () => {
        setRowId(editData?.id || '');
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const multipleColumns = [
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'option1',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Option 1
                </span>,

            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'option2',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Option 2
                </span>,

            type: 'number',
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'option3',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Option 3
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80, flex: 1, align: 'center', headerAlign: 'center'
        },

        {
            field: 'option4',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Option 4
                </span>,
            type: 'string',
            sortable: true,
            sortable: false,
            minWidth: 50,
            flex: 1,
            align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Actions
                </span>,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];
    const objectiveColumns = [
        {
            field: 'item',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Item
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'option1',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Objective 1
                </span>,

            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'option2',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Objective 2
                </span>,

            type: 'number',
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 1,
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Actions
                </span>,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function EditData(props) {
        return (
            <EditIcon
                onClick={(event) => {
                        setIsAddButton(false);
                        setEditRowData(props.selectedRow);
                        setBodyCheckListModal(true);
                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                style={{ color: 'black' }}
                onClick={() => {
                        setDeleteId(props.selectedRow.id);
                        setDeleteDailogOpen(true);
                }}
            />
        );
    }

    const deletehandleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefresh((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setDeleteDailogOpen(false);
        }, 3000);
    };
    const deletehandleException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
        }, 3000);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setLine1Label(reader.result); // This is the base64 encoded string
            };
            reader.onerror = (error) => {
                console.log('Error converting file to base64:', error);
            };
        }
    };

    console.log(line1Label)

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { minWidth: '50%' } }}
            maxWidth="lg"
            open={layoutModuleOpen}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                {`CheckList Template [${selectedLayout}]`}
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1} marginBottom={2.5}>
                            <FormControl fullWidth>
                                <InputLabel id="demo-simple-select-label">Select Layout</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    label="Frequency"
                                    variant="filled"
                                    size='small'
                                    value={selectedLayout}
                                    onChange={(e) => setSelectedLayout(e.target.value)}
                                >
                                    <MenuItem value={'header'} >Header</MenuItem>
                                    <MenuItem value={'body'} >Body</MenuItem>
                                    <MenuItem value={'footer'} >Footer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    {/* ------------------------------------------------------------------------------------------------------------------- */}
                    {selectedLayout === 'header' || selectedLayout === 'footer' ?
                        <Grid container spacing={2} >
                            {/* LABEL 1 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                {selectedLayout === "footer" ? (
                                    // Show TextField for 'footer'
                                    <TextField
                                        id="filled-basic"
                                        variant="filled"
                                        margin="dense"
                                        size="small"
                                        fullWidth
                                        required
                                        placeholder="Label 1"
                                        value={line1Label}
                                        onChange={(e) => setLine1Label(e.target.value)}
                                    />
                                ) : selectedLayout === "header" ? (
                                    // Show file input TextField for 'header'
                                    <TextField
                                        id="filled-basic"
                                        variant="filled"
                                        margin="dense"
                                        size="small"
                                        fullWidth
                                        type="file"
                                        onChange={handleFileChange}
                                    />
                                ) : null}
                            </Grid>

                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine1}
                                        // disabled
                                        disabled={selectedLayout === "header"}
                                        onChange={(e) => setSelectedLine1(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 2 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 2'
                                    value={line2Label}
                                    onChange={(e) => setLine2Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        // disabled
                                        disabled={selectedLayout === "header"}
                                        value={selectedLine2}
                                        onChange={(e) => setSelectedLine2(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 3 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 3'
                                    value={line3Label}
                                    onChange={(e) => setLine3Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine3}
                                        onChange={(e) => setSelectedLine3(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 4 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 4'
                                    value={line4Label}
                                    onChange={(e) => setLine4Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine4}
                                        onChange={(e) => setSelectedLine4(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 5 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 5'
                                    value={line5Label}
                                    onChange={(e) => setLine5Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine5}
                                        onChange={(e) => setSelectedLine5(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 6 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 6'
                                    value={line6Label}
                                    onChange={(e) => setLine6Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine6}
                                        onChange={(e) => setSelectedLine6(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 7 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 7'
                                    value={line7Label}
                                    onChange={(e) => setLine7Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine7}
                                        onChange={(e) => setSelectedLine7(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 8 */}
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                <TextField
                                    id="filled-basic"
                                    variant="filled"
                                    margin="dense"
                                    size='small'
                                    fullWidth
                                    placeholder='Label 8'
                                    value={line8Label}
                                    onChange={(e) => setLine8Label(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Field Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Field Type"
                                        variant="filled"
                                        size='small'
                                        value={selectedLine8}
                                        onChange={(e) => setSelectedLine8(e.target.value)}
                                    >
                                        <MenuItem value={'file'} >Browse</MenuItem>
                                        <MenuItem value={'date'} >Date</MenuItem>
                                        <MenuItem value={'time'} >Time</MenuItem>
                                        <MenuItem value={'text'} >Text</MenuItem>
                                        <MenuItem value={'title'} >Title</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            {/* LABEL 9 */}
                            {selectedLayout === "footer" && (
                                <>
                                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                                        <TextField
                                            id="filled-basic"
                                            variant="filled"
                                            margin="dense"
                                            size='small'
                                            fullWidth
                                            placeholder='Label 9'
                                            value={line9Label}
                                            onChange={(e) => setLine9Label(e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6} marginTop={1}>
                                        <TextField
                                            id="demo-simple-select"
                                            label="Field Type"
                                            variant="filled"
                                            size='small'
                                            fullWidth
                                            disabled
                                            placeholder='Field Type'
                                            value={selectedLine9}
                                            onChange={(e) => setSelectedLine9(e.target.value)}
                                        />
                                    </Grid>


                                </>
                            )}
                        </Grid>
                        :
                        // BODY LAYOUT SECTION 
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} marginTop={1} >
                                {/* <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Frequency</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Frequency"
                                        variant="filled"
                                        size='small'
                                        value={frequency}
                                        onChange={(e) => {
                                            setFrequency(e.target.value)
                                            GetBodyLayoutLists({ id: seletcedRow.id, frequency: e.target.value, selectedLayout: selectedLayout }, handleBodylistsSuccess, handleBodylistsException)
                                        }}
                                    >
                                        <MenuItem value={'daily'} >Daily</MenuItem>
                                        <MenuItem value={'weekly'} >Weekly</MenuItem>
                                        <MenuItem value={'monthly'} >Monthly</MenuItem>
                                    
                                    </Select>
                                </FormControl> */}

                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Frequency</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Frequency"
                                        variant="filled"
                                        size='small'
                                        value={frequency}
                                        onChange={(e) => {
                                            setFrequency(e.target.value)
                                            GetBodyLayoutLists({ id: seletcedRow.id, frequency: e.target.value, selectedLayout: selectedLayout }, handleBodylistsSuccess, handleBodylistsException)
                                        }}
                                    >
                                        <MenuItem value={'daily'} >Daily</MenuItem>
                                        <MenuItem value={'monthly'} >Monthly</MenuItem>
                                        <MenuItem value={'quarterly'} >Quarterly</MenuItem>
                                        <MenuItem value={'semi_annually'} >Semi Annually</MenuItem>
                                        <MenuItem value={'annually'} >Annually</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} marginTop={1} >
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Question Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Question Type"
                                        variant="filled"
                                        size='small'
                                        value={questionType}
                                        onChange={(e) => setQuestionType(e.target.value)}
                                    >
                                        <MenuItem value={'objective'} >Objective (Y/N)</MenuItem>
                                        <MenuItem value={'multiple'} >Multiple</MenuItem>
                                        <MenuItem value={'fillInTheBlanks'} >Fill in the blanks</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} marginTop={1} >
                                <FormControl fullWidth>
                                    <InputLabel id="demo-simple-select-label">Answer Type</InputLabel>
                                    <Select
                                        labelId="demo-simple-select-label"
                                        id="demo-simple-select"
                                        label="Answer Type"
                                        variant="filled"
                                        size='small'
                                        value={answerType}
                                        onChange={(e) => setAnswerType(e.target.value)}
                                    >
                                        <MenuItem value={'objective'} >Objective (Y/N)</MenuItem>
                                        <MenuItem value={'multiple'} >Multiple</MenuItem>
                                        <MenuItem value={'userData'} >User Define Data</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} marginBottom={2.5} display={'flex'} justifyContent={'flex-end'}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    style={{ background: '#002D68', color: 'white' }}
                                >
                                    Add Checklist Item
                                </Button>
                            </Grid>
                        </Grid>
                    }

                    <Grid container>
                        {selectedLayout === 'body' &&
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                <Box
                                    sx={{
                                        height: '150%',
                                        width: '100%',
                                        '& .super-app-theme--header': {
                                            backgroundColor: '#93bce6',
                                            color: '#1c1919'
                                        },
                                    }}
                                >
                                    <DataGrid
                                        // rows={machineList}
                                        rows={gridData}
                                        columns={questionType === 'multiple' && answerType === 'multiple' ? multipleColumns : objectiveColumns}
                                        // columns={[]}
                                        pageSize={8}
                                        // loading={isLoading}
                                        rowsPerPageOptions={[8]}
                                        disableSelectionOnClick
                                        style={{ border: 'none', }}
                                        sx={{
                                            overflow: 'auto',
                                            height: '38vh',
                                            // minHeight: '500px',
                                            width: '100%',
                                            '& .MuiDataGrid-cell': {
                                                border: '1px solid #969696',
                                            },
                                            '& .MuiDataGrid-columnHeader': {
                                                border: '1px solid #969696', // Add border to column headers
                                            },
                                        }}
                                        getRowClassName={(params) => {
                                            const rowIndex = gridData.findIndex(row => row.id === params.row.id);
                                            if (rowIndex !== -1) {
                                                console.log(' ');
                                                return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                            }
                                            return '';
                                        }}
                                        rowHeight={40}
                                        columnHeaderHeight={40}
                                    />
                                </Box>
                            </Grid>
                        }
                    </Grid>

                    <DialogActions>
                        {selectedLayout === 'header' || selectedLayout === 'footer' ? <Button
                            type="submit"
                            variant="contained"
                            style={{ background: '#002D68', color: 'white' }}
                        >
                            {editable === false ? 'Add Checklist Item' : 'Update Checklist Item'}
                        </Button> : null}
                        <Button
                            variant="contained"
                            style={{ width: '150px', background: '#002D68', color: 'white' }}
                            onClick={() => {
                                setLayoutModuleOpen(false)
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
            <BodyChecklistItemModule
                setBodyCheckListModal={setBodyCheckListModal}
                bodyCheckListModal={bodyCheckListModal}
                frequency={frequency}
                questionType={questionType}
                answerType={answerType}
                selectedLayout={selectedLayout}
                seletcedRow={seletcedRow}
                setRefresh={setRefresh}
                editData={editRowData}
                isAddButton={isAddButton}
                setIsAddButton={setIsAddButton}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                // selectedMaster={selectedMaster}
                deleteService={DeleteBodyLayoutLists}
                handleSuccess={deletehandleSuccess}
                handleException={deletehandleException}
            />
        </Dialog>
    )
}

export default AddLayoutModule