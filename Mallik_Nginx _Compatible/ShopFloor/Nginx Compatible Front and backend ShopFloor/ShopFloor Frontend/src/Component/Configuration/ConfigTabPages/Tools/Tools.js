
// export default Machine;
import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import ToolsModal from './SubTools/ToolsModal';
import ToolsToolbar from './SubTools/ToolsToolbar';
import { AddToolsDalete, AddToolsView } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';

const Tools = () => {
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 60,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'machine_name',
      headerName: 'Machine Name',
      minWidth: 60,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'ToolName',
      headerName: 'Tool Name',
      minWidth: 60,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'ToolType',
      headerName: 'Tool Type',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'AlertType',
      headerName: 'Alert Based',
      minWidth: 170,
      align: 'center',
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


  const rows = [
    {
      id: 1,
      machineName: 'One',
      toolName: 'TESTING1',
      toolType: 'punching',
      alertBased: 'punch123'
    },
    {
      id: 2,
      machineName: 'TWO',
      toolName: 'TESTING2',
      toolType: 'punching2',
      alertBased: 'punch1234'
    },
  ];

  const [open, setOpen] = useState(false);
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [isAddButton, setIsAddButton] = useState(true);
  const [editConfigSetup, setEditConfigSetup] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [isLoading, setGridLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  // const moduleAccess = useUserAccess()('device');
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  useEffect(() => {
    setGridLoading(true);
    AddToolsView(handleSuccess, handleException);
  }, [refreshData]);

  const handleSuccess = (dataObject) => {
    setGridLoading(false);
    setAssetList(dataObject?.data || []);
  };

  const handleException = (errorObject) => {

  };

  function DeleteData(props) {
    // return moduleAccess.delete && (
    return (
      <DeleteIcon onClick={() => {
        setDeleteId(props.selectedRow.id);
        setDeleteDailogOpen(true);
      }}
      />
    )
    // );
  }


  const deletehandleSuccess = (dataObject) => {
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
  };

  const deletehandleException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: 'error',
      message: errorMessage,
    });
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  function EditData(props) {
    // return (moduleAccess.edit
    //     && (
    return (
      <EditIcon onClick={(event) => {
        event.stopPropagation();
        setIsAddButton(false);
        setEditConfigSetup(props.selectedRow);
        console.log("setEditConfigSetup", props.selectedRow)
        setOpen(true);
      }}
      />
    )
    // ));
  }

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <ToolsToolbar
        setIsAddButton={setIsAddButton}
        setEditConfigSetup={setEditConfigSetup}
        setOpen={setOpen}
        editConfigSetup={editConfigSetup}
      // userAccess={moduleAccess}
      />

      <DataGrid
        rows={assetList}
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

      <ToolsModal
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
        deleteService={AddToolsDalete}
        handleSuccess={deletehandleSuccess}
        handleException={deletehandleException}
      />
    </div>
  );
}
export default Tools;


