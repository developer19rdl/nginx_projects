
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { FetchMeterService, updateMachineAllocation, showAllocatedMachine, MachineAllocationDeleteService } from '../../../Services/LoginPageService.js'
// import NotificationBar from '../Notification/NotificationBar';
// import DeviceModal from './DeviceModelComponent';
import { Card, CardContent } from '@mui/material';
// import NotificationBar from '../../Notification/NotificationBar.js';
import NotificationBar from '../../../Utility/NotificationBar.js';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';
import MachineAllocationModalNew from './MachineAllocationModalNew.js'
import MachineAllocationToolbarNew from './MachineAllocationToolbarNew.js';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { MachineAllocationView, MachineAllocationViewdelete } from '../../../Services/NodeJsApiServices.js';
export const MachineAllocationResults = () => {

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
            field: 'machine_Name',
            headerName: 'Machine Name',
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
            headerName: 'Slave ID',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'Tag_Name',
            headerName: 'Tag Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'functionName',
            headerName: 'Function',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'isProdCapacity',
            headerName: 'Production/Capacity',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            renderCell: (params) => [
                <CheckBox selectedRow={params.row} />
            ],
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

    const [allocatedMachineList, setAllocatedMachineList] = useState([])

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setAllocatedMachineList(dataObject.data);
    };

    const handleException = (errorObject) => {
    };

    useEffect(() => {
        setGridLoading(true);
        MachineAllocationView(handleSuccess, handleException);
    }, [refreshData]);

    const generateRowsWithIndex = (rows) => {
        return rows.map((row, index) => ({ sNo: index + 1, ...row }));
    };
    const rowData = generateRowsWithIndex(allocatedMachineList);


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

    function CheckBox(props) {
        return (
            <>
                {props.selectedRow.isProdCapacity === "1" ?
                    <CheckIcon
                        style={{ cursor: 'pointer', color: '#0D9276' }}
                    />
                    :
                    <CloseIcon
                        style={{ cursor: 'pointer', color: '#B4B4B8' }}
                    />}
            </>

        );
    }

    // const DeviceDelete = (id) => {

    //     MeterDeleteService({ id }, DeviceDeeleteSuccess, DeviceDeleteException);

    // };

    const DeviceDeeleteSuccess = (dataObject) => {
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

    const DeviceDeleteException = (errorObject, errorMessage) => {
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
            <MachineAllocationToolbarNew
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditMeter}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />
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
            <MachineAllocationModalNew
                isAddButton={isAddButton}
                editData={editMeter}
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
                deleteService={MachineAllocationViewdelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </div>
    )
}
