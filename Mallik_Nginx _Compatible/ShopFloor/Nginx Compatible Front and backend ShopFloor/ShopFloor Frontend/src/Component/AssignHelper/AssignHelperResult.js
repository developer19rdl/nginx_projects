import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
// import { DepartmentDeleteType, DepartmentList, OperatortDeleteType, OperatortList } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../Utility/DeleteConfirmationDailog';
import HttpsIcon from '@mui/icons-material/Https';
import { Tooltip } from '@mui/material';
import AssignHelperToolbar from './AssignHelperToolbar';
import AssignHelperModal from './AssignHelperModal';
import { AssignHelperDeleteService, ShowAssignHelperList } from '../../Services/LoginPageService';

const AssignHelperResult = () => {
    const columns = [
        {
            field: 'machineName',
            headerName: 'Machine',
            // width: 150,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },

        {
            field: 'helperCount',
            headerName: 'Helper Count',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'helperPerHrCost',
            headerName: 'Helper/PerHalf Cost',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerAlign: 'center',
            // width: 180,
            flex: 1,
            align: 'center',
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
                // <Password selectedRow={params.row} />,
            ],
        },
    ];
    const EditData = (params) => {
        return (
            <Tooltip title='Edit'>
                <EditIcon
                    onClick={(event) => {
                        event.stopPropagation();
                        setIsAddButton(false);
                        setEditHelper(params.selectedRow);
                        setOpen(true);
                    }}
                    style={{ cursor: 'pointer', color: '#18143D' }}
                />
            </Tooltip>
        )
    };

    const DeleteData = (params) => {
        return (
            <Tooltip title='Delete'>
                <DeleteIcon
                    onClick={(event) => {
                        event.stopPropagation();
                        setDeleteDailogOpen(true);
                        setDeleteId(params.selectedRow.id);
                        // OperatorDelete();

                    }}
                    style={{ cursor: 'pointer', color: '#18143D' }}
                />
            </Tooltip>
        )
    };
    // const Password = (params) => {
    //     return (
    //         <Tooltip title='Create Password'>
    //             <HttpsIcon
    //                 onClick={(event) => {
    //                     setPasswordModal(true);
    //                     setRowId(params.selectedRow.id);
    //                     // OperatorDelete();

    //                 }}
    //                 style={{ cursor: 'pointer', color: '#06D001' }}
    //             />
    //         </Tooltip>
    //     )
    // };
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [assignHelperlist, setAssignHelperlist] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [editHelper, setEditHelper] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);




    useEffect(() => {
        ShowAssignHelperList(handleDepartmentList, handleDepartmentException)
    }, [refreshData]);
    const handleDepartmentList = (dataObject) => {
        setAssignHelperlist(dataObject.data)
    };
    const handleDepartmentException = () => {

    };

    // const AssignHelperDelete = (id) => {
    //     AssignHelperDeleteService({ id }, AssignHelperDeleteSuccess, AssignHelperDeleteException)
    // };
    const AssignHelperDeleteSuccess = (dataObject) => {
        setRefreshData((oldvalue) => !oldvalue)
    };

    const AssignHelperDeleteException = (dataObject) => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>

            <AssignHelperToolbar
                setIsAddButton={setIsAddButton}
                setEditHelper={setEditHelper}
                setOpen={setOpen}
            />
            <DataGrid
                rows={assignHelperlist}
                columns={columns}
                pageSize={5}
                // loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                sx={{
                    '& .MuiDataGrid-columnHeaders': {
                        color: '#000000', // Header text color
                        fontWeight: 'bold', // Header font weight
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold', // Ensures the header font weight is bold
                    },
                }}

            />
            <AssignHelperModal
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                HelperData={editHelper}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={AssignHelperDeleteService}
                handleSuccess={AssignHelperDeleteSuccess}
                handleException={AssignHelperDeleteException}
            />

        </div>

    )
}

export default AssignHelperResult