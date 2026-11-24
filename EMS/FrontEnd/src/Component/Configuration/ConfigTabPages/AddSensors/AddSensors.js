

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddSensorsToolbar from './SubAddSensors/AddSensorsToolbar';
import AddSensorsModal from './SubAddSensors/AddSensorsModal';
import SensorToMachineModal from './SubAddSensors/SensorToMechineModal';
import { AddSensorconfiDalete, AddSensorconfiView } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
import DeleteConfirmationDailog from '../../../../Utility/DeleteConfirmationDailog';
// import NotificationBar from './SubAddSensors/NotificationBar';
// import DeleteConfirmationDailog from './SubAddSensors/DeleteConfirmationDailog';
// import { AddSensorconfiView } from '../../../../services/LoginServiceNod';


const AddSensors = () => {
  const columns = [
    {
      field: 'id',
      headerName: 'Sensor ID',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'Sensor',
      headerName: 'Sensor',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center'
    },
    {
      field: 'metricUnit',
      headerName: 'Metric Unit',
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
    { id: 1, sensor: 'punching', metricUnit: '10' },
    { id: 2, sensor: 'welding', metricUnit: '20' },
    { id: 3, sensor: 'shering', metricUnit: '30' },
  ];

  const [open, setOpen] = useState(false);
  const [secondDailogOpen, setSecondDailogOpen] = useState(false)
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
    AddSensorconfiView(handleSuccess, handleException);
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
      <AddSensorsToolbar
        setIsAddButton={setIsAddButton}
        setEditConfigSetup={setEditConfigSetup}
        setOpen={setOpen}
        setSecondDailogOpen={setSecondDailogOpen}
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
        style={{ backgroundColor: '#ffffff' }}
      />

      <AddSensorsModal
        isAddButton={isAddButton}
        configSetupData={editConfigSetup}
        open={open}
        setOpen={setOpen}
        setRefreshData={setRefreshData}
        handleClose={handleClose}
        openNotification={openNotification}
        setNotification={setNotification}
      />
      <SensorToMachineModal
        // isAddButton={isAddButton}
        configSetupData={editConfigSetup}
        secondDailogOpen={secondDailogOpen}
        setSecondDailogOpen={setSecondDailogOpen}
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
        deleteService={AddSensorconfiDalete}
        handleSuccess={deletehandleSuccess}
        handleException={deletehandleException}
      />
    </div>
  );
}
export default AddSensors;


