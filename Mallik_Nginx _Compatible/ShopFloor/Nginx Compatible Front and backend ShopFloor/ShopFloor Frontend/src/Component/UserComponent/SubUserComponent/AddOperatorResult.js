import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import AddOpearorToolbar from './AddOpearorToolbar';
import AddOperatorModel from './AddOperatorModel';
import { DepartmentDeleteType, DepartmentList, OperatortDeleteType, OperatortList } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from './DeleteConfirmationDailog';
import HttpsIcon from '@mui/icons-material/Https';
import OperatorPasswordModal from './OperatorPasswordModal';
import { Tooltip } from '@mui/material';

const AddOperatorResult = () => {
    const columns = [
        {
            field: 'operatorId',
            headerName: 'Operator ID',
            // width: 150,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },

        {
            field: 'operatorName',
            headerName: 'Operator Name',
            // width: 100,
            flex: 1,
            align: 'center',
            headerAlign: 'center'
        },
        {
            field: 'departmentName',
            headerName: 'Department Name',
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
                <Password selectedRow={params.row} />,
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
                        setEditOperator(params.selectedRow);
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
    const Password = (params) => {
        return (
            <Tooltip title='Create Password'>
                <HttpsIcon
                    onClick={(event) => {
                        setPasswordModal(true);
                        setRowId(params.selectedRow.id);
                        // OperatorDelete();

                    }}
                    style={{ cursor: 'pointer', color: '#06D001' }}
                />
            </Tooltip>
        )
    };
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [Operatorlist, setOperatorlist] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [editOperator, setEditOperator] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [rowId, setRowId] = useState('');
    const [passwordModal, setPasswordModal] = useState(false);



    useEffect(() => {
        OperatortList(handleDepartmentList, handleDepartmentException)
    }, [refreshData]);
    const handleDepartmentList = (dataObject) => {
        setOperatorlist(dataObject.data)
    };
    const handleDepartmentException = () => {

    };

    const OperatorDelete = (id) => {
        OperatortDeleteType({ id }, OperatorDeleteSuccess, OperatorDeleteException)
    };
    const OperatorDeleteSuccess = (dataObject) => {
        setRefreshData((oldvalue) => !oldvalue)
    };

    const OperatorDeleteException = (dataObject) => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>

            <AddOpearorToolbar
                setIsAddButton={setIsAddButton}
                setEditOperator={setEditOperator}
                setOpen={setOpen}
            />
            <DataGrid
                rows={Operatorlist}
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
            <AddOperatorModel
                isAddButton={isAddButton}
                open={open}
                setOpen={setOpen}
                setRefreshData={setRefreshData}
                OperatorData={editOperator}
            />
            <DeleteConfirmationDailog
                open={deleteDailogOpen}
                setOpen={setDeleteDailogOpen}
                deleteId={deleteId}
                deleteService={OperatorDelete}
                handleSuccess={OperatorDeleteSuccess}
                handleException={OperatorDeleteException}
            />
            <OperatorPasswordModal
                rowId={rowId}
                setPasswordModal={setPasswordModal}
                passwordModal={passwordModal}
                setRowId={setRowId}
            />
        </div>

    )
}

export default AddOperatorResult