import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MeterCategoryToolbar from './MeterCategoryToolbar';
import MeterCategoryModal from './MeterCategoryModal';
import { MeterCategoryShowList, MeterCategoryDelete } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';

const MeterCategoryMaster = () => {
    const [open, setOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState({});
    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        setIsLoading(true);
        MeterCategoryShowList(handleFetchSuccess, handleFetchException);
    }, [refreshData]);

    const handleFetchSuccess = (dataObject) => {
        setIsLoading(false);
        setCategoryList(dataObject?.data || []);
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
        { field: 'meterKind', headerName: 'Meter Kind', minWidth: 150, flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'categoryName', headerName: 'Category Name', minWidth: 200, flex: 1, align: 'center', headerAlign: 'center' },
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
            <MeterCategoryToolbar
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
            />
            <DataGrid
                rows={categoryList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            <MeterCategoryModal
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
                deleteService={MeterCategoryDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleFetchException}
            />
        </div>
    );
};

export default MeterCategoryMaster;
