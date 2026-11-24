// import React from 'react'

// const MachineParameterAllocation = () => {
//     return (
//         <div>MachineParameterAllocation</div>
//     )
// }
// export default MachineParameterAllocation;
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MachineParameterModal from './SubMachineParameterAllocation/MachineParameterModal';
import MachineParameterToolbar from './SubMachineParameterAllocation/MachineParameterToolbar';
import DeleteConfirmationDailog from './SubMachineParameterAllocation/DeleteConfirmationDailog';
import NotificationBar from './SubMachineParameterAllocation/NotificationBar';
import { connect } from 'react-redux';
import { showMachine, deleteMachine } from '../../../Actions';
import { Box } from '@mui/material';

const MachineParameterAllocation = (props) => {
    const { machineList, machineLoader } = props;
    console.log("machineList com", machineList)
    const columns = [
        // {
        //   field: 'id',
        //   headerName: 'ID',
        //   minWidth: 60,
        //   align: 'center',
        //   flex: 1,
        //   headerAlign: 'center'
        // },
        {
            field: 'departmentName',
            headerName: 'Machine',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        // {
        //   field: 'machineId',
        //   headerName: 'Machine ID',
        //   minWidth: 60,
        //   align: 'center',
        //   flex: 1,
        //   headerAlign: 'center'
        // },
        {
            field: 'machine_name',
            headerName: 'Edge Device',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'machine_tag',
            headerName: 'Device',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'capacityMeasureType',
            headerName: 'Manufacturer',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'max_capacity',
            headerName: 'Model No',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'unitName',
            headerName: 'Parameter',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'loading_time',
            headerName: 'Slave ID',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        // {
        //     field: 'unloading_time',
        //     headerName: 'Unloading Time',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        // {
        //     field: 'max_production_per_hour',
        //     headerName: 'Max Production Hour',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        // {
        //     field: 'is_dashboard_display',
        //     headerName: 'Dashboard Dsiplay',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
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


    const rows = [
        {
            id: 1,
            department: 'One',
            machineId: 'TESTING1',
            machineName: 'punching',
            machineTag: 'punch123',
            capacityMeasuringType: 'hz',
            maxCapacity: '120',
            capacityMeasuringUnit: 'Hz',
            loadingTime: '10',
            unloadingTime: '20',
            maxProductionHour: '2'
        },
        {
            id: 2,
            department: 'Two',
            machineId: 'TESTING2',
            machineName: 'shering',
            machineTag: 'sher123',
            capacityMeasuringType: 'hz',
            maxCapacity: '120',
            capacityMeasuringUnit: 'Hz',
            loadingTime: '10',
            unloadingTime: '20',
            maxProductionHour: '2'
        },
        {
            id: 3,
            department: 'Three',
            machineId: 'TESTING3',
            machineName: 'vibration',
            machineTag: 'vibe123',
            capacityMeasuringType: 'hz',
            maxCapacity: '120',
            capacityMeasuringUnit: 'Hz',
            loadingTime: '10',
            unloadingTime: '20',
            maxProductionHour: '2'
        },
    ];

    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [assetList, setAssetList] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        props.showMachine();
    }, [refreshData]);

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
                console.log("setEditConfigSetup", props.selectedRow)
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
        props.deleteMachine({
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
        <Box
            sx={{
                margin: '0vh',
                height: 400,
            }}
        >
            <MachineParameterToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            />

            <DataGrid
                rows={machineList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />

            <MachineParameterModal
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
        </Box>
    );
}

const mapStateToProps = ({ config }) => {
    const { machineList, machineLoader } = config;
    return { machineList, machineLoader }
}
// export default connect(mapStateToProps, { showMachine, deleteMachine })(Machine);
export default React.memo(connect(mapStateToProps, { showMachine, deleteMachine })(MachineParameterAllocation));
