import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import AmcServiceTools from './AmcServiceTools';
// import NotificationBar from '../../../notification/ServiceNotificationBar';
import AmcServiceModel from './AmcServiceModel';
import { AmcDelete, AmcShowdata } from '../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
// import { AmcDelete, AmcShowdata } from '../../../../services/LoginServiceNod';
// import DeleteConfirmationDailog from '../../../../utils/confirmDeletion';

const AmcServiceList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editAmcService, setEditAmcService] = useState('');
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
    AmcShowdata(handleAssetShow, handeAssetException);
  }, [refreshData]);

  const handleAssetShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeAssetException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
  }

  const columns = [
    {
      field: 'VendorName',
      headerClassName: 'super-app-theme--header',
      headerName: 'Vender Name',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
    },
    {
      field: 'PeriodFrom',
      headerClassName: 'super-app-theme--header',
      headerName: 'Period From',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'PeriodTo',
      headerName: 'Period To',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'ServicePattern',
      headerName: 'Service Pattern',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
    },
    {
      field: 'dname',
      headerName: 'Department',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
    },
    {
      field: 'sname',
      headerName: 'Section',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
    },
    {
      field: 'aname',
      headerName: 'Asset Type',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
    },
    {
      field: 'MachineName',
      headerName: 'Asset Name',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'left', headerAlign: 'center'
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
            setEditAmcService(props.selectedRow);
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
    AmcDelete({ id: deleteId }, handleDeleteSuccess, handleDeleteException);
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
      <AmcServiceTools
        setIsAddButton={setIsAddButton}
        editAmcService={editAmcService}
        setOpen={setOpen}
        setEditAmcService={setEditAmcService}
      />

      <AmcServiceModel
        isAddButton={isAddButton}
        editAmcService={editAmcService}
        setEditAmcService={setEditAmcService}
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
        deleteService={AmcDelete}
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

export default AmcServiceList

