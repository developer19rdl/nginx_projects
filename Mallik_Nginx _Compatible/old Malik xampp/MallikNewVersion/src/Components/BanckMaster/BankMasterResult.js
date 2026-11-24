import React, { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Box, Card, CardContent, Grid, Switch, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import DeleteConfirmationDailog from '../../Utility/confirmDeletion';
import '../../App.css';
import ApplicationStore from '../../Utility/localStorageUtil';
import { useModuleLocks } from '../context/ModuleLockContext';
import BankMasterTitle from './BankMasterTitle';
import { BankMasterShowData, BankMasterDelete, BankMasterUpdateActive } from '../../ApiService/LoginPageService';
import BankMasterModule from './BankMasterModule';

const BankMasterResult = () => {
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [sobDataList, setSobDataList] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const { userDetails } = ApplicationStore()?.getStorage('userDetails');
    const userPermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "bankmaster");
    const moduleLocks = useModuleLocks();
    const isModuleLocked =
        moduleLocks.find(m => m.moduleName === "Bank Master")?.lockStatus === "locked";


    const columns = [
        {
            field: 'id',
            headerName: 'SI No',
            headerClassName: 'super-app-theme--header',
            minWidth: 80,
            flex: 0.5,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'bankCode',
            headerName: 'Bank Code',
            headerClassName: 'super-app-theme--header',
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'bankName',
            headerName: 'Bank Name',
            headerClassName: 'super-app-theme--header',
            minWidth: 180,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'acName',
            headerName: 'Account Name',
            headerClassName: 'super-app-theme--header',
            minWidth: 180,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'acNo',
            headerName: 'Account No',
            headerClassName: 'super-app-theme--header',
            minWidth: 180,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'ifscCode',
            headerName: 'IFSC Code',
            headerClassName: 'super-app-theme--header',
            minWidth: 150,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'micrCode',
            headerName: 'MICR Code',
            headerClassName: 'super-app-theme--header',
            minWidth: 150,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'branchName',
            headerName: 'Branch Name',
            headerClassName: 'super-app-theme--header',
            minWidth: 180,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'acType',
            headerName: 'Account Type',
            headerClassName: 'super-app-theme--header',
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'shiftCode',
            headerName: 'Shift Code',
            headerClassName: 'super-app-theme--header',
            minWidth: 120,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (params) => params.row.shiftCode || '-',
        },
        {
            field: 'active',
            headerName: 'Status',
            headerClassName: 'super-app-theme--header',
            minWidth: 120,
            flex: 0.8,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Tooltip title={Number(params.row.active) === 1 ? 'Click to Deactivate' : 'Click to Activate'}>
                    <Switch
                        checked={Number(params.row.active) === 1}
                        disabled={isModuleLocked}
                        color="success"
                        size="small"
                        onChange={(e) => {
                            const newActive = e.target.checked ? 1 : 0;
                            BankMasterUpdateActive(
                                { id: params.row.id, active: newActive },
                                (res) => {
                                    setNotification({
                                        status: true,
                                        type: 'success',
                                        message: res?.message || 'Status updated successfully',
                                    });
                                    setRefreshData(old => !old);
                                    setTimeout(() => handleClose(), 3000);
                                },
                                (err, msg) => {
                                    setNotification({
                                        status: true,
                                        type: 'error',
                                        message: msg || 'Failed to update status',
                                    });
                                }
                            );
                        }}
                    />
                </Tooltip>
            ),
        },
        {
            field: 'actions',
            headerClassName: 'super-app-theme--header',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 120,
            flex: 1,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];


    useEffect(() => {
        BankMasterShowData(handleSobShowDataSuccess, handleSobShowDataException);
    }, [refreshData]);

    const handleSobShowDataSuccess = (dataObject) => {
        setSobDataList(dataObject?.data || []);
    }

    const handleSobShowDataException = (errorObject, errorMessage) => {

    }

    function EditData(props) {
        return (
            <EditIcon
                style={{ color: userPermission[0]?.updateData === 0 || isModuleLocked ? '#706f6f' : 'black' }}

                onClick={(event) => {
                    if (isModuleLocked) return;
                    setOpen(true);
                    setIsAddButton(false);
                    setEditData(props.selectedRow);

                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                style={{ color: userPermission[0]?.deleteData === 0 || isModuleLocked ? '#706f6f' : 'black' }}
                onClick={() => {
                    if (isModuleLocked) return;
                    setDeleteId(props.selectedRow.id);
                    setDeleteDailogOpen(true);

                }}

            />
        );
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

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
            // handleClose();
        }, 3000);
    };



    return (
        <div style={{ height: '80vh', margin: '20px' }}>
            <BankMasterTitle
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}

            />
            {/* <div style={{ display: 'flex', justifyContent: 'space-around' }}> */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                    <Card style={{ borderRadius: '8px', height: '75vh', marginTop: '10px', boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)" }}>
                        <CardContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                                    rows={sobDataList}
                                    columns={columns}
                                    pageSize={8}
                                    // loading={isLoading}
                                    rowsPerPageOptions={[8]}
                                    disableSelectionOnClick
                                    style={{ border: 'none', fontWeight: 'bold' }}
                                    sx={{
                                        overflow: 'auto',
                                        height: '70vh',
                                        // minHeight: '500px',
                                        width: '100%',
                                        '& .super-app-theme--header': {
                                            WebkitTextStrokeWidth: '0.6px',

                                        },
                                        '& .MuiDataGrid-cell': {
                                            border: '1px solid #969696',
                                        },
                                        '& .MuiDataGrid-columnHeader': {
                                            border: '1px solid #969696', // Add border to column headers
                                        },
                                    }}
                                    getRowClassName={(params) => {
                                        // Find the index of the row within the rows array
                                        const rowIndex = sobDataList.findIndex(row => row.id === params.row.id);
                                        // Check if the index is valid
                                        if (rowIndex !== -1) {
                                            console.log(' ');
                                            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                                        }
                                        return ''; // Return default class if index is not found
                                    }}
                                    rowHeight={40}
                                    columnHeaderHeight={40}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* </div> */}

            <BankMasterModule
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
                deleteService={BankMasterDelete}
                handleSuccess={deletehandleSuccess}
                handleException={deletehandleException}
            />
        </div>
    )
}

export default BankMasterResult
