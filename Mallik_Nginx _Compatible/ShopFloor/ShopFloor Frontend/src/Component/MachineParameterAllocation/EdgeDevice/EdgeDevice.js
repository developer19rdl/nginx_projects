import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { connect } from 'react-redux';
// import { showEdgeDevices, deleteEdgeDevices } from '../../../Actions';
// import DeleteConfirmationDailog from './SubEdgeDevice/DeleteConfirmationDailog';
import EdgeDeviceModal from './SubEdgeDevice/EdgeDeviceModal';
import EdgeDeviceToolbar from './SubEdgeDevice/EdgeDeviceToolbar';
import { EdgeDeviceView, EdgeDeviceViewdelete } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
// import NotificationBar from './SubEdgeDevice/NotificationBar';

const EdgeDevice = (props) => {
    const { edgeDeviceListList } = props;

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
        EdgeDeviceView(handeledge,handelexceptionedge)
    }, [refreshData])

    const handeledge=(dataObject)=>{
        setrows(dataObject.data)
    }

    const handelexceptionedge=()=>{
        
    }
    const columns = [
        {
            field: 'deviceCategoryName',
            headerName: 'Device Category',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'edgeDeviceName',
            headerName: 'Name of the device',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'deviceTag',
            headerName: 'Device Tag',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'macAddress',
            headerName: 'Mac Address',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'firmwareVersion',
            headerName: 'Firmware Version',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'hardwareModelVersion',
            headerName: 'Hardware Version',
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
        props.deleteEdgeDevices({
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
            <EdgeDeviceToolbar
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

            <EdgeDeviceModal
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
                deleteService={EdgeDeviceViewdelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
}


export default EdgeDevice;

