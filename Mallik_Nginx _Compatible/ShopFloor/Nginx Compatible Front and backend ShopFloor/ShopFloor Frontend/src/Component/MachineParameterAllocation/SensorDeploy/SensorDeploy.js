import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import CapacityMeasureToolbar from './SubCapacityMeasureType/CapacityMeasureToolbar';
// import CapacityMeasureModal from './SubCapacityMeasureType/CapacityMeasureModal';
// import NotificationBar from './SubCapacityMeasureType/NotificationBar';
// import DeleteConfirmationDailog from './SubCapacityMeasureType/DeleteConfirmationDailog';
import { connect } from 'react-redux';
import { showEdgeDevices, deleteEdgeDevices } from '../../../Actions';
import DeleteConfirmationDailog from './SubSensorDeploy/DeleteConfirmationDailog';
import NotificationBar from './SubSensorDeploy/NotificationBar';
import SensorDeployModal from './SubSensorDeploy/SensorDeployModal';
import SensorDeployToolbar from './SubSensorDeploy/SensorDeployToolbar';

const SensorDeploy = (props) => {
    const { edgeDeviceListList } = props;

    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        props.showEdgeDevices()
    }, [refreshData])

    const columns = [
        {
            field: 'id',
            headerName: 'Sl No',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'tagName',
            headerName: 'Tag Name',
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
            field: 'category',
            headerName: 'Category',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'jsonType',
            headerName: 'Json Type',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'warningMinValue',
            headerName: 'Warning Min Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'warningMaxValue',
            headerName: 'Warning Max Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'outOfRangeMinValue',
            headerName: 'Out Of Range Min Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'outOfRangeMaxValue',
            headerName: 'Out Of Range Max Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'criticalMinValue',
            headerName: 'Critical Min Value',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'criticalMaxValue',
            headerName: 'Critical Max Value',
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
            <SensorDeployToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            // userAccess={moduleAccess}
            />

            <DataGrid
                rows={edgeDeviceListList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />

            <SensorDeployModal
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
                deleteService={DeletUnit}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
}

const mapStateToProps = ({ MachineParaAllocationReducer }) => {
    const { edgeDeviceListList } = MachineParaAllocationReducer;
    return { edgeDeviceListList }
}
export default connect(mapStateToProps, { showEdgeDevices, deleteEdgeDevices })(SensorDeploy);

