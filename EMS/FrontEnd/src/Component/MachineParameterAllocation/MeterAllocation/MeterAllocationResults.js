
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { Box, Chip, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MeterAllocationModal from './MeterAllocationModal';
import MeterAlertConfigModal from './MeterAlertConfigModal';
import { MeterAllocationToolbar } from './MeterAllocationToolbar';
import NotificationBar from '../../Notification/NotificationBar.js';
import {
    MeterAllocationView,
    MeterAllocationViewdelete,
    UtilityMeterView,
    UtilityMeterViewdelete,
} from '../../../Services/NodeJsApiServices.js';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog.js';

/* ─── Section header strip ─────────────────────────────────────────── */
const SectionHeader = ({ icon, label, count, color }) => (
    <Box
        sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2, py: 1,
            backgroundColor: color.bg,
            borderLeft: `5px solid ${color.accent}`,
            borderRadius: '4px 4px 0 0',
        }}
    >
        {icon}
        <Typography sx={{ fontWeight: 700, color: color.text, fontFamily: 'Roboto Slab', fontSize: 15 }}>
            {label}
        </Typography>
        <Chip
            label={count}
            size="small"
            sx={{ ml: 1, backgroundColor: color.accent, color: '#fff', fontWeight: 700, fontSize: 12 }}
        />
    </Box>
);

/* ─── Energy Meter Columns ─────────────────────────────────────────── */
const buildEnergyColumns = (EditData, DeleteData) => [
    { field: 'sNo',           headerName: 'SL No',      width: 70,  align: 'center', headerAlign: 'center' },
    { field: 'plantName',     headerName: 'Plant',       flex: 1, minWidth: 110, align: 'center', headerAlign: 'center' },
    { field: 'incomerName',   headerName: 'Incomer',     flex: 1, minWidth: 170, align: 'center', headerAlign: 'center' },
    { field: 'distributorName', headerName: 'Distributor', flex: 1, minWidth: 150, align: 'center', headerAlign: 'center',
      renderCell: (p) => p.value || '—' },
    { field: 'feederName',    headerName: 'Feeder',      flex: 1, minWidth: 130, align: 'center', headerAlign: 'center',
      renderCell: (p) => p.value || '—' },
    { field: 'displayName',   headerName: 'Meter Name',  flex: 1, minWidth: 150, align: 'center', headerAlign: 'center' },
    { field: 'meterType',     headerName: 'Meter Type',  flex: 1, minWidth: 190, align: 'center', headerAlign: 'center' },
    { field: 'category',      headerName: 'Category',    minWidth: 100, align: 'center', headerAlign: 'center' },
    { field: 'edgeDeviceName',headerName: 'Device',      flex: 1, minWidth: 130, align: 'center', headerAlign: 'center' },
    { field: 'slaveId',       headerName: 'Slave Id',    width: 90,  align: 'center', headerAlign: 'center' },
    {
        field: 'actions', type: 'actions', headerName: 'Actions', width: 90,
        align: 'center', headerAlign: 'center',
        getActions: (params) => [
            <EditData selectedRow={params.row} />,
            <DeleteData selectedRow={params.row} />,
        ],
    },
];

/* ─── Utility Meter Columns ────────────────────────────────────────── */
const UTILITY_TYPE_COLOR = {
    'Water':          { bg: '#e3f2fd', text: '#0d47a1', border: '#90caf9' },
    'Gas':            { bg: '#fff3e0', text: '#e65100', border: '#ffcc02' },
    'Compressed Air': { bg: '#e0f7fa', text: '#006064', border: '#80deea' },
    'Fuel':           { bg: '#f3e5f5', text: '#4a148c', border: '#ce93d8' },
    'Steam':          { bg: '#ffebee', text: '#b71c1c', border: '#ef9a9a' },
    'Other':          { bg: '#eceff1', text: '#263238', border: '#b0bec5' },
};

