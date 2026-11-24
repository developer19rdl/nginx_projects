import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react'
import AddUserToolbar from './AddUserToolbar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { UserDeleteService, UserListService } from '../../../Services/NodeJsApiServices';
import AddUserModel from './AddUserModel';
import DeleteConfirmationDailog from './DeleteConfirmationDailog';
const AddUserResult = () => {
    const columns = [
        {
            field: 'empid',
            headerName: 'Employee ID',
            // width: 150,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },

        {
            field: 'empname',
            headerName: 'Employee Name',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'departmentName',
            headerName: 'Department',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'userRole',
            headerName: 'User Role',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'phoneNo',
            headerName: 'Phone Number',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'email',
            headerName: 'Email ID',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'userName',
            headerName: 'User Name',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName:
                // <span style={{ fontFamily: 'Readex Pro', fontWeight: 'bold', fontSize: '16px' }}>
                //     'Actions'
                // </span>,
                'Actions',
            headerAlign: 'center',
            // width: 180,
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
                    setEditUser(params.selectedRow);
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
                    // UserDelete();

                }}
                style={{ cursor: 'pointer', color: '#18143D' }}
            />
        )
    };
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [userlist, setUserResult] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [edituser, setEditUser] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);


    useEffect(() => {
        UserListService(handleUserSuccess, handleUserException);
    }, [refreshData]);

    const handleUserSuccess = (dataObject) => {
        setUserResult(dataObject.data)
    };
    const handleUserException = () => {

    };

    const UserDelete = (id) => {

        UserDeleteService({ id }, UserDeleteSuccess, UserDeleteException);

    };
    const UserDeleteSuccess = (dataObject) => {
        setRefreshData((oldvalue) => !oldvalue)
    };

    const UserDeleteException = (dataObject) => {

    };
    return (
        <div style={{ height: 400, width: '100%' }}>
            <AddUserToolbar
                setIsAddButton={setIsAddButton}
                setEditUser={setEditUser}
                setOpen={setOpen}
            />
            {}
            <DataGrid
                rows={userlist}
                columns={columns}
                pageSize={5}
                // loading={isLoading}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
                style={{ backgroundColor: '#ffffff' }}
            />
            <AddUserModel
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                UserData={edituser}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={UserDelete}
                handleSuccess={UserDeleteSuccess}
                handleException={UserDeleteException}
            />
        </div>
    )
}

export default AddUserResult
