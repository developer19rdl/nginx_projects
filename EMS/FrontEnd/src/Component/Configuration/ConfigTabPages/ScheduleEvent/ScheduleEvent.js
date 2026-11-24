import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ScheduleEventToolbar from './SubScheduleEvent/ScheduleEventToolbar';
import ScheduleEventModal from './SubScheduleEvent/ScheduleEventModal';
import { ScheduleEventDalete, ScheduleEventView } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';

const ScheduleEvent = (props) => {
    const { capacityMeasureList } = props;
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
        setGridLoading(true);
        ScheduleEventView(handleSuccess, handleException);
    }, [refreshData]);

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setrows(dataObject?.data || []);
    };

    const columns = [
        {
            field: 'id',
            headerName: 'Event ID',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'fromDate',
            headerName: 'From Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'todate',
            headerName: 'To Date',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'dname',
            headerName: 'Department',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'mname',
            headerName: 'Machine',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'Type',
            headerName: 'Event Type',
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
        props.deleteCapacityMeasure({
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
            <ScheduleEventToolbar
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

            <ScheduleEventModal
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
                deleteService={ScheduleEventDalete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
}

const mapStateToProps = ({ config }) => {
    const { capacityMeasureList } = config;
    return { capacityMeasureList }
}
export default ScheduleEvent;
