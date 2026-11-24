import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import MachineModal from './SubMachine/MachineModal';
import MachineToolbar from './SubMachine/MachineToolbar';
import DeleteConfirmationDailog from './SubMachine/DeleteConfirmationDailog';
import NotificationBar from './SubMachine/NotificationBar';
import { MachineView, MachineDalete } from '../../../../Services/NodeJsApiServices';

const Machine = () => {
  const columns = [
    {
      field: 'departmentName',
      headerName: 'Department',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'machine_name',
      headerName: 'Machine Name',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'machine_tag',
      headerName: 'Machine Tag',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'max_capacity',
      headerName: 'Max Capacity',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'unit',
      headerName: 'Capacity Measuring Unit',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'is_dashboard_display',
      headerName: 'Dashboard Display',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'isSensorHealth',
      headerName: 'Health Dashboard Display',
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


  const [rows, setRows] = useState([]);
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
    setGridLoading(true);
    MachineView(
      (dataObject) => {
        setGridLoading(false);
        setRows(dataObject?.data || []);
      },
      () => setGridLoading(false)
    );
  }, [refreshData]);

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
        console.log("setEditConfigSetup", props.selectedRow)
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
    MachineDalete({ id: deleteId }, handleDeleteSuccess, handleException);
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
      <MachineToolbar
        setIsAddButton={setIsAddButton}
        setEditConfigSetup={setEditConfigSetup}
        setOpen={setOpen}
        editConfigSetup={editConfigSetup}
      />

      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={5}
        loading={isLoading}
        rowsPerPageOptions={[5]}
        disableSelectionOnClick
        style={{ backgroundColor: '#ffffff' }}
      />

      <MachineModal
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
        deleteService={DeletUnit}
        handleSuccess={handleDeleteSuccess}
        handleException={handleException}
      />
    </div>
  );
}

export default Machine;
