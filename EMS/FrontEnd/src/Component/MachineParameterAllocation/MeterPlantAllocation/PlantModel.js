import { Button, Grid, TextField, Tooltip,FormControl,InputLabel ,Select } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import { IncomerAdd, IncomerDelete, IncomerPlantShowdata, IncomerShowdata, IncomerUpdate, PlantsAdd, PlantsDelete, PlantsShowdata, PlantsUpdate } from '../../../Services/NodeJsApiServices';
import DeleteConfirmationDailog from '../../../Utility/DeleteConfirmationDailog';
import NotificationBar from '../../../Utility/NotificationBar';
const PlantModel = ({ meterData }) => {
  console.log("123,meterData", meterData)
  const [plantName, setPlantName] = useState('');
  const [incomerName, setIncomerName] = useState('');
    const [incomerDescription, setIncomerDescription] = useState('');
  const [editPlant, setEditPlant] = useState('');
  const [rows, setRows] = useState([]);
  const [isAddButton, setIsAddButton] = useState(true);
  const [isLoading, setGridLoading] = useState(false);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');
   const [plantList, setPlantList] = useState([]);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });
  useEffect(() => {
    setGridLoading(true);
    IncomerPlantShowdata( {id: meterData.id}, handlePlantIncomerShow, handlePlantIncomerShowException);
  }, [refreshData,]);



 
  const handlePlantIncomerShow = (dataObject) => {
    setRows(dataObject.data);
    setGridLoading(false);
  };
  const handlePlantIncomerShowException = (errorStatus, errorMessage) => {
    console.log(errorMessage);
    setGridLoading(false);
  };
  const AddIncomer = () => {
    if (isAddButton === true) {
      IncomerAdd({
        plantId: meterData?.id,
        incomerName: incomerName,
        description: incomerDescription,
      }, handlePlantAddSucess, handlePlantAddException);
    } else {
      IncomerUpdate({
        id: editPlant?.id,
        plantId: meterData?.id,
        incomerName: incomerName,
        description : incomerDescription,
      }, handlePlantAddSucess, handlePlantAddException);
    }
  }
  const handlePlantAddSucess = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setRefreshData(oldValue => !oldValue);
    handleClearData();
  }
  const handlePlantAddException = (errorObject, errorMessage) => {
    setNotification({
      status: true,
      type: 'error',
      message: errorMessage,
    });
  }
  const columns = [
    {
      field: 'incomerName',
      headerName: 'Incomer Name',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center',
    },
    {
      field: 'description',
      headerName: 'Incomer Description',
      minWidth: 170,
      align: 'center',
      flex: 1,
      headerAlign: 'center',
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
      <Tooltip title="Delete">
        <DeleteIcon
          onClick={() => {
            setDeleteId(props.selectedRow.id);
            console.log(props.selectedRow.id);
            setDeleteDialogOpen(true);
          }}
        />
      </Tooltip>
    );
  }
  function EditData(props) {
    return (
      <Tooltip title="Edit">
        <EditIcon
          onClick={(event) => {
            event.stopPropagation();
            setIsAddButton(false);
            setEditPlant(props.selectedRow);
            setIncomerName(props.selectedRow.incomerName);
            setIncomerDescription(props.selectedRow.description);
          }}
        />
      </Tooltip>
    );
  }
  const onDeleteSelet = () => {
    IncomerDelete(DeleteSuccess, DeleteException);
  }
  const DeleteSuccess = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject?.message,
    });
    setTimeout(() => {
      setRefreshData(oldvalue => !oldvalue);
      handleClose();
    }, 2000);
  }
  const DeleteException = () => {
  }
  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  const handleClearData = () => {
    setIncomerName("");
    setIncomerDescription("");    
    setIsAddButton(true);
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <form>
        <Grid container>
         
          <Grid item xs={12}>
            
            <TextField
              value={incomerName}
              margin="dense"
              id="outlined-basic"
              label="Incomer Name"
              variant="outlined"
              fullWidth
              onChange={(e) => { setIncomerName(e.target.value); }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              value={incomerDescription}
              margin="dense"
              id="outlined-basic"
              label="Incomer Description"
              variant="outlined"
              fullWidth
              onChange={(e) => { setIncomerDescription(e.target.value); }}
              autoComplete="off"
              required
            />
          </Grid> 
          <Grid item xs={12} container justifyContent="flex-end">
            <Button
              size="large"
              onClick={handleClearData}
            >
              Clear
            </Button>

            <Button
              size="large"
              type="submit"
              onClick={AddIncomer}
            >
              {' '}
              {isAddButton ? 'Add' : 'Update'}
            </Button>
          </Grid>
        </Grid>
      </form>
      <div style={{ height: 400, width: '100%', marginTop: '20px' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          style={{ backgroundColor: '#FFFFFF' }}
        />
        <DeleteConfirmationDailog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          deleteId={deleteId}
          deleteService={IncomerDelete  }
          handleSuccess={DeleteSuccess}
          handleException={DeleteException}
        />
      </div>
      <NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />
    </div>
  );
}
export default PlantModel;