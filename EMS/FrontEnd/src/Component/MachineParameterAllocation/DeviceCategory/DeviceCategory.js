import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import CapacityMeasureToolbar from './SubCapacityMeasureType/CapacityMeasureToolbar';
// import CapacityMeasureModal from './SubCapacityMeasureType/CapacityMeasureModal';
// import NotificationBar from './SubCapacityMeasureType/NotificationBar';
// import DeleteConfirmationDailog from './SubCapacityMeasureType/DeleteConfirmationDailog';
import { connect } from 'react-redux';
// import { showDeviceCategory, deleteDeviceCategory } from '../../../Actions';
// import DeleteConfirmationDailog from './SubDeviceCategory/DeleteConfirmationDailog';
// import NotificationBar from './SubDeviceCategory/NotificationBar';
import DeviceCategoryModal from './SubDeviceCategory/DeviceCategoryModal';
import DeviceCategoryToolbar from './SubDeviceCategory/DeviceCategoryToolbar';
import { MachineDeviceCategoredelete, MachineDeviceCategoryView } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';

const DeviceCategory = (props) => {


    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [rows, setrows] = useState([]);

    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        MachineDeviceCategoryView(handeldeviceCategory,handleExceptiondevice)
    }, [refreshData])
    const handeldeviceCategory=(dataObject)=>{
        setrows(dataObject.data)

    }
    const handleExceptiondevice=()=>{
        
    }


    const columns = [
        {
            field: 'deviceCategory',
            headerName: 'Category Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'description',
            headerName: 'Category Description',
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

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const DeletUnit = () => {
        props.deleteDeviceCategory({
            id: deleteId
        }, handleDeleteSuccess, handleException);
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

    const handleException = (errorObject) => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DeviceCategoryToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            // userAccess={moduleAccess}
            />

            <DataGrid
                rows={rows}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />

            <DeviceCategoryModal
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
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
                deleteService={MachineDeviceCategoredelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
}

export default DeviceCategory;
