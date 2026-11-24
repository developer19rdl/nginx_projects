

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import BuildingModel from './RegionModel';
import NotificationBar from '../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import AddLocArea from './AddLocArea';
import { BuildingToolbar, RegionToolbar } from './RegionToolbar';
import RegionModel from './RegionModel';
import { RegionDelete, RegionShow } from '../../Services/NodeJsApiServices';


const RegionResult = () => {

    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [editData, setEditData] = useState([]);

    const [showData, setShowData] = useState([]);
    const [isLoading, setGridLoading] = useState(true);
    const [refreshData, setRefreshData] = useState(false);
    const [locAreaOpen, setLocAreaOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [id, setId] = useState('');
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        RegionShow(handleLocationsShowSucess, handleLocationsShowException);
    }, [refreshData]);

    const handleLocationsShowSucess = (dataObject) => {
        setGridLoading(false);
        setShowData(dataObject.data || []);

    }

    const handleLocationsShowException = () => {

    }
    const columns = [
        {
            field: 'regionName',
            headerName: 'REGION',
            type: 'string',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },
        {
            field: 'description',
            headerName: 'DESCRIPTION',
            type: 'number',
            sortable: true,
            headerClassName: 'super-app-theme--header',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
        },

        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerClassName: 'super-app-theme--header',
            width: 100,
            cellClassName: 'actions',
            disableClickEventBubbling: true,
            getActions: (params) => [
                <AddLocationA selectedRow={params.row} />,
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,

            ],
        },
    ];
    const rows = [
        {
            id: 1,
            regionName: 'North Zone',
            description: 'Covers northern districts',
        },
        {
            id: 2,
            regionName: 'South Zone',
            description: 'Includes southern coastal areas',
        },
        {
            id: 3,
            regionName: 'East Zone',
            description: 'Covers eastern corridor',
        },
        {
            id: 4,
            regionName: 'West Zone',
            description: 'Covers western regions',
        },
        {
            id: 5,
            regionName: 'Central Zone',
            description: 'Central state operations',
        },
    ];



    function AddLocationA(props) {
        return (
            <AddLocationAltIcon onClick={(e) => {
                e.stopPropagation();
                setLocAreaOpen(true);
                setEditData(props.selectedRow);

            }} />
        )
    }

    function EditData(props) {
        return (
            <EditIcon

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
                    setConfirmOpen(true);
                }}

            />
        );
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const onDeleteSelet = () => {
        // RegionDelete({ id }, DeleteSuccess, DeleteException);
    }
    const DeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject?.message,
        });
        setTimeout(() => {
            setRefreshData(oldvalue => !oldvalue);
            handleClose();
        }, 2000);

    }
    const DeleteException = () => {

    }
    return (
        <div style={{ height: 400, width: '100%' }}>
            <RegionToolbar
                setIsAddButton={setIsAddButton}
                setEditData={setEditData}
                setOpen={setOpen}
            />
            <DataGrid
                style={{ border: 'none', color: 'black', backgroundColor: '#ffffff' }}

                rows={showData}
                columns={columns}
                pageSize={8}
                // loading={isLoading}
                rowsPerPageOptions={[8]}
                disableSelectionOnClick
            // sx={{
            //     height: '100%',
            //     minHeight: '480px',

            //     width: '100%',
            //     '& .super-app-theme--header': {
            //         WebkitTextStrokeWidth: '0.6px',

            //     },
            // }}
            />

            <RegionModel
                isAddButton={isAddButton}
                editData={editData}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
            />

            <AddLocArea
                editData={editData}
                locAreaOpen={locAreaOpen}
                setRefreshData={setRefreshData}
                setLocAreaOpen={setLocAreaOpen}
            />
            <DeleteConfirmationDailog
                open={confirmOpen}
                setOpen={setConfirmOpen}
                deleteId={id}
                deleteService={RegionDelete}
                handleSuccess={DeleteSuccess}
                handleException={DeleteException}
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

export default RegionResult