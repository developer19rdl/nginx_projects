import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Box, Button, Card, CardContent, LinearProgress, Tooltip } from '@mui/material';
import NotificationBar from '../../Utility/NotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import AddChecklistModule from './AddChecklistModule';
import AddChecklistTitle from './AddChecklistTitle';
import { ShowCheckList, ChecklistDelete } from '../../Services/NodeJsApiServices'
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import '../../App.css';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignModule from './AssignModule';
import ViewModal from './ViewModal';

const AddChecklistResult = (props) => {
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState([]);
    const [id, setId] = useState('');
    const [refreshData, setRefreshData] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false)
    const [deleteId, setDeleteId] = useState('');
    const [checklistShow, setChecklistShow] = useState([]);
    const [uploadLoader, setUploadLoader] = useState(false);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [selectedRow, setSelectedRow] = useState('');

    const columns = [
        {
            field: 'checkname',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Name
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'description',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Checklist Description
                </span>,

            type: 'string',
            sortable: true,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'departmentName',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Department
                </span>,

            type: 'number',
            sortable: true,
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'sectionName',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Section
                </span>,
            type: 'string',
            sortable: true,
            minWidth: 80, flex: 1, align: 'center', headerAlign: 'center'
        },

        {
            field: 'documentVersion',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    Document Version
                </span>,
            type: 'string',
            sortable: true,
            sortable: false,
            minWidth: 50,
            flex: 1,
            align: 'center', headerAlign: 'center'
        },
          {
            field: 'checklistDate',
            headerClassName: 'super-app-theme--header',
            headerName:
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                   Checklist Created Date
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
                <Assign selectedRow={params.row} />,
                <View selectedRow={params.row} />,
            ],
        },
    ];

    useEffect(() => {
        ShowCheckList(handleSucessShow, handleExceptionShow)
    }, [refreshData]);

    const handleSucessShow = (dataObject) => {
        setChecklistShow(dataObject?.data || []);
    }
    const handleExceptionShow = (errorObject, errorMessage) => {

    }

    function EditData(props) {
        return (
            <EditIcon
                style={{ color: 'black' }}
                onClick={(event) => {
                    setIsAddButton(false);
                    setEditData(props.selectedRow);
                    setOpen(true);
                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                style={{ color: 'black' }}
                onClick={() => {
                    setDeleteId(props.selectedRow.checklistid);
                    setDeleteDailogOpen(true);
                }}
            />
        );
    }

    function Assign(props) {
        return (
            <Button
                variant="outlined"
                size='small'
                style={{ fontWeight: 'bold' }}
                color="success"
                onClick={() => {
                    setAssignModalOpen(true)
                    setSelectedRow(props.selectedRow)
                }}
            >Assign</Button>
        );
    }

    function View(props) {
        return (
            <Button
                variant="outlined"
                size='small'
                style={{ fontWeight: 'bold' }}
                onClick={() => {
                    setViewModalOpen(true)
                    setSelectedRow(props.selectedRow)
                }
                }
            >View</Button>
        );
    }

    const deletehandleSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
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

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        // <div style={{ height: '60vh', width: '100%' }}>
        <div style={{ height: 400, width: '100%' }}>

            <AddChecklistTitle
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
                setUploadLoader={setUploadLoader}
                uploadLoader={uploadLoader}
            />
            {/* <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <Card style={{ boxShadow: '0 10px 10px 2px rgba(0, 0, 0, 0.2)', borderRadius: '10px', width: '98%', height: '100%' }}>
                    {
                        uploadLoader &&
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                        </Box>
                    }
                    <CardContent>
                        <Box
                            sx={{
                                height: '150%',
                                width: '100%',
                                '& .super-app-theme--header': {
                                    backgroundColor: '#93bce6',
                                    color: '#1c1919'
                                },
                            }}
                        > */}
            <DataGrid
                rows={checklistShow}
                columns={columns}
                pageSize={8}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
                // sx={{
                //     overflow: 'auto',
                //     height: '68vh',
                //     width: '100%',
                //     '& .super-app-theme--header': {
                //         WebkitTextStrokeWidth: '0.6px',

                //     },
                //     '& .MuiDataGrid-cell': {
                //         border: '1px solid #969696',
                //     },
                //     '& .MuiDataGrid-columnHeader': {
                //         border: '1px solid #969696',
                //     },
                // }}
                sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        color: '#000000', // Header text color
                        fontWeight: 'bold', // Header font weight
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold', // Ensures the header font weight is bold
                    },
                }}
                getRowClassName={(params) => {
                    const rowIndex = checklistShow.findIndex(row => row.id === params.row.id);
                    if (rowIndex !== -1) {
                        console.log(' ');
                        return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                    }
                    return '';
                }}
            // rowHeight={40}
            // columnHeaderHeight={40}
            />
            {/* </Box>
                    </CardContent>
                </Card> */}

            {/* </div> */}

            <AddChecklistModule
                isAddButton={isAddButton}
                editData={editData}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}

            />
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                // selectedMaster={selectedMaster}
                deleteService={ChecklistDelete}
                handleSuccess={deletehandleSuccess}
                handleException={deletehandleException}
            />
            <AssignModule
                assignModalOpen={assignModalOpen}
                setAssignModalOpen={setAssignModalOpen}
                setRefreshData={setRefreshData}
                selectedRow={selectedRow}
            />
            <ViewModal
                viewModalOpen={viewModalOpen}
                setViewModalOpen={setViewModalOpen}
                setRefreshData={setRefreshData}
                selectedRow={selectedRow}
            />
        </div>
    )
}

export default AddChecklistResult