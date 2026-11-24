import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import AssetGroupTools from './AssetGroupTools';
// import NotificationBar from '../../../notification/ServiceNotificationBar';
// import DeleteConfirmationDailog from '../../../../utils/confirmDeletion';
import AssetGroupModel from './AssetGroupModel';
import { AssetGroupDelete, AssetGroupShowdata } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
// import { AssetGroupDelete, AssetGroupShowdata } from '../../../../services/LoginServiceNod';

const AssetGroupList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editAssetGroup, setEditAssetGroup] = useState('');
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
    setGridLoading(true);
    AssetGroupShowdata(handleAssetGroupShow, handeAssetGroupException);
  }, [refreshData]);

  const handleAssetGroupShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeAssetGroupException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
  }

  const columns = [
    {
      field: 'GroupName',
      headerClassName: 'super-app-theme--header',
      headerName: 'Group Name',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'Description',
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
            setEditAssetGroup(props.selectedRow);
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

  // const DeleteFunction =()=>{
  //     DepartmentDelete({id:deleteId},handleDeleteSuccess,handleDeleteException);
  // }

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
      <AssetGroupTools
        setIsAddButton={setIsAddButton}
        editAssetGroup={editAssetGroup}
        setOpen={setOpen}
        setEditAssetGroup={setEditAssetGroup}
      />

      <AssetGroupModel
        isAddButton={isAddButton}
        editAssetGroup={editAssetGroup}
        setEditAssetGroup={setEditAssetGroup}
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
        deleteService={AssetGroupDelete}
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

export default AssetGroupList
