
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { FetchMeterService, FetchTagService, deleteTagService } from '../../../Services/LoginPageService.js'
import { Card, CardContent } from '@mui/material';
import TagsToolbar from './TagsToolbar.js';
import TagsModal from './TagsModal.js';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';
import NotificationBar from '../../../Utility/NotificationBar.js';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { TagAddView, TagAddViewdelete } from '../../../Services/NodeJsApiServices.js';

export const TagsResults = () => {
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
            field: 'Tag_Name',
            headerName: 'Tag Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'deviceCategory',
            headerName: 'Category',
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
            field: 'slaveId',
            headerName: 'Slave Id',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'slaveInformation',
            headerName: 'Slave Information',
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
            field: 'jsonType',
            headerName: 'Json Type',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'warningMin',
            headerName: 'Warning Min',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'warningMax',
            headerName: 'Warning Max',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'outOfRangeMin',
            headerName: 'OutOfRange Min',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'outOfRangeMax',
            headerName: 'OutOfRange Max',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'criticalMin',
            headerName: 'Critical Min',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'criticalMax',
            headerName: 'Critical Max',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'alert',
            headerName: 'Alert',
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
    const [editData, setEditData] = useState([]);
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

    const handleSuccess = (dataObject) => {
        setGridLoading(false);
        setMeterList(dataObject.data);
    };

    const handleException = (errorObject) => {
    };

    useEffect(() => {
        setGridLoading(true);
        TagAddView(handleSuccess, handleException);
    }, [refreshData]);

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
                    setEditData(props.selectedRow);
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
                {props.selectedRow.alert === "1" ?
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

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };


    return (
        <div style={{ height: 500, width: '100%' }}>
            <TagsToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditData}
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
                style={{ backgroundColor: '#ffffff' }}
            />
            <TagsModal
                isAddButton={isAddButton}
                editData={editData}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={TagAddViewdelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
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
