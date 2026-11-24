import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import AddOpearorToolbar from './AddOpearorToolbar';
import AddOperatorModel from './AddOperatorModel';
import { DepartmentDeleteType, DepartmentList, OperatortDeleteType, OperatortList } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from './DeleteConfirmationDailog';

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
            ],
        },
    ];
    const EditData = (params) => {
        return (

            <EditIcon
                onClick={(event) => {
                    event.stopPropagation();
                    setIsAddButton(false);
                    setEditOperator(params.selectedRow);
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
                    // OperatorDelete();

                }}
                style={{ cursor: 'pointer', color: '#18143D' }}
            />
        )
    };
    const [open, setOpen] = useState(false);
    const [isAddButton, setIsAddButton] = useState(true);
    const [Operatorlist, setOperatorlist] = useState([]);
    const [refreshData, setRefreshData] = useState(false);
    const [editOperator, setEditOperator] = useState([]);
    const [deleteId, setDeleteId] = useState('');
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);



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
                style={{ backgroundColor: '#ffffff' }}
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
        </div>

    )
}

export default AddOperatorResult