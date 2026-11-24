import React from 'react'
import DepartmentTools from './DepartmentTools'
import { useState } from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect } from 'react';
import AddDepartmentModel from './AddDepartmentModel';
import { DepartmentDelete, DepartmentShowdata } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../Notification/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';

const AddDepartmentList = () => {
  const [rows, setRow] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [editDepartment, setEditDepartment] = useState('');
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
    DepartmentShowdata(handleLocationShow, handeLocationException);
  }, [refreshData]);

  const handleLocationShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeLocationException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
  }

  const columns = [
    {
      field: 'departmentName',
      headerClassName: 'super-app-theme--header',
      headerName: 'Department',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'departmentDescription',
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
            setEditDepartment(props.selectedRow);
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
      <DepartmentTools
        setIsAddButton={setIsAddButton}
        editDepartment={editDepartment}
        setOpen={setOpen}
        setEditDepartment={setEditDepartment}
      />

      <AddDepartmentModel
        isAddButton={isAddButton}
        editDepartment={editDepartment}
        setEditDepartment={setEditDepartment}
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
        deleteService={DepartmentDelete}
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

export default AddDepartmentList
