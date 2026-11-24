import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
    Button, Box, Dialog, DialogContent, DialogTitle, DialogActions, Checkbox, Grid
} from '@mui/material';
import NotificationBar from '../../GlobleFiles/ServiceNotificationBar';
import { DataGrid } from '@mui/x-data-grid';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GetGroupMenu, GroupRightSubmit } from '../../../ApiService/LoginPageService';

// Local state Checkbox with zero-render impact on parent grid
const LocalCheckbox = React.memo(({ rowId, field, initialValue, onPermissionChange, menuListRef }) => {
    const [checked, setChecked] = useState(initialValue);

    // Keep checked state in sync if data changes externally
    useEffect(() => {
        setChecked(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
        const nextVal = e.target.checked;
        setChecked(nextVal); // Instant visual update

        // Mutate grid reference directly to avoid triggering expensive grid re-renders
        const item = menuListRef.current.find(x => x.id === rowId);
        if (item) {
            item[field] = nextVal ? 1 : 0;
            onPermissionChange(item);
        }
    };

    return (
        <Checkbox
            checked={checked}
            style={{ color: checked ? '#32cd32' : '#696969' }}
            onChange={handleChange}
        />
    );
});

// Standalone component that handles list loading and Grid rendering
// Mounts/unmounts dynamically based on accordion expansion state to lazy load data
const MenuCategoryGridContent = React.memo(({ 
    type, 
    selectedRowCode, 
    onPermissionChange, 
    permisionModalOpen 
}) => {
    const [menuList, setMenuList] = useState([]);
    const menuListRef = useRef([]);

    useEffect(() => {
        let active = true;
        if (permisionModalOpen && selectedRowCode) {
            GetGroupMenu({ type, code: selectedRowCode }, (res) => {
                if (active) {
                    const data = res?.data || [];
                    setMenuList(data);
                    menuListRef.current = data; // Set mutable ref for zero-render mutations
                }
            }, () => {});
        }
        return () => {
            active = false;
        };
    }, [permisionModalOpen, type, selectedRowCode]);

    const getRowClassName = useCallback((params) => {
        const rowIndex = menuList.findIndex(row => row.id === params.row.id);
        if (rowIndex !== -1) {
            return rowIndex % 2 === 0 ? 'Mui-evenRow' : 'Mui-oddRow';
        }
        return '';
    }, [menuList]);

    const columns = useMemo(() => [
        {
            field: 'menuName',
            headerClassName: 'super-app-theme--header',
            headerName: 'Menu',
            type: 'string',
            sortable: true,
            width: 250,
            align: 'center',
            headerAlign: 'center'
        },
        ...[
            { field: 'addData', name: 'Add' },
            { field: 'updateData', name: 'Edit' },
            { field: 'deleteData', name: 'Delete' },
            { field: 'printData', name: 'Print' },
            { field: 'viewData', name: 'View' },
            { field: 'authData', name: 'Auth' },
            { field: 'auth1Data', name: 'Auth1' },
            { field: 'opt1Data', name: 'Opt1' },
            { field: 'opt2Data', name: 'Opt2' },
            { field: 'opt3Data', name: 'Opt3' },
            { field: 'opt4Data', name: 'Opt4' },
            { field: 'opt5Data', name: 'Opt5' }
        ].map(({ field, name }) => ({
            field,
            headerClassName: 'super-app-theme--header',
            headerName: name,
            type: 'number',
            sortable: false,
            minWidth: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <LocalCheckbox
                    rowId={params.row.id}
                    field={field}
                    initialValue={Number(params.row[field]) === 1}
                    onPermissionChange={onPermissionChange}
                    menuListRef={menuListRef}
                />
            )
        }))
    ], [onPermissionChange]);

    return (
        <Grid container>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                <Box
                    sx={{
                        height: 400,
                        width: '100%',
                        '& .super-app-theme--header': {
                            backgroundColor: '#93bce6',
                            color: '#1c1919'
                        },
                    }}
                >
                    <DataGrid
                        rows={menuList}
                        columns={columns}
                        pageSize={8}
                        rowsPerPageOptions={[8]}
                        disableSelectionOnClick
                        style={{ border: 'none' }}
                        sx={{
                            overflow: 'auto',
                            height: '100%',
                            minHeight: '390px',
                            width: '100%',
                            '& .super-app-theme--header': {
                                WebkitTextStrokeWidth: '0.6px',
                            },
                            '& .MuiDataGrid-cell': {
                                border: '1px solid #969696',
                            },
                            '& .MuiDataGrid-columnHeader': {
                                border: '1px solid #969696',
                            },
                        }}
                        getRowClassName={getRowClassName}
                        rowHeight={40}
                        columnHeaderHeight={40}
                    />
                </Box>
            </Grid>
        </Grid>
    );
});

// Category Accordion Section wrapper
const MenuCategorySection = React.memo(({ 
    title, 
    type, 
    selectedRowCode, 
    onPermissionChange, 
    isExpanded, 
    onAccordionChange, 
    permisionModalOpen 
}) => {
    return (
        <Accordion expanded={isExpanded} onChange={onAccordionChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                style={{ fontWeight: 'bold' }}
            >
                {title}
            </AccordionSummary>
            <AccordionDetails>
                {isExpanded && (
                    <MenuCategoryGridContent
                        type={type}
                        selectedRowCode={selectedRowCode}
                        onPermissionChange={onPermissionChange}
                        permisionModalOpen={permisionModalOpen}
                    />
                )}
            </AccordionDetails>
        </Accordion>
    );
});

const PermissionModal = ({
    permisionModalOpen, setPermissionModalOpen, selectedRowId, selectedRowCode, setSelectedRowCode
}) => {
    // Accordions state management for on-demand expanded state
    const [expandedPanels, setExpandedPanels] = useState({
        transactions: true,
        masters: false,
        reports: false,
        utilities: false
    });

    // Reset default open accordion when modal toggles
    useEffect(() => {
        if (permisionModalOpen) {
            setExpandedPanels({
                transactions: true,
                masters: false,
                reports: false,
                utilities: false
            });
        }
    }, [permisionModalOpen]);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedPanels(prev => ({
            ...prev,
            [panel]: isExpanded
        }));
    };

    // Buffers modified permission objects without triggering parent re-renders
    const transactionTempRef = useRef([]);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handlePermissionChange = useCallback((updatedItem) => {
        const idx = transactionTempRef.current.findIndex(x => x.id === updatedItem.id);
        if (idx !== -1) {
            transactionTempRef.current[idx] = updatedItem;
        } else {
            transactionTempRef.current.push(updatedItem);
        }
    }, []);

    const handleCloseNotification = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        GroupRightSubmit({
            data: transactionTempRef.current
        }, (res) => {
            setNotification({
                status: true,
                type: 'success',
                message: res?.messages || 'Permissions updated successfully!',
            });
            setTimeout(() => {
                setPermissionModalOpen(false);
                if (setSelectedRowCode) setSelectedRowCode('');
                transactionTempRef.current = [];
                handleCloseNotification();
            }, 1000);
        }, (err, msg) => {
            setNotification({
                status: true,
                type: 'error',
                message: msg || 'Failed to update permissions.',
            });
        });
    };

    return (
        <Dialog
            sx={{ width: '100%' }}
            maxWidth="xl"
            open={permisionModalOpen}
            fullWidth
            PaperProps={{ style: { height: '80vh', width: '100%', maxHeight: 'none' } }}
        >
            <DialogTitle style={{ background: '#002D68', color: 'white' }}>
                Permissions
            </DialogTitle>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <DialogContent style={{ paddingTop: '20px' }}>
                    {permisionModalOpen && (
                        <>
                            <MenuCategorySection
                                title="Transaction"
                                type="Transactions"
                                selectedRowCode={selectedRowCode}
                                onPermissionChange={handlePermissionChange}
                                isExpanded={expandedPanels.transactions}
                                onAccordionChange={handleAccordionChange('transactions')}
                                permisionModalOpen={permisionModalOpen}
                            />
                            <MenuCategorySection
                                title="Masters"
                                type="Masters"
                                selectedRowCode={selectedRowCode}
                                onPermissionChange={handlePermissionChange}
                                isExpanded={expandedPanels.masters}
                                onAccordionChange={handleAccordionChange('masters')}
                                permisionModalOpen={permisionModalOpen}
                            />
                            <MenuCategorySection
                                title="Reports"
                                type="Reports"
                                selectedRowCode={selectedRowCode}
                                onPermissionChange={handlePermissionChange}
                                isExpanded={expandedPanels.reports}
                                onAccordionChange={handleAccordionChange('reports')}
                                permisionModalOpen={permisionModalOpen}
                            />
                            <MenuCategorySection
                                title="Utilities"
                                type="Utilities"
                                selectedRowCode={selectedRowCode}
                                onPermissionChange={handlePermissionChange}
                                isExpanded={expandedPanels.utilities}
                                onAccordionChange={handleAccordionChange('utilities')}
                                permisionModalOpen={permisionModalOpen}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        type="submit"
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                    >
                        Submit
                    </Button>
                    <Button
                        variant="contained"
                        style={{ width: '150px', background: '#002D68', color: 'white' }}
                        onClick={() => {
                            setPermissionModalOpen(false);
                            if (setSelectedRowCode) setSelectedRowCode('');
                            transactionTempRef.current = [];
                        }}
                    >
                        Cancel
                    </Button>
                </DialogActions>
            </form>
            <NotificationBar
                handleClose={handleCloseNotification}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    );
};

export default PermissionModal;