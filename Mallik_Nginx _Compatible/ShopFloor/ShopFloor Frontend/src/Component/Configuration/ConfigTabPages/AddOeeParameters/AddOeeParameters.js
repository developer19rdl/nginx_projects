import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddOeeParametersToolbar from './SubAddOeeParameters/AddOeeParametersToolbar';
import AddOeeParametersModal from './SubAddOeeParameters/AddOeeParametersModal';
import NotificationBar from './SubAddOeeParameters/NotificationBar';
// import DeleteConfirmationDailog from './SubAddOeeParameters/DeleteConfirmationDailog';
import { OEEParametersDalete, OEEParametersView } from '../../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
// import { OEEParametersView } from '../../../../Services/NodeJsApiServices';
// import { OEEParametersView } from '../../../../services/LoginServiceNod';

// import { connect } from 'react-redux';
// import { showOeeParameter, deleteOeeParameter } from '../../../../Actions';

const AddOeeParameters = (props) => {
    const [oeeParameterList,setoeeParameterList ]= useState([])

    const [open, setOpen] = useState(false);
    const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isAddButton, setIsAddButton] = useState(true);
    const [editConfigSetup, setEditConfigSetup] = useState([]);
    const [assetList, setAssetList] = useState([]);
    const [isLoading, setGridLoading] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    useEffect(() => {
        setGridLoading(true)
        OEEParametersView(handelviewdata,handelViewExceptiondata)
    }, [refreshData])

    const handelviewdata=(dataObject)=>{
        setoeeParameterList(dataObject.data)
        setGridLoading(false)

    }

    const handelViewExceptiondata=()=>{
        
    }

    const columns = [
        // {
        //     field: 'id',
        //     headerName: 'Department ID',
        //     minWidth: 170,
        //     align: 'center',
        //     flex: 1,
        //     headerAlign: 'center'
        // },
        {
            field: 'oeeParaCategoryId',
            headerName: 'OEE Parameters',
            minWidth: 170,
            align: 'center',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'parameterName',
            headerName: 'Parameter Name',
            minWidth: 170,
            align: 'left',
            flex: 1,
            headerAlign: 'center'
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            minWidth: 100,
            align: 'center',
            flex: 1,
            cellClassName: 'actions',
            getActions: (params) => [
                <EditData selectedRow={params.row} />,
                <DeleteData selectedRow={params.row} />,
            ],
        },
    ];

    function DeleteData(props) {
        return (
            <DeleteIcon onClick={() => {
                setDeleteId(props.selectedRow.id);
                setDeleteDailogOpen(true);
            }}
            />
        )
    }

    function EditData(props) {
        return (
            <EditIcon onClick={(event) => {
                event.stopPropagation();
                setIsAddButton(false);
                setEditConfigSetup(props.selectedRow);
                setOpen(true);
            }}
            />
        )
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const DeletUnit = () => {
        props.deleteOeeParameter({
            id: deleteId
        }, handleDeleteSuccess, handleException);
    }

    const handleDeleteSuccess = (dataObject) => {
        setNotification({
            status: true,
            type: 'success',
            message: dataObject.message,
        });
        setRefreshData((oldvalue) => !oldvalue);
        setTimeout(() => {
            handleClose();
            setDeleteDailogOpen(false);
        }, 3000);
    }

    const handleException = (errorObject) => {

    };

    return (
        <div style={{ height: 400, width: '100%' }}>
            <AddOeeParametersToolbar
                setIsAddButton={setIsAddButton}
                setEditConfigSetup={setEditConfigSetup}
                setOpen={setOpen}
                editConfigSetup={editConfigSetup}
            // userAccess={moduleAccess}
            />

            <DataGrid
                rows={oeeParameterList}
                columns={columns}
                pageSize={5}
                loading={isLoading}
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

            <AddOeeParametersModal
                isAddButton={isAddButton}
                configSetupData={editConfigSetup}
                open={open}
                setOpen={setOpen}
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
                deleteService={OEEParametersDalete}
                handleSuccess={handleDeleteSuccess}
                handleException={handleException}
            />
        </div>
    );
}
// export default Department;
// const mapStateToProps = ({ config }) => {
//     const { oeeParameterList } = config;
//     return { oeeParameterList }
// }
export default AddOeeParameters;

