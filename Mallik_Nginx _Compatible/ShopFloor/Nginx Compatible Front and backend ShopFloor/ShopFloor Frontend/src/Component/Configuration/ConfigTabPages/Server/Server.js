import React, { useState } from 'react'
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, Grid, TextField, Toolbar } from '@mui/material';
import { ServerUsageThresholds } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';
// import { ServerUsageThresholds } from '../../../../services/LoginServiceNod';
// import NotificationBar from '../Department/SubDepartment/NotificationBar';

const Server = () => {


  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  const [maxCpu, setmaxCpu] = useState('')
  const [maxMemory, setmaxMemory] = useState('')
  const [maxServer, setmaxServer] = useState('')

  const handelClick = () => {
    ServerUsageThresholds({ MaxMemUsage: maxMemory, MaxCpuLoad: maxCpu, MaxServerLoad: maxServer }, handelscusses, handelexception)
  }


  const handelscusses = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });

    setTimeout(() => {
      handleClose()
      setmaxCpu('');
      setmaxMemory('');
      setmaxServer('');
    }, 2000)
  }

  const handelexception = () => {
  }

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };


  return (

    <Box
      sx={{
        width: '100%'
      }}
    >
      <Typography variant="h6" component="div" sx={{ flexGrow: 1,fontWeight:'bold', backgroundColor: '#f8f8ff', border: '1px solid #e0e0e0', fontFamily: 'Roboto Slab', padding: 2.5, color: '#000000' }} >
        Server Usage Thresholds
      </Typography>
      <Card sx={{ borderRadius: 0, padding: '25px' }} >
        <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
            <Grid item lg={6} md={6} container justifyContent="center">
              <Typography>Max Memory Usage(%)</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField type='number' id="per-hour-input" label="Max Memory Usage(%)" variant="outlined" value={maxMemory} onChange={(e) => {
                setmaxMemory(e.target.value)
              }} />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <Typography>Max CPU Load(Avg.)</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField type='number' id="per-day-input" label="Max CPU Load(Avg.)" variant="outlined" value={maxCpu} onChange={(e) => {
                setmaxCpu(e.target.value)
              }} />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <Typography>Max Server Load(%)</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField type='number' id="per-day-input" label="Max Server Load(%)" variant="outlined" value={maxServer} onChange={(e) => {
                setmaxServer(e.target.value)
              }} />
            </Grid>
            <Grid item lg={12} md={12} container justifyContent="center">
              <Button variant="contained" sx={{ backgroundColor: "#051622", color: "#ffff" }} onClick={handelClick}>Save</Button>
            </Grid>
          </Grid>
          <NotificationBar
            handleClose={handleClose}
            notificationContent={openNotification.message}
            openNotification={openNotification.status}
            type={openNotification.type}
          />
        </CardContent>
      </Card>
    </Box>
  )
}
export default Server;
