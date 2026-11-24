import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Fab, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AlertRecipientsModal from './AlertRecipientsModal';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../Utility/NotificationBar';
import { AlertRecipientsShow, AlertRecipientsDelete, MeterTypeShowList } from '../../Services/NodeJsApiServices';

// Always offered even if not yet in the Meter Type master — these are the types the alert crons handle.
const DEFAULT_TYPES = ['Temperature', 'Humidity', 'CO2', 'Pressure'];

const AlertRecipients = () => {
    const [rows, setRows] = useState([]);
    const [meterTypeOptions, setMeterTypeOptions] = useState(DEFAULT_TYPES);
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState(null);
    const [refreshData, setRefreshData] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        AlertRecipientsShow((d) => setRows(d?.data || []), () => {});
    }, [refreshData]);

    useEffect(() => {
        MeterTypeShowList((d) => {
            const fromMaster = (d?.data || []).map((m) => m.meterType).filter(Boolean);
            setMeterTypeOptions([...new Set([...DEFAULT_TYPES, ...fromMaster])]);
        }, () => {});
    }, []);

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleDeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setRefreshData((v) => !v);
        setTimeout(() => { handleClose(); setDeleteOpen(false); }, 1500);
    };

    const yesNo = (v) => (
        <Chip size="small" label={Number(v) === 1 ? 'On' : 'Off'}
            sx={{ backgroundColor: Number(v) === 1 ? '#e8f5e9' : '#eceff1', color: Number(v) === 1 ? '#2e7d32' : '#607d8b', fontWeight: 600 }} />
    );

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 140 },
        { field: 'email', headerName: 'Email', flex: 1.3, minWidth: 190, renderCell: (p) => p.value || '—' },
        { field: 'phone', headerName: 'Mobile', flex: 1, minWidth: 130, renderCell: (p) => p.value || '—' },
        {
            field: 'meterTypes', headerName: 'Meter Types', flex: 1.6, minWidth: 220, sortable: false,
            renderCell: (p) => (p.value && p.value.length
                ? <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{p.value.map((t) => <Chip key={t} label={t} size="small" />)}</Box>
                : <Typography variant="caption" color="text.secondary">Not assigned to any meter type</Typography>),
        },
        { field: 'emailEnabled', headerName: 'Email', width: 90, align: 'center', headerAlign: 'center', renderCell: (p) => yesNo(p.value) },
        { field: 'smsEnabled', headerName: 'SMS', width: 90, align: 'center', headerAlign: 'center', renderCell: (p) => yesNo(p.value) },
        { field: 'status', headerName: 'Active', width: 90, align: 'center', headerAlign: 'center', renderCell: (p) => yesNo(p.value) },
        {
            field: 'actions', type: 'actions', headerName: 'Actions', width: 100,
            getActions: (params) => [
                <EditIcon style={{ cursor: 'pointer' }} onClick={() => { setIsAddButton(false); setEditData(params.row); setOpen(true); }} />,
                <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => { setDeleteId(params.row.id); setDeleteOpen(true); }} />,
            ],
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2, alignItems: 'center', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', backgroundColor: '#f8f8ff', padding: '15px', border: '1px solid #e0e0e0' }}>
                <Typography variant="h5" component="span" fontFamily="Roboto Slab">Alert Recipients</Typography>
                <Box onClick={() => { setIsAddButton(true); setEditData(null); setOpen(true); }}>
                    <Stack direction="row" spacing={2}>
                        <Fab variant="extended" size="medium" color="primary" aria-label="add"
                            sx={{ backgroundColor: '#051622', color: '#ffff', '&:hover': { backgroundColor: '#183b52' } }}>
                            <AddIcon sx={{ mr: 1 }} />
                            Add Recipient
                        </Fab>
                    </Stack>
                </Box>
            </Box>

            <Box sx={{ height: 520 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={8}
                    rowsPerPageOptions={[8, 25, 50]}
                    disableSelectionOnClick
                    getRowId={(row) => row.id}
                    sx={{ backgroundColor: '#fff' }}
                />
            </Box>

            <AlertRecipientsModal
                open={open}
                setOpen={setOpen}
                isAddButton={isAddButton}
                editData={editData}
                meterTypeOptions={meterTypeOptions}
                setRefreshData={setRefreshData}
            />

            <DeleteConfirmationDailog
                open={deleteOpen}
                setOpen={setDeleteOpen}
                deleteId={deleteId}
                deleteService={AlertRecipientsDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={() => {}}
            />

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Box>
    );
};

export default AlertRecipients;
