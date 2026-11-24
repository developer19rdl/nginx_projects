import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import AlertConfigTools from './AlertConfigTools';
import AlertConfigModel from './AlertConfigModel';

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

    const columns = [
        {
            field: 'machineName',
            headerName: 'SMS Gateway',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'sensor',
            headerName: 'Alert Email To',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'filterType',
            headerName: 'Alert Email From',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'max',
            headerName: 'Security Type',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'min',
            headerName: 'Alert Phone No',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },



    ]


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
                rows={rows}
                columns={columns}
                pageSize={8}
                loading={isLoading}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
                sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        color: '#000000', // Header text color
                        fontWeight: 'bold', // Header font weight
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold', // Ensures the header font weight is bold
                    },
                }}

            />

        </div>
    )
}

export default AlertConfigList

