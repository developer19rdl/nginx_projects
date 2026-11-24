import React from 'react'
import { useState, useEffect } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import AlertConfigTools from './AlertConfigTools';
import AlertConfigModel from './AlertConfigModel';
import { AlertConfigurationShowData, AlertConfigurationDelete } from '../../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../../Utility/NotificationBar';

const AlertConfigList = () => {
    const [rows, setRow] = useState([]);
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
    const [alertListData, setAlertListData] = useState([]);

    useEffect(() => {
        AlertConfigurationShowData(handleSuccess, handleException)
    }, [refreshData])

    const handleSuccess = (dataObject) => {
        setAlertListData(dataObject?.data || [])
    }
    const handleException = () => { }

    const columns = [
        {
            field: 'smtpServer',
            headerName: 'SMTP Server',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'alertEmailFrom',
            headerName: 'Alert Email From',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'password',
            headerName: 'Password',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'securityType',
            headerName: 'Security Type',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
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
            <AlertConfigTools
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            />

            <AlertConfigModel
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
                rows={alertListData}
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
                deleteService={AlertConfigurationDelete}
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

export default AlertConfigList

