import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import MstrNatureTools from './MstrNatureTools';
import MstrNatureModel from './MstrNatureModel';
import { NatureDelete, NatureShowdata } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
// import { NatureDelete, NatureShowdata } from '../../../../services/LoginServiceNod';
// import DeleteConfirmationDailog from '../../../../utils/confirmDeletion';
import NotificationBar from '../../../Utility/NotificationBar';

const MstrNatureList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editNature, setEditNature] = useState('');
  const [open, setOpen] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setGridLoading] = useState(true);
  const [deleteId, setDeleteId] = useState('');
  const [deleteDailogOpen, setDeleteDailogOpen] = useState(false);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  useEffect(() => {
    NatureShowdata(handleNatureShow, handeNatureException);
  }, [refreshData]);

  const handleNatureShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeNatureException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
  }

  const columns = [
    // {
    //   field: 'slNo',
    //   headerClassName: 'super-app-theme--header',
    //   headerName: 'SL No.',
    //   minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    // },
    {
      field: 'CName',
      headerName: 'Problem Category',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'Nature_problem',
      headerName: 'Nature of Problem',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'description',
      headerName: 'Description',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
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
  ];

  function EditData(props) {
    return (
      <Tooltip title="Edit">
        <EditIcon style={{ cursor: 'pointer' }}
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            setEditNature(props.selectedRow);
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

  const DeleteFunction = () => {
    NatureDelete({ id: deleteId }, handleDeleteSuccess, handleDeleteException);
  }

  const handleDeleteSuccess = (dataObject) => {
    console.log(dataObject);
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      setDeleteDailogOpen(false);
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

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };


  return (
    <div style={{ height: 400, width: '100%' }}>
      <MstrNatureTools
        setIsAddButton={setIsAddButton}
        editNature={editNature}
        setOpen={setOpen}
        setEditNature={setEditNature}
      />

      <MstrNatureModel
        isAddButton={isAddButton}
        setIsAddButton={setIsAddButton}
        editNature={editNature}
        setEditNature={setEditNature}
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
        deleteService={NatureDelete}
        handleSuccess={handleDeleteSuccess}
        handleException={handleDeleteException}
      />

      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={8}
        loading={isLoading}
        rowsPerPageOptions={[8]}
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

    </div>
  )
}

export default MstrNatureList
