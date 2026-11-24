import AmcRenevelTools from './AmcRenevelTools'
import { DataGrid } from '@mui/x-data-grid'
import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { AmcRenewalUpdate, AmcRenewalView } from '../../Services/NodeJsApiServices';
import NotificationBar from '../../Utility/NotificationBar';

const AmcRenevel = () => {
  const [rows, setRow] = useState([]);
  const [refreshData, setRefreshData] = useState(false);
  const [isLoading, setGridLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [department, setDepartment] = useState('');
  const [machine, setMachine] = useState('');
  const [amcStartDate, setAmcStartDate] = useState('');
  const [amcEndDate, setAmcEndDate] = useState('');
  const [servicePattern, setServicePattern] = useState('');
  const [renewal, setrenewal] = useState([]);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });


  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    AmcRenewalView(handleVendorShow, handeVendorException);

  }, [refreshData]);

  useEffect(() => {
    console.log("renewal", renewal)
    setDepartment(renewal?.dname || '');
    setMachine(renewal?.MachineName || '');
    setAmcStartDate(renewal?.PeriodFrom || '');
    setAmcEndDate(renewal?.PeriodTo || '');
    setServicePattern(renewal?.ServicePattern || '')


  }, [renewal]);

  const handleVendorShow = (dataObject) => {
    setGridLoading(false);
    setRow(dataObject?.data || []);
  }

  const handeVendorException = (_errorStatus, errorMessage) => {
    console.error(errorMessage);
  }

  const columns = [
    {
      field: 'dname',
      headerClassName: 'super-app-theme--header',
      headerName: 'Department',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'Mname',
      headerClassName: 'super-app-theme--header',
      headerName: 'Machine',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'PeriodFrom',
      headerName: 'AMC Start Date',
      headerClassName: 'super-app-theme--header',
      minWidth: 100, flex: 1, align: 'center', headerAlign: 'center'
    },
    {
      field: 'PeriodTo',
      headerName: 'Amc End Date',
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
        <Button onClick={(event) => {
          event.stopPropagation();
          setIsModalVisible(true);
          setrenewal(params.row);
        }}>Renewal</Button>

      ],
    },
  ];

  const onServicePatternChange = (e) => {
    setServicePattern(e.target.value);
  }

  const onSubmit = (e) => {
    console.log("renewal===", renewal)
    e.preventDefault();
    AmcRenewalUpdate({
      newPeriodFrom: amcStartDate,
      newPeriodTo: amcEndDate,
      id: renewal.id
    }, handleSuccess, handleException)

  }
  const handleSuccess = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    setTimeout(() => {
      setIsModalVisible(false);
    }, 2000);
    setRefreshData(oldValue => !oldValue);
  }

  const handleException = (_errorStatus, errorMessage) => {
    setNotification({
      status: true,
      type: 'error',
      message: errorMessage,
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
      <AmcRenevelTools />

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

      <>
        <Dialog sx={{ '& .MuiDialog-paper': { width: '32%', maxHeight: '100%' } }}
          maxWidth="lg"
          open={isModalVisible}>
          <form onSubmit={onSubmit}>
            <DialogTitle sx={{ m: 0, color: '#000000', fontWeight: 'bold' }}>
              Renewal AMC
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} style={{ marginTop: '20px' }}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <TextField
                    fullWidth
                    label="Department"
                    placeholder='Department'
                    variant="outlined"
                    required
                    // onChange={(e) => { setDepartment(e.target.value) }}
                    value={department} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <TextField
                    fullWidth
                    label="Machine"
                    placeholder='Machine'
                    variant="outlined"
                    required
                    // onChange={(e) => { setDepartment(e.target.value) }}
                    value={machine} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <TextField
                    fullWidth
                    label="Amc Start Date"
                    placeholder='Amc Start Date'
                    variant="outlined"
                    required
                    type='date'
                    onChange={(e) => { setAmcStartDate(e.target.value) }}
                    value={amcStartDate} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <TextField
                    fullWidth
                    label="Amc End Date"
                    placeholder='Amc End Date'
                    variant="outlined"
                    required
                    type='date'
                    onChange={(e) => { setAmcEndDate(e.target.value) }}
                    value={amcEndDate} />
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Service Pattern</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Service Pattern"
                      placeholder='Service Pattern'
                      value={servicePattern}
                      onChange={(e) => onServicePatternChange(e)}>
                      <MenuItem value={"Service 1"}>Service 1</MenuItem>
                      <MenuItem value={"Service 2"}>Service 2</MenuItem>
                      <MenuItem value={"Service 3"}>Service 3</MenuItem>
                      <MenuItem value={"Service 4"}>Service 4</MenuItem>
                      <MenuItem value={"Service 5"}>Service 5</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

              </Grid>

            </DialogContent>
            <DialogActions>
              <Button type='submit' variant="contained"
                style={{ width: '150px', background: '#051622', color: 'white' }}>
                Renew
              </Button>
              <Button onClick={handleModalClose} variant="contained"
                style={{ width: '150px', background: '#051622', color: 'white' }}>Cancel</Button>
            </DialogActions>
          </form>

        </Dialog>
      </>
      <NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />

    </div>
  )
}

export default AmcRenevel
