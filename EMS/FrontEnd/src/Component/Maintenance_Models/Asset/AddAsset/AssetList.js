import React from 'react'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import AssetTools from './AssetTools';
import AssetModel from './AssetModel';
import { AssetDelete, AssetShowdata } from '../../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../UserComponent/SubUserComponent/DeleteConfirmationDailog';
import NotificationBar from '../../../Notification/NotificationBar';


const AssetList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editAsset, setEditAsset] = useState('');
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
    AssetShowdata(handleAssetShow, handeAssetException);
  }, [refreshData]);

  const handleAssetShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeAssetException = (errorStatus, errorMessage) => {

  }

  const columns = [
    {
      field: 'id',
      headerClassName: 'super-app-theme--header',
      headerName: 'Asset ID',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'MachineName',
      headerClassName: 'super-app-theme--header',
      headerName: 'Asset Name',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'aname',
      headerName: 'Asset Type',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'Manufacturer',
      headerName: 'Manufacturer',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'dname',
      headerName: 'Department',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'PODetails',
      headerName: 'PO Details',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'InvDetails',
      headerName: 'Invoice Details',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'WarStartDate',
      headerName: 'Warranty Start Date',
      headerClassName: 'super-app-theme--header',
      minWidth: 100,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.WarStartDate || ' 0000-00-00'
    },
    {
      field: "WarEndDate",
      headerName: "Warranty End Date",
      headerClassName: 'super-app-theme--header',
      minWidth: 100,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => params.row.WarEndDate || ' 0000-00-00'
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
            setEditAsset(props.selectedRow);
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
      <AssetTools
        setIsAddButton={setIsAddButton}
        editAsset={editAsset}
        setOpen={setOpen}
        setEditAsset={setEditAsset}
        setRefreshData={setRefreshData}
      />

      <AssetModel
        isAddButton={isAddButton}
        editAsset={editAsset}
        setEditAsset={setEditAsset}
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
        deleteService={AssetDelete}
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
        style={{ backgroundColor: '#ffffff' }}
        sx={{
          height: '480px',
          width: '100%',
          '& .super-app-theme--header': {
            WebkitTextStrokeWidth: '0.6px',
          },
        }}
      />
    </div>
  )
}

export default AssetList