const buildUtilityColumns = (EditData, DeleteData, AlertData) => [
    { field: 'sNo',           headerName: 'SL No',      width: 70,  align: 'center', headerAlign: 'center' },
    { field: 'plantName',     headerName: 'Plant',       flex: 1, minWidth: 120, align: 'center', headerAlign: 'center' },
    { field: 'buildingName',  headerName: 'Building',    flex: 1, minWidth: 120, align: 'center', headerAlign: 'center',
      renderCell: (p) => p.value || '—' },
    { field: 'meterName',     headerName: 'Meter Name',  flex: 1, minWidth: 150, align: 'center', headerAlign: 'center' },
    {
        field: 'meterType', headerName: 'Meter Type', flex: 1, minWidth: 150, align: 'center', headerAlign: 'center',
        // liveMeterType is read live via meterTypeId -> meter_type_master, so a rename
        // in the Meter Type CRUD shows up here immediately; p.value (the raw stored
        // string, still relied on by Water.js/PlantOverviewConsumptionPanel.js filters)
        // is only the fallback for a meter allocated before meterTypeId existed.
        renderCell: (p) => {
            const label = p.row.liveMeterType || p.value;
            const c = UTILITY_TYPE_COLOR[label] || UTILITY_TYPE_COLOR[p.value] || UTILITY_TYPE_COLOR['Other'];
            return (
                <Chip label={label} size="small"
                    sx={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`, fontWeight: 600, fontSize: 12 }}
                />
            );
        },
    },
    { field: 'edgeDeviceName', headerName: 'IO Model',  flex: 1, minWidth: 130, align: 'center', headerAlign: 'center' },
    { field: 'slaveId',        headerName: 'Slave Id',  width: 90,  align: 'center', headerAlign: 'center' },
    { field: 'uamSet',         headerName: 'UAM Set',   width: 100, align: 'center', headerAlign: 'center' },
    {
        field: 'threshold', headerName: 'Threshold', width: 110, align: 'center', headerAlign: 'center',
        renderCell: (p) => {
            const breached = p.row.uamSet && p.value && parseFloat(p.row.uamSet) > parseFloat(p.value);
            return (
                <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="body2">{p.value || '—'}</Typography>
                    {breached && <WarningAmberIcon sx={{ fontSize: 15, color: '#f57c00' }} />}
                </Box>
            );
        },
    },
    {
        field: 'minLimit', headerName: 'Min Limit', width: 100, align: 'center', headerAlign: 'center',
        renderCell: (p) => (p.value != null ? p.value : '—'),
    },
    {
        field: 'maxLimit', headerName: 'Max Limit', width: 100, align: 'center', headerAlign: 'center',
        renderCell: (p) => (p.value != null ? p.value : '—'),
    },
    {
        field: 'displayMeter', headerName: 'Display', width: 90, align: 'center', headerAlign: 'center',
        renderCell: (p) => (Number(p.value) === 0 ? 'No' : 'Yes'),
    },
    {
        field: 'actions', type: 'actions', headerName: 'Actions', width: 120,
        align: 'center', headerAlign: 'center',
        getActions: (params) => [
            <EditData selectedRow={params.row} />,
            <DeleteData selectedRow={params.row} />,
            <AlertData selectedRow={params.row} />,
        ],
    },
];

/* ─── DataGrid shared style ────────────────────────────────────────── */
const gridSx = (accentColor) => ({
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '0 0 4px 4px',
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: accentColor,
        color: '#fff',
        fontSize: 13,
        fontWeight: 700,
    },
    '& .MuiDataGrid-columnSeparator': { display: 'none' },
    '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#fafafa' },
    '& .MuiDataGrid-row:hover': { backgroundColor: '#f0f4ff' },
});

/* ─── Main Component ───────────────────────────────────────────────── */
export const MeterAllocationResults = () => {
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editMeter, setEditMeter] = useState([]);

    const [alertConfigOpen, setAlertConfigOpen] = useState(false);
    const [alertConfigRow, setAlertConfigRow] = useState(null);

    const [energyList, setEnergyList] = useState([]);
    const [utilityList, setUtilityList] = useState([]);
    const [isLoading, setGridLoading] = useState(true);

    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [deleteService, setDeleteService] = useState(() => MeterAllocationViewdelete);

    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    useEffect(() => {
        setGridLoading(true);
        MeterAllocationView((d) => { setEnergyList(d?.data || []); setGridLoading(false); }, () => setGridLoading(false));
        UtilityMeterView((d) => { setUtilityList(d?.data || []); }, () => {});
    }, [refreshData]);

    const addIndex = (rows) => rows.map((row, i) => ({ sNo: i + 1, ...row }));

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleDeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject.message });
        setTimeout(() => { handleClose(); setOpen(false); }, 2000);
        setRefreshData((v) => !v);
    };
    const handleDeleteException = (errorObject, errorMessage) => {
        setNotification({ status: true, type: 'error', message: errorMessage });
        setTimeout(() => { handleClose(); setOpen(false); }, 2000);
    };

    /* ── Energy edit/delete ── */
    function EnergyEditData(props) {
        return (
            <EditIcon style={{ cursor: 'pointer' }} onClick={(e) => {
                e.stopPropagation();
                setIsAddButton(false);
                setEditMeter({ ...props.selectedRow, meterKind: 'Energy Meter' });
                setOpen(true);
            }} />
        );
    }
    function EnergyDeleteData(props) {
        return (
            <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteService(() => MeterAllocationViewdelete);
                setDeleteDailogOpen(true);
            }} />
        );
    }

    /* ── Utility edit/delete ── */
    function UtilityEditData(props) {
        return (
            <EditIcon style={{ cursor: 'pointer' }} onClick={(e) => {
                e.stopPropagation();
                setIsAddButton(false);
                setEditMeter({ ...props.selectedRow, meterKind: 'Utility Meter' });
                setOpen(true);
            }} />
        );
    }
    function UtilityDeleteData(props) {
        return (
            <DeleteIcon style={{ cursor: 'pointer' }} onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteService(() => UtilityMeterViewdelete);
                setDeleteDailogOpen(true);
            }} />
        );
    }
    function UtilityAlertData(props) {
        return (
            <NotificationsActiveIcon style={{ cursor: 'pointer' }} titleAccess="Alert Settings" onClick={(e) => {
                e.stopPropagation();
                setAlertConfigRow(props.selectedRow);
                setAlertConfigOpen(true);
            }} />
        );
    }

    return (
        <div style={{ width: '100%' }}>
            <MeterAllocationToolbar
                setIsAddButton={setIsAddButton}
                setEditMeter={setEditMeter}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />

            {/* ══════════ ENERGY METER SECTION ══════════ */}
            <Box sx={{ mt: 2 }}>
                <SectionHeader
                    icon={<BoltIcon sx={{ color: '#2e7d32', fontSize: 22 }} />}
                    label="Energy Meter Allocation"
                    count={energyList.length}
                    color={{ bg: '#e8f5e9', accent: '#2e7d32', text: '#1b5e20' }}
                />
                <Box sx={{ height: 400 }}>
                    <DataGrid
                        rows={addIndex(energyList)}
                        columns={buildEnergyColumns(EnergyEditData, EnergyDeleteData)}
                        pageSize={5}
                        loading={isLoading}
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={gridSx('#2e7d32')}
                    />
                </Box>
            </Box>

            {/* ══════════ UTILITY METER SECTION ══════════ */}
            <Box sx={{ mt: 3 }}>
                <SectionHeader
                    icon={<WaterDropIcon sx={{ color: '#1565c0', fontSize: 22 }} />}
                    label="Utility Meter Allocation"
                    count={utilityList.length}
                    color={{ bg: '#e3f2fd', accent: '#1565c0', text: '#0d47a1' }}
                />
                <Box sx={{ height: 350 }}>
                    <DataGrid
                        rows={addIndex(utilityList)}
                        columns={buildUtilityColumns(UtilityEditData, UtilityDeleteData, UtilityAlertData)}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={gridSx('#1565c0')}
                    />
                </Box>
            </Box>

            <MeterAllocationModal
                isAddButton={isAddButton}
                meterData={editMeter}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />

            <MeterAlertConfigModal
                open={alertConfigOpen}
                setOpen={setAlertConfigOpen}
                row={alertConfigRow}
                setRefreshData={setRefreshData}
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
                deleteService={deleteService}
                handleSuccess={handleDeleteSuccess}
                handleException={handleDeleteException}
            />
        </div>
    );
};
