
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { FetchMeterService, MeterDeleteService } from '../../../Services/LoginPageService.js'
// import NotificationBar from '../Notification/NotificationBar';
// import DeviceModal from './DeviceModelComponent';
import { Card, CardContent } from '@mui/material';
import MeterAllocationModal from './MeterAllocationModal';
import { MeterAllocationToolbar } from './MeterAllocationToolbar';
import NotificationBar from '../../Notification/NotificationBar.js';
// import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';
import { MeterAllocationView, MeterAllocationViewdelete, TagAddViewdelete } from '../../../Services/NodeJsApiServices.js';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';

export const MeterAllocationResults = () => {
    const columns = [
        {
            field: 'sNo',
            headerName: 'SL No',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'deviceId',
            headerName: 'Device Id',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'edgeDeviceName',
            headerName: 'Device Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'slaveId',
            headerName: 'Slave Id',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'displayName',
            headerName: 'Display Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'meterType',
            headerName: 'Meter Type',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <EditData selectedRow={params.row} />, <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editMeter, setEditMeter] = useState([]);
    const [meterList, setMeterList] = useState([]);

    const [isLoading, setGridLoading] = useState(true);
    const [id, setId] = useState('');
    const [btnReset, setBtnReset] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });


    useEffect(() => {
        setGridLoading(true);
        MeterAllocationView(handleSuccess, handleException);
    }, [refreshData]);

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setMeterList(dataObject.data);
    };

    const handleException = (errorObject) => {
    };

    const generateRowsWithIndex = (rows) => {
        return rows.map((row, index) => ({ sNo: index + 1, ...row }));
    };
    const rowData = generateRowsWithIndex(meterList);

    function EditData(props) {
        return (
            <EditIcon
                style={{ cursor: 'pointer' }}
                onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditMeter(props.selectedRow);
                    setOpen(true);
                }}
            />
        );
    }

    function DeleteData(props) {
        return (
            <DeleteIcon
                onClick={() => {
                    setId(props.selectedRow.id);
                    setDeleteId(props.selectedRow.id);
                    setDeleteDailogOpen(true);
                }}
                style={{ cursor: 'pointer' }}
            />
        );
    }

    // const DeviceDelete = (id) => {

    //     MeterDeleteService({ id }, DeviceDeeleteSuccess, DeviceDeleteException);

    // };

    // const DeviceDeeleteSuccess = (dataObject) => {
    //     setNotification({
    //         status: true,
    //         type: 'success',
    //         message: dataObject.message,
    //     });
    //     setTimeout(() => {
    //         handleClose();
    //         setOpen(false);
    //     }, 2000);
    //     setRefreshData((oldvalue) => !oldvalue);
    // };

    // const DeviceDeleteException = (errorObject, errorMessage) => {
    //     setNotification({
    //         status: true,
    //         type: 'error',
    //         message: errorMessage,
    //     });
    //     setTimeout(() => {
    //         handleClose();
    //         setOpen(false);
    //     }, 2000);
    // };

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 2000);
        setRefreshData((oldvalue) => !oldvalue);
    };

    const handleDeleteException = (errorObject, errorMessage) => {
        setNotification({
            status: true,
            type: 'error',
            message: errorMessage,
        });
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 2000);
    };


    return (
        <div style={{ height: 500, width: '100%' }}>
            {/* <Card style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 10px 10px 20px 10px', borderRadius: '12px', color: 'black' }}>
                <CardContent> */}
            <MeterAllocationToolbar
                setIsAddButton={setIsAddButton}
                setEditMeter={setEditMeter}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />
            {/* </CardContent>
            </Card> */}
            {/* <Card style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 10px 10px 20px 10px', borderRadius: '12px', color: 'black', marginTop: '10px' }}>
                <CardContent> */}
            {/* <DataGrid
                        rows={meterList}
                        columns={columns}
                        pagination
                        pageSize={25}
                        loading={isLoading}
                        rowsPerPageOptions={[25]}
                        disableSelectionOnClick
                        style={{ minHeight: 400 }}
                    /> */}
            <DataGrid
                rows={rowData}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
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
            {/* </CardContent>
            </Card> */}
            <MeterAllocationModal
                isAddButton={isAddButton}
                meterData={editMeter}
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
                deleteService={MeterAllocationViewdelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </div>
    )
}
