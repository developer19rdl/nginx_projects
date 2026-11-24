import React from 'react'
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import SmsConfigTools from './SmsConfigTools';
import SmsConfigModel from './SmsConfigModel';
import { SmsConfigurationShowData, SmsConfigurationDelete } from '../../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../../Utility/NotificationBar';

const SmsConfigList = () => {
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState('');
    const [open, setOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [isLoading, setGridLoading] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    const [smsListData, setSmsListData] = useState([]);

    useEffect(() => {
        SmsConfigurationShowData(handleSuccess, handleException)
    }, [refreshData])

    const handleSuccess = (dataObject) => {
        setSmsListData(dataObject?.data || [])
    }
    const handleException = () => { }

    const columns = [
        { field: 'provider', headerName: 'Provider', minWidth: 130, align: 'center', flex: 1, headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'gatewayUrl', headerName: 'Gateway URL', minWidth: 220, align: 'center', flex: 1, headerAlign: 'center' },
        { field: 'senderId', headerName: 'Sender ID', minWidth: 120, align: 'center', flex: 1, headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        { field: 'route', headerName: 'Route', minWidth: 100, align: 'center', flex: 1, headerAlign: 'center',
          renderCell: (p) => p.value || '—' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function DeleteData(props) {
        return (
            <DeleteIcon onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteDailogOpen(true);
            }}
            />
        )
    }

    function EditData(props) {
        return (
            <EditIcon onClick={(event) => {
                event.stopPropagation();
                setIsAddButton(false);
                setEditConfigSetup(props.selectedRow);
                setOpen(true);
            }}
            />
        )
    }

    const handleDeleteSuccess = (dataObject) => {
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
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    return (
        <div style={{ height: 400, width: '100%' }}>
            <SmsConfigTools
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            />

            <SmsConfigModel
                isAddButton={isAddButton}
                editConfigSetup={editConfigSetup}
                setEditConfigSetup={setEditConfigSetup}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
            />

            <DataGrid
                rows={smsListData}
                columns={columns}
                pageSize={8}
                loading={isLoading}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
                sx={{
                    height: '480px',
                    width: '100%',
                    backgroundColor: '#ffffff'
                    , '& .super-app-theme--header': {
                        WebkitTextStrokeWidth: '0.6px',
                    },
                }}
            />

            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={SmsConfigurationDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />

        </div>
    )
}

export default SmsConfigList
