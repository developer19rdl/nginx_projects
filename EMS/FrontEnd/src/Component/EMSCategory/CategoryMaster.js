
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import CategoryMasterModal from './CategoryMasterModal';
import CategoryToolbar from './CategoryToolbar';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../Utility/NotificationBar';
import MeterGrouping from './MeterGrouping';
import { CategoryShowList, CategoryDelete } from '../../Services/NodeJsApiServices';
import SubCategoryView from './SubCategoryView';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip, Box, Typography } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

/* ─── Section header strip ─────────────────────────────────────────── */
const SectionHeader = ({ icon, label, count, color }) => (
    <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1,
        px: 2, py: 1,
        backgroundColor: color.bg,
        borderLeft: `5px solid ${color.accent}`,
        borderRadius: '4px 4px 0 0',
    }}>
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

/* ─── shared DataGrid sx ───────────────────────────────────────────── */
const gridSx = (accent) => ({
    border: 'none',
    borderRadius: '0 0 4px 4px',
    '& .MuiDataGrid-columnHeaders': { backgroundColor: accent, color: '#fff', fontSize: 13, fontWeight: 700 },
    '& .MuiDataGrid-columnSeparator': { display: 'none' },
    '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: '#fafafa' },
    '& .MuiDataGrid-row:hover': { backgroundColor: '#f0f4ff' },
});

const CategoryMaster = () => {
    const [open, setOpen] = useState(false);
    const [meterOpen, setMeterOpen] = useState(false);
    const [SubcategoryView, setSubCategoryView] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [mainList, setMainList] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    useEffect(() => {
        setGridLoading(true);
        CategoryShowList(handleMainSuccess, handleMainException);
    }, [refreshData]);

    const handleMainSuccess = (dataObject) => {
        setMainList(dataObject?.data || []);
        setGridLoading(false);
    };
    const handleMainException = () => setGridLoading(false);

    /* ─── Split rows ─── */
    const energyRows = mainList.filter((r) => !r.categoryKind || r.categoryKind === 'Energy Meter');
    const utilityRows = mainList.filter((r) => r.categoryKind === 'Utility Meter');

    /* ─── Column builder ─── */
    const buildColumns = () => [
        { field: 'categoryName', headerName: 'Category Name', minWidth: 170, align: 'center', flex: 1, headerAlign: 'center' },
        { field: 'categoryDesc', headerName: 'Description',   minWidth: 170, align: 'center', flex: 1, headerAlign: 'center' },
        {
            field: 'sortOrder', headerName: 'Display Order', minWidth: 120, align: 'center', flex: 1, headerAlign: 'center',
            renderCell: (params) => (params.value != null ? params.value : '—'),
        },
        {
            field: 'actions', type: 'actions', headerName: 'Actions',
            minWidth: 120, align: 'center', flex: 1, cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
                <MetaData selectedRow={params.row} />,
                <ViewSubData selectedRow={params.row} />,
            ],
        },
    ];

    const [openNotification, setNotification] = useState({ status: false, type: 'error', message: '' });

    function DeleteData(props) {
        return (
            <DeleteIcon onClick={() => { setDeleteId(props.selectedRow.id); setDeleteDailogOpen(true); }} />
        );
    }
    function EditData(props) {
        return (
            <EditIcon onClick={(e) => {
                e.stopPropagation();
                setIsAddButton(false);
                setEditConfigSetup(props.selectedRow);
                setOpen(true);
            }} />
        );
    }
    function MetaData(props) {
        return (
            <ControlPointIcon onClick={(e) => {
                e.stopPropagation();
                setIsAddButton(false);
                setEditConfigSetup(props.selectedRow);
                setMeterOpen(true);
            }} />
        );
    }
    function ViewSubData(props) {
        return (
            <VisibilityIcon onClick={(e) => {
                e.stopPropagation();
                setSubCategoryView(true);
                setEditConfigSetup(props.selectedRow);
            }} />
        );
    }

    const handleClose = () => setNotification({ status: false, type: '', message: '' });

    const handleDeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Deleted' });
        setRefreshData((old) => !old);
        setTimeout(() => { handleClose(); setDeleteDailogOpen(false); }, 1000);
    };
    const handleException = () => {};

    return (
        <div style={{ width: '100%' }}>
            <CategoryToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            />

            {/* ══════════ ENERGY METER CATEGORIES ══════════ */}
            <Box sx={{ mt: 2 }}>
                <SectionHeader
                    icon={<BoltIcon sx={{ color: '#2e7d32', fontSize: 22 }} />}
                    label="Energy Meter Categories"
                    count={energyRows.length}
                    color={{ bg: '#e8f5e9', accent: '#2e7d32', text: '#1b5e20' }}
                />
                <Box sx={{ height: 350, backgroundColor: '#f9fbe7' }}>
                    <DataGrid
                        rows={energyRows}
                        columns={buildColumns()}
                        pageSize={5}
                        loading={isLoading}
                        rowsPerPageOptions={[5, 10, 100]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={gridSx('#2e7d32')}
                    />
                </Box>
            </Box>

            {/* ══════════ UTILITY METER CATEGORIES ══════════ */}
            <Box sx={{ mt: 3 }}>
                <SectionHeader
                    icon={<WaterDropIcon sx={{ color: '#1565c0', fontSize: 22 }} />}
                    label="Utility Meter Categories"
                    count={utilityRows.length}
                    color={{ bg: '#e3f2fd', accent: '#1565c0', text: '#0d47a1' }}
                />
                <Box sx={{ height: 350, backgroundColor: '#e8eaf6' }}>
                    <DataGrid
                        rows={utilityRows}
                        columns={buildColumns()}
                        pageSize={5}
                        loading={isLoading}
                        rowsPerPageOptions={[5, 10, 100]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={gridSx('#1565c0')}
                    />
                </Box>
            </Box>

            {/* ─── Dialogs ─── */}
            <CategoryMasterModal
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
            />

            <MeterGrouping
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                open={meterOpen}
                setOpen={setMeterOpen}
                setRefreshData={setRefreshData}
                handleClose={handleClose}
                openNotification={openNotification}
                setNotification={setNotification}
            />

            <SubCategoryView
                open={SubcategoryView}
                setOpen={setSubCategoryView}
                editConfigSetup={editConfigSetup}
                setEditConfigSetup={setEditConfigSetup}
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
                deleteService={CategoryDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
};

export default CategoryMaster;
