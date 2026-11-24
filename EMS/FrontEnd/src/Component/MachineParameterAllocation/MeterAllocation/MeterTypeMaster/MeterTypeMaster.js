import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MeterTypeToolbar from './MeterTypeToolbar';
import MeterTypeModal from './MeterTypeModal';
import { MeterTypeShowList, MeterTypeDelete } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';

const MeterTypeMaster = () => {
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState({});
    const [meterTypeList, setMeterTypeList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        setIsLoading(true);
        MeterTypeShowList(handleFetchSuccess, handleFetchException);
    }, [refreshData]);

    const handleFetchSuccess = (dataObject) => {
        setIsLoading(false);
        setMeterTypeList(dataObject?.data || []);
    };

    const handleFetchException = () => setIsLoading(false);

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleDeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setRefreshData((v) => !v);
        setTimeout(() => {
            handleClose();
            setDeleteDialogOpen(false);
        }, 2000);
    };

    function EditData({ selectedRow }) {
        return (
            <EditIcon
                sx={{ cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsAddButton(false);
                    setEditData(selectedRow);
                    setOpen(true);
                }}
            />
        );
    }

    function DeleteData({ selectedRow }) {
        return (
            <DeleteIcon
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                    setDeleteId(selectedRow.id);
                    setDeleteDialogOpen(true);
                }}
            />
        );
    }

    const columns = [
        { field: 'id', headerName: 'S.No', minWidth: 80, align: 'center', headerAlign: 'center' },
        { field: 'categoryName', headerName: 'Category', minWidth: 160, flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'meterType', headerName: 'Meter Type', minWidth: 200, flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 120,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    return (
        <div style={{ height: 450, width: '100%' }}>
            <MeterTypeToolbar
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
            />
            <DataGrid
                rows={meterTypeList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            <MeterTypeModal
                open={open}
                setOpen={setOpen}
                isAddButton={isAddButton}
                editData={editData}
                setRefreshData={setRefreshData}
            />
            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
            <DeleteConfirmationDailog
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                deleteId={deleteId}
                deleteService={MeterTypeDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleFetchException}
            />
        </div>
    );
};

export default MeterTypeMaster;
