import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import SetAlertTools from './SetAlertTools';
import SetAlertModel from './SetAlertModel';
import { useEffect } from 'react';
import { SetAlertDelete, SetalertShowdata } from '../../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../Notification/NotificationBar';

const SetAlertList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editConfigSetup, setEditConfigSetup] = useState('');
  const [open, setOpen] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setGridLoading] = useState(false);
  const [deleteId, setDeleteId] = useState('');
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  useEffect(() => {
    setGridLoading(true)
    SetalertShowdata(handleAlertShow, handeAlertException);
  }, [refreshData]);

  const handleAlertShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeAlertException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
  }

  const columns = [
    {
      field: 'machine_name',
      headerName: 'Machine Name',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'ConsumName',
      headerName: 'Consumable Name',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'ConsumType',
      headerName: 'Consumable Type',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'DateFrom',
      headerName: 'From Date',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'Dateto',
      headerName: 'To Date',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'RunHours',
      headerName: 'Run Hours',
      minWidth: 100,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      headerClassName: 'super-app-theme--header',
      width: 250,
      cellClassName: 'actions',
      disableClickEventBubbling: true,
      getActions: (params) => [
        <EditData selectedRow={params.row} />,
        <DeleteData selectedRow={params.row} />,

      ],
    },
  ]

  function EditData(props) {
    return (
      <Tooltip title="Edit">
        <EditIcon style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            setEditConfigSetup(props.selectedRow);
            setOpen(true);
          }}
        />
      </Tooltip>
    );
  }

  function DeleteData(props) {
    return (
      <Tooltip title="Delete">
        <DeleteIcon style={{ color: '#012738', cursor: 'pointer' }}
          onClick={() => {
            setDeleteId(props.selectedRow.id);
            console.log(props.selectedRow.id);
            setDeleteDailogOpen(true);
          }} />
      </Tooltip>
    );
  }


  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  const handleDeleteSuccess = (dataObject) => {
    console.log(dataObject);
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      setDeleteDailogOpen(false);
      handleClose()
    }, 2000);
    setRefreshData(oldValue => !oldValue);
  }

  const handleDeleteException = (errorObject, message) => {
    console.log(message);
    setNotification({
      status: true,
      type: 'error',
      message: message,
    });
  }


  return (
    <div style={{ height: 400, width: '100%' }}>
      <SetAlertTools
        setIsAddButton={setIsAddButton}
        setEditConfigSetup={setEditConfigSetup}
        setOpen={setOpen}
        editConfigSetup={editConfigSetup}
      />

      <SetAlertModel
        isAddButton={isAddButton}
        editConfigSetup={editConfigSetup}
        setEditConfigSetup={setEditConfigSetup}
        open={open}
        setOpen={setOpen}
        setRefreshData={setRefreshData}
        handleClose={handleClose}
        openNotification={openNotification}
        setNotification={setNotification}
      />

      <DeleteConfirmationDailog
        open={deleteDailogOpen}
        setOpen={setDeleteDailogOpen}
        deleteId={deleteId}
        deleteService={SetAlertDelete}
        handleSuccess={handleDeleteSuccess}
        handleExcep tion={handleDeleteException}
      />

      <   NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />

      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={8}
        loading={isLoading}
        rowsPerPageOptions={[8]}
        disableSelectionOnClick
        sx={{
          height: '480px',
          width: '100%',
          backgroundColor: '#ffffff',
          '& .super-app-theme--header': {
            WebkitTextStrokeWidth: '0.6px',
          },
        }}
      />

    </div>
  )
}

export default SetAlertList
