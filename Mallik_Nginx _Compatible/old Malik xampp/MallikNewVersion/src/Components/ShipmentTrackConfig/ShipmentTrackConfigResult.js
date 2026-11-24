import React, { useState, useEffect } from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Card, CardContent, Grid, Chip, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import NotificationBar from '../GlobleFiles/ServiceNotificationBar';
import { GetShipmentTrackList } from '../../ApiService/LoginPageService';
import ShipmentTrackConfigModule from './ShipmentTrackConfigModule';
import ShipmentTrackConfigTitle from './ShipmentTrackConfigTitle';
import '../../App.css';
import ApplicationStore from '../../Utility/localStorageUtil';

const ShipmentTrackConfigResult = () => {
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState([]);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [configList, setConfigList] = useState([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const { userDetails } = ApplicationStore()?.getStorage('userDetails') || {};
    const isAdmin = userDetails?.role?.toLowerCase() === "admin" || userDetails?.isSuperUser === true;
    const userPermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "dispatchmaster");
    const canEdit = isAdmin || (userPermission && userPermission[0]?.updateData === 1);

    const columns = [
        {
            field: 'id',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>ID</span>,
            type: 'number',
            width: 80,
            align: 'center',
            headerAlign: 'center',
        },
        // {
        //     field: 'type',
        //     headerClassName: 'super-app-theme--header',
        //     headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Type</span>,
        //     type: 'string',
        //     width: 120,
        //     align: 'center',
        //     headerAlign: 'center',
        // },
        // {
        //     field: 'smtp_host',
        //     headerClassName: 'super-app-theme--header',
        //     headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>SMTP Host</span>,
        //     type: 'string',
        //     minWidth: 180,
        //     flex: 1,
        //     align: 'center',
        //     headerAlign: 'center',
        // },
        // {
        //     field: 'smtp_port',
        //     headerClassName: 'super-app-theme--header',
        //     headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>SMTP Port</span>,
        //     type: 'number',
        //     width: 100,
        //     align: 'center',
        //     headerAlign: 'center',
        // },
        {
            field: 'senderEmail',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Sender Email</span>,
            type: 'string',
            minWidth: 200,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'time',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Schedule Time</span>,
            type: 'string',
            width: 130,
            align: 'center',
            headerAlign: 'center',
        },
        {
            field: 'recipientsCount',
            headerClassName: 'super-app-theme--header',
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>No. of Recipients</span>,
            type: 'number',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            valueGetter: (params) => params.row.recipients?.length || 0
        },
        {
            field: 'actions',
            type: 'actions',
            headerClassName: 'super-app-theme--header',
            width: 100,
            headerName: <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Actions</span>,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
            ],
        },
    ];

    useEffect(() => {
        setGridLoading(true);
        GetShipmentTrackList(handleShowDataSuccess, handleShowDataException);
    }, [refreshData]);

    const handleShowDataSuccess = (dataObject) => {
        setConfigList(dataObject?.data || []);
        setGridLoading(false);
    };

    const handleShowDataException = (errorObject, errorMessage) => {
        setGridLoading(false);
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage || 'Failed to fetch configurations.',
        });
    };

    function EditData(props) {
        return (
            <IconButton
                onClick={() => {
                    if (!canEdit) return;
                    setIsAddButton(false);
                    setEditData(props.selectedRow);
                    setOpen(true);
                }}
                disabled={!canEdit}
                color="primary"
            >
                <VisibilityIcon style={{ color: canEdit ? '#002D68' : 'gray' }} />
            </IconButton>
        );
    }
    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* <ShipmentTrackConfigTitle
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
            /> */}
            <Box
                sx={{
                    mt: 2,
                    height: '350px',
                    width: '100%',
                    '& .super-app-theme--header': {
                        backgroundColor: '#93bce6',
                        color: '#1c1919'
                    },
                }}
            >
                <DataGrid
                    rows={configList}
                    columns={columns}
                    pageSize={5}
                    loading={isLoading}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    style={{ border: 'none', fontWeight: 'bold' }}
                    sx={{
                        overflow: 'auto',
                        height: '100%',
                        width: '100%',
                        '& .MuiDataGrid-cell': {
                            border: '1px solid #969696',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            border: '1px solid #969696',
                        },
                    }}
                    getRowClassName={(params) => {
                        const rowIndex = configList.findIndex(row => row.id === params.row.id);
                        if (rowIndex !== -1) {
                            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
                        }
                        return '';
                    }}
                    rowHeight={40}
                    columnHeaderHeight={40}
                />
            </Box>

            <ShipmentTrackConfigModule
                isAddButton={isAddButton}
                editData={editData}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                configList={configList}
            />

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    );
};

export default ShipmentTrackConfigResult;
