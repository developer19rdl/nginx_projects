
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { FetchMeterService, MeterDeleteService } from '../../../Services/LoginPageService.js'
// import NotificationBar from '../Notification/NotificationBar';
// import DeviceModal from './DeviceModelComponent';
import { Card, CardContent } from '@mui/material';
import MeterPlantAllocationModal from './MeterPlantAllocationModal';
import { MeterPlantAllocationToolbar } from './MeterPlantAllocationToolbar';
import NotificationBar from '../../Notification/NotificationBar.js';
// import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';
import { IncomerDelete, IncomerShowdata, MeterAllocationView, MeterAllocationViewdelete, MeterPlantShow, TagAddViewdelete } from '../../../Services/NodeJsApiServices.js';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddLocArea from '../MeterPlantAllocation/AddLocArea.js';


export const MeterPlantAllocationResults = () => {
    const columns = [
        {
            field: 'plantName',
            headerName: 'Plant Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'plantDescription',
            headerName: 'Plant Description',
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
                <CircuitData selectedRow={params.row} />,
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];
    const [locAreaOpen, setLocAreaOpen] = useState(false);

    const [plantList, setPlantList] = useState('')

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
        // IncomerShowdata(handleMeterShowSuccess, handleMeterShowException)
        MeterPlantShow(handleMeterShowSuccess, handleMeterShowException)
    }, [refreshData])

    const handleMeterShowSuccess = (dataObject) => {
        const updatedData = dataObject.data.map((plant, index) => ({ ...plant, sNo: index + 1 }))
        setPlantList(updatedData)
    }
    const handleMeterShowException = () => { }

    const generateRowsWithIndex = (rows) => {
        return rows.map((row, index) => ({ sNo: index + 1, ...row }));
    };
    const rowData = generateRowsWithIndex(meterList);

    function CircuitData(props) {
        return (
            <AddCircleIcon
                onClick={() => {
                    setId(props.selectedRow.id);
                    setLocAreaOpen(true);
                    setEditMeter(props.selectedRow)
                    // setDeleteId(props.selectedRow.id);
                    // setDeleteDailogOpen(true);
                }}
                style={{ cursor: 'pointer' }}
            />
        );
    }
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

    const DeviceDelete = (id) => {

        IncomerDelete({ id }, DeviceDeeleteSuccess, DeviceDeleteException);

    };

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
            {/* <Card style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 10px 10px 20px 10px', borderRadius: '12px', color: 'black' }}>
                <CardContent> */}
            <MeterPlantAllocationToolbar
                setIsAddButton={setIsAddButton}
                setEditMeter={setEditMeter}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />
            {/* </CardContent>
            </Card> */}
            {/* <Card style={{ boxShadow: 'rgba(100, 100, 111, 0.2) 10px 10px 20px 10px', borderRadius: '12px', color: 'black', marginTop: '10px' }}>
                <CardContent> */}
            {}
            <DataGrid
                rows={plantList}
                columns={columns}
                pageSize={5}
                // loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            {/* </CardContent>
            </Card> */}
            <MeterPlantAllocationModal
                isAddButton={isAddButton}
                meterData={editMeter}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />
            <AddLocArea
                meterData={editMeter}
                locAreaOpen={locAreaOpen}
                setRefreshData={setRefreshData}
                setLocAreaOpen={setLocAreaOpen}
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
                deleteService={IncomerDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </div>
    )
}
