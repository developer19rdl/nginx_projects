import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Chip } from '@mui/material';
import CorrectiveActionRecToolbar from './CorrectiveActionRecToolbar';
import CorrectiveActionRecModal from './CorrectiveActionRecModal';
import DeleteConfirmationDialog from '../../../Utility/DeleteConfirmationDailog';
import { EnergyCorrFetchService, EnergyCorrDeleteService } from '../../APIservice';

const priorityColor = { HIGH: 'error', MEDIUM: 'warning', LOW: 'success' };
const statusColor = { PENDING: 'default', IN_PROGRESS: 'primary', COMPLETED: 'success' };

const CorrectiveActionRecList = () => {
    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState({});
    const [deleteId, setDeleteId] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [notification, setNotification] = useState({ status: false, type: 'success', message: '' });

    const columns = [
        { field: 'condition_type', headerName: 'Condition', flex: 1, minWidth: 150, align: 'center', headerAlign: 'center',
            renderCell: p => p.value?.replace(/_/g, ' ') },
        { field: 'condition_description', headerName: 'Description', flex: 1.5, minWidth: 160, align: 'center', headerAlign: 'center' },
        { field: 'recommended_action', headerName: 'Recommended Action', flex: 1.5, minWidth: 180, align: 'center', headerAlign: 'center' },
        { field: 'asset_name', headerName: 'Asset', flex: 0.9, minWidth: 100, align: 'center', headerAlign: 'center' },
        { field: 'device_name', headerName: 'Device', flex: 0.9, minWidth: 100, align: 'center', headerAlign: 'center' },
        {
            field: 'priority', headerName: 'Priority', flex: 0.7, minWidth: 80, align: 'center', headerAlign: 'center',
            renderCell: p => <Chip label={p.value} color={priorityColor[p.value] || 'default'} size="small" />,
        },
        {
            field: 'status', headerName: 'Status', flex: 0.9, minWidth: 110, align: 'center', headerAlign: 'center',
            renderCell: p => <Chip label={p.value?.replace(/_/g, ' ')} color={statusColor[p.value] || 'default'} size="small" />,
        },
        { field: 'assigned_to', headerName: 'Assigned To', flex: 0.9, minWidth: 110, align: 'center', headerAlign: 'center' },
        { field: 'action_date', headerName: 'Action Date', flex: 0.8, minWidth: 100, align: 'center', headerAlign: 'center' },
        { field: 'energy_saved', headerName: 'Energy Saved (kWh)', flex: 0.9, minWidth: 130, align: 'center', headerAlign: 'center' },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', minWidth: 90, flex: 0.7,
            getActions: (params) => [
                <EditIcon sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={() => {
                    setIsAddButton(false); setEditData(params.row); setOpen(true);
                }} />,
                <DeleteIcon sx={{ cursor: 'pointer', color: 'error.main' }} onClick={() => {
                    setDeleteId(params.row.id); setDeleteDialogOpen(true);
                }} />,
            ],
        },
    ];

    useEffect(() => {
        EnergyCorrFetchService(
            (res) => { setIsLoading(false); setRows(res?.data || []); },
            () => setIsLoading(false)
        );
    }, [refreshData]);

    const handleDeleteSuccess = (res) => {
        setNotification({ status: true, type: 'success', message: res.message });
        setRefreshData(v => !v);
        setTimeout(() => { setDeleteDialogOpen(false); setNotification({ status: false, type: '', message: '' }); }, 2000);
    };

    const handleDeleteError = (_, msg) => {
        setNotification({ status: true, type: 'error', message: msg || 'Delete failed' });
    };

    return (
        <div>
            <CorrectiveActionRecToolbar setIsAddButton={setIsAddButton} setEditData={setEditData} setOpen={setOpen} />

            {notification.status && (
                <div style={{ padding: '8px 12px', marginBottom: 8, borderRadius: 4,
                    background: notification.type === 'success' ? '#e8f5e9' : '#ffebee',
                    color: notification.type === 'success' ? '#2e7d32' : '#c62828', fontSize: 14 }}>
                    {notification.message}
                </div>
            )}

            <div style={{ height: 450, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={7}
                    rowsPerPageOptions={[7]}
                    loading={isLoading}
                    disableSelectionOnClick
                />
            </div>

            <CorrectiveActionRecModal
                open={open}
                setOpen={setOpen}
                isAddButton={isAddButton}
                editData={editData}
                setRefreshData={setRefreshData}
                setNotification={setNotification}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                setOpen={setDeleteDialogOpen}
                deleteId={deleteId}
                deleteService={(obj, success, error) => EnergyCorrDeleteService(obj.id, success, error)}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteError}
            />
        </div>
    );
};

export default CorrectiveActionRecList;
