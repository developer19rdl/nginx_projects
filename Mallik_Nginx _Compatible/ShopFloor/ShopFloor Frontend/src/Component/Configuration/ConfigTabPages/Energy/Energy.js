import React, { useState, useEffect } from 'react'
import "./Energy.css";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { AppBar, Button, Grid, TextField, Toolbar } from '@mui/material';
import { AddEnergyData, AddMaxEnergy, AddMaxEnergyView } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const Energy = () => {
  const [Hrmax, setHrmax] = useState('');
  const [daymax, setDaymax] = useState('');
  const [suctionDuration, setSuctionDuration] = useState('');
  const [suctionLtr, setSuctionLtr] = useState('');
  const [energyCostPerUnit, setEnergyCostPerUnit] = useState('');
  const [generatorFuelCost, setGeneratorFuelCost] = useState('');
  const [monthlyTarget, setMonthlyTarget] = useState('');
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  const [energyCostSettingsData, setEnergyCostSettingsData] = useState([]);

  useEffect(() => {
    AddMaxEnergyView(handleEnergySettingsSuccuss,handleEnergySettingsException)
  },[]);


  const handleEnergySettingsSuccuss = (dataObject)=>{
    setEnergyCostSettingsData(dataObject.data);
    loadData(dataObject.data);
  }

  const handleEnergySettingsException = ()=>{

  }

  const loadData = (data)=>{
    setHrmax(data[0].HourMaxErgCon);
    setDaymax(data[0].DayMaxErgCon);
    setEnergyCostPerUnit(data[0].energycostperunit);
    setGeneratorFuelCost(data[0].generatorcostperfuel);
    setMonthlyTarget(data[0].monthlytarget);
    setSuctionDuration(data[0].suctionduration);
    setSuctionLtr(data[0].suctionltr);
  }

  const handelclick = () => {
    // AddMaxEnergy({ HourMaxErgCon: Hrmax, DayMaxErgCon: daymax }, handelscusses, handelexception)
    AddEnergyData({
      energycostperunit: energyCostPerUnit,
      generatorcostperfuel: generatorFuelCost,
      monthlytarget: monthlyTarget,
      HourMaxErgCon: Hrmax,
      DayMaxErgCon: daymax,
      suctionduration: suctionDuration,
      suctionltr: suctionLtr
    }, handelscusses, handleException)
  }

  const handelscusses = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    // loadData(energyCostSettingsData);
    // setTimeout(() => {
    //   setHrmax('');
    //   setDaymax('');
    //   setEnergyCostPerUnit('');
    //   setGeneratorFuelCost('');
    //   setMonthlyTarget('');
    //   handleClose();
    // }, 2000)
  }

  const handleException = (error) => {
    console.error("API Error: ", error);
    setNotification({
      status: true,
      type: 'error',
      message: 'Something went wrong!',
    });
  };
  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight:'bold',backgroundColor: '#f8f8ff', border: '1px solid #e0e0e0', fontFamily: 'Roboto Slab', padding: 2.5, color: '#000000' }} >
        Add Max Energy
      </Typography>
      <Card sx={{ borderRadius: 0, padding: '25px' }} >
        <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Energy Cost Per Unit</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                type="number"
                id="Energy-Cost-input"
                label="Energy Cost Per Unit"
                variant="outlined"
                value={energyCostPerUnit}
                onChange={(e) => {
                  setEnergyCostPerUnit(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Generator Fuel Cost Per Ltr</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                id="Generator-input"
                label="Generator Fuel Cost"
                variant="outlined"
                value={generatorFuelCost}
                onChange={(e) => {
                  setGeneratorFuelCost(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Monthly Target</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                id="monthlyTarget-input"
                label="Monthly Target"
                variant="outlined"
                value={monthlyTarget}
                onChange={(e) => {
                  setMonthlyTarget(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Per Hour Max Energy Consumption [Units]</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                id="per-hour-input"
                label="Per Hour Max Energy Consumption"
                variant="outlined"
                value={Hrmax}
                onChange={(e) => {
                  setHrmax(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Per Day Max Energy Consumption [Units]</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                type='number'
                id="per-day-input"
                label="Per Day Max Energy Consumption"
                variant="outlined"
                value={daymax}
                onChange={(e) => {
                  setDaymax(e.target.value);
                }}
              />
            </Grid>
             <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Suction Duration [Minutes]</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                type='number'
                id="per-day-input"
                label="Per Day Max Energy Consumption"
                variant="outlined"
                value={suctionDuration}
                onChange={(e) => {
                  setSuctionDuration(e.target.value);
                }}
              />
            </Grid>

              <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Suction Litre</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                type='number'
                id="per-day-input"
                label="Per Day Max Energy Consumption"
                variant="outlined"
                value={suctionLtr}
                onChange={(e) => {
                  setSuctionLtr(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={12} md={12} container justifyContent="center">
              <Button variant="contained" sx={{ backgroundColor: "#051622", color: "#ffff" }} onClick={handelclick}>SAVE</Button>
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

export default Energy;
