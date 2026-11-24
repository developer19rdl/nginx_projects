import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import AddRoleToolbar from './AddRoleToolbar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { RoleDeleteService, RoleListService } from '../../../Services/NodeJsApiServices';
import AddRoleModel from './AddRoleModel';
import DeleteConfirmationDailog from './DeleteConfirmationDailog';

const AddRoleResult = () => {
    const columns = [
        {
            field: 'id',
            headerName: 'Role ID',
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'roleName',
            headerName: 'Role Name',
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'roleDescription',
            headerName: 'Role Description',
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerAlign: 'center',
            flex: 1,
            align: 'center',
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    const EditData = (params) => {
        return (
            <EditIcon
                onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditRole(params.selectedRow);
                    setOpen(true);
                }}
                style={{ cursor: 'pointer', color: '#18143D' }}
            />
        )
    };

    const DeleteData = (params) => {
        return (
            <DeleteIcon
                onClick={(event) => {
                    event.stopPropagation();
                    setDeleteDailogOpen(true);
                    setDeleteId(params.selectedRow.id);
                }}
                style={{ cursor: 'pointer', color: '#18143D' }}
            />
        )
    };

    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [rolelist, setRoleResult] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [editrole, setEditRole] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);

    useEffect(() => {
        RoleListService(handleRoleSuccess, handleRoleException);
    }, [refreshData]);

    const handleRoleSuccess = (dataObject) => {
        setRoleResult(dataObject.data)
    };
    const handleRoleException = () => {

    };

    const RoleDelete = (id) => {
        RoleDeleteService({ id }, RoleDeleteSuccess, RoleDeleteException);
    };
    const RoleDeleteSuccess = () => {
        setRefreshData((oldvalue) => !oldvalue)
    };
    const RoleDeleteException = () => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>
            <AddRoleToolbar
                setIsAddButton={setIsAddButton}
                setEditRole={setEditRole}
                setOpen={setOpen}
            />
            <DataGrid
                rows={rolelist}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            <AddRoleModel
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                RoleData={editrole}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={RoleDelete}
                handleSuccess={RoleDeleteSuccess}
                handleException={RoleDeleteException}
            />
        </div>
    )
}

export default AddRoleResult
