import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import AssignRoleToolbar from './AssignRoleToolbar';
import EditIcon from '@mui/icons-material/Edit';
import { AssignRoleListService } from '../../../Services/NodeJsApiServices';
import AssignRoleModel from './AssignRoleModel';

const AssignRoleResult = () => {
    const columns = [
        {
            field: 'id',
            headerName: 'Assign Role ID',
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
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            headerAlign: 'center',
            flex: 1,
            align: 'center',
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
            ],
        },
    ];

    const EditData = (params) => {
        return (
            <EditIcon
                onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditAssignRole(params.selectedRow);
                    setOpen(true);
                }}
                style={{ cursor: 'pointer', color: '#18143D' }}
            />
        )
    };

    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [assignRoleList, setAssignRoleResult] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [editAssignRole, setEditAssignRole] = useState([]);

    useEffect(() => {
        AssignRoleListService(handleSuccess, handleException);
    }, [refreshData]);

    const handleSuccess = (dataObject) => {
        setAssignRoleResult(dataObject.data)
    };
    const handleException = () => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>
            <AssignRoleToolbar
                setIsAddButton={setIsAddButton}
                setEditAssignRole={setEditAssignRole}
                setOpen={setOpen}
            />
            <DataGrid
                rows={assignRoleList}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            <AssignRoleModel
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                AssignRoleData={editAssignRole}
            />
        </div>
    )
}

export default AssignRoleResult
