
import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import AddOpearorToolbar from './AddOpearorToolbar';
import AddOperatorModel from './AddOperatorModel';
import { AssignRoleList, AssignRoletDeleteType, DepartmentDeleteType, DepartmentList, OperatortDeleteType, OperatortList, RoleList, RoletDeleteType } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from './DeleteConfirmationDailog';
import HttpsIcon from '@mui/icons-material/Https';
import OperatorPasswordModal from './OperatorPasswordModal';
import { Tooltip } from '@mui/material';
import AddRoleToolbar from './AddRoleToolbar';
import AddRoleModel from './AddRoleModel';
import AddAssignModule from './AddAssignModule';
import AddAssignToolbar from './AddAssignToolbar';

const AddAssignResult = () => {
    const columns = [
        {
            field: 'role_id',
            headerName: 'Assign Role ID',
            // width: 150,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },

        {
            field: 'role_name',
            headerName: 'Role Name',
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
                // <DeleteData selectedRow={params.row} />,
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
                        setEditAssignRole(params.selectedRow);
                        setOpen(true);
                    }}
                    style={{ cursor: 'pointer', color: '#18143D' }}
                />
            </Tooltip>
        )
    };

    // const DeleteData = (params) => {
    //     return (
    //         <Tooltip title='Delete'>
    //             <DeleteIcon
    //                 onClick={(event) => {
    //                     event.stopPropagation();
    //                     setDeleteDailogOpen(true);
    //                     setDeleteId(params.selectedRow.id);
    //                     // OperatorDelete();

    //                 }}
    //                 style={{ cursor: 'pointer', color: '#18143D' }}
    //             />
    //         </Tooltip>
    //     )
    // };

    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [AssignRolelist, setAssignRoleList] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [AssignRole, setEditAssignRole] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);



    useEffect(() => {
        AssignRoleList(handleDepartmentList, handleDepartmentException)
    }, [refreshData]);
    const handleDepartmentList = (dataObject) => {
        setAssignRoleList(dataObject.data)
    };
    const handleDepartmentException = () => {

    };

    // const RoleDelete = (id) => {
    //     AssignRoletDeleteType({ id }, OperatorDeleteSuccess, OperatorDeleteException)
    // };
    // const OperatorDeleteSuccess = (dataObject) => {
    //     setRefreshData((oldvalue) => !oldvalue)
    // };

    // const OperatorDeleteException = (dataObject) => {

    // };

    return (
        <div style={{ height: 400, width: '100%' }}>

            <AddAssignToolbar
                setIsAddButton={setIsAddButton}
                setEditAssignRole={setEditAssignRole}
                setOpen={setOpen}
            />
            <DataGrid
                rows={AssignRolelist}
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
            <AddAssignModule
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                AssignRole={AssignRole}
            />
            {/* <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={RoleDelete}
                handleSuccess={OperatorDeleteSuccess}
                handleException={OperatorDeleteException}
            /> */}

        </div>

    )
}

export default AddAssignResult