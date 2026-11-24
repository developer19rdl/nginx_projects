import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Checkbox,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Grid
} from '@mui/material';
import { MeterBuildingShowList, MetterMappingList, SubCategoryDelete, SubCategoryShowList } from '../../Services/NodeJsApiServices';
import { DataGrid } from '@mui/x-data-grid';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../Utility/NotificationBar';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MeterGrouping from './MeterGrouping';


const SubCategoryView = ({
    open,
    setOpen,
    editConfigSetup,
    setEditConfigSetup
}) => {


    const columnsSub = [
        {
            field: 'categoryName',
            headerName: 'Category Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            headerClassName: 'bold-header',

        },
        {
            field: 'subCategoryName',
            headerName: 'SubCategory Name',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            headerClassName: 'bold-header',

        },
        {
            field: 'subCategoryDesc',
            headerName: 'Description',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center',
            headerClassName: 'bold-header',

        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 120,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <DeleteData selectedRow={params.row} />,
                <MetaData selectedRow={params.row} />,
                // <ViewSubData selectedRow={params.row} />,
            ],
        },

    ];
    function DeleteData(props) {
        return (
            <DeleteIcon
                onClick={() => {
                    setDeleteId(props.selectedRow.id);
                    setDeleteDailogOpen(true);
                }}
            />
        );
    }


    function MetaData(props) {
        return (
            <ControlPointIcon
                onClick={(event) => {
                    event.stopPropagation();
                    setEditSubCategorySetup(props.selectedRow);
                    setMeterOpen(true);
                }}
            />
        );
    }
    const [deleteId, setDeleteId] = useState('');
    const [editsubCategorySetup, setEditSubCategorySetup] = useState([]);

    const [leftChecked, setLeftChecked] = useState([]);
    const [rightChecked, setRightChecked] = useState([]);
    const [rightMeters, setRightMeters] = useState([]); // grouped meters
    const [availableMeters, setAvailableMeters] = useState([]); // meters under selected building
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [subCategoryShow, setSubCategoryShow] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [meterOpen, setMeterOpen] = useState(false);
    const [refreshData, setRefreshData] = useState(false);

    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });
    // Filter to show only meters not yet grouped on the left


    const handleDialogClose = () => {
        setOpen(false);

    };
    useEffect(() => {
        setOpen(open);
        if (open) {
            SubCategoryShowList({
                categoryId: editConfigSetup.id
            },
                handleSubCategorySuccess, handleSubCategoryException);

        }
    }, [open]);

    const handleSubCategorySuccess = (dataObject) => {
        setSubCategoryShow(dataObject?.data || []);
    }
    const handleSubCategoryException = () => { }

    // When fetching available meters for a building
    const handleAvailableSuccess = (dataObject) => {
        setAvailableMeters(dataObject?.data || []);
        setRightMeters([]);
        setLeftChecked([]);
        setRightChecked([]);
    }
    const handleAvailableException = () => { }

    // When mapping selection to grouped meters
    const handleDeleteSuccess = (dataObject) => {
        setNotification({ status: true, type: 'success', message: dataObject?.message || 'Deleted' });
        setRefreshData((old) => !old);
        setTimeout(() => {
            handleClose();
            setOpen(false);
        }, 1000);
    };

    const handleException = () => { };
    const handleClose = () => {
        setNotification({ status: false, type: '', message: '' });
    };
    return (
        <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
            <DialogTitle style={{fontSize:'23px',fontWeight:'400'}}>Sub CategoryList</DialogTitle>
            <DialogContent>
                <Box display="flex" gap={2} mb={2} mt={1}>
                    {}
                    <DataGrid
                        rows={subCategoryShow}
                        columns={columnsSub}
                        pageSize={5}
                        loading={isLoading}
                        rowsPerPageOptions={[5]}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                fontWeight: 'bold',    // ✅ Bold column headers
                                fontSize: '15px',      // optional: increase font size
                                backgroundColor: '#f5f5f5', // optional: light header bg
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',    // ✅ ensures actual text is bold
                            },
                        }}
                    />

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDialogClose} color="secondary">Close</Button>

            </DialogActions>
            <MeterGrouping
                // isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                editsubCategorySetup={editsubCategorySetup}
                open={meterOpen}
                setOpen={setMeterOpen}
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
                deleteService={SubCategoryDelete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </Dialog>
    );
};

export default SubCategoryView;
