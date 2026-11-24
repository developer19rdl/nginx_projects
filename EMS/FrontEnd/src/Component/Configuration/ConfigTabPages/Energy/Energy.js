import React, { useState, useEffect } from 'react'
import "./Energy.css";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, Grid, TextField, Table, TableHead, TableBody, TableRow, TableCell, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddEnergyTariff, EnergyTariffView, EnergyTariffUpdate, EnergyTariffDelete } from '../../../../Services/NodeJsApiServices';
import NotificationBar from '../../../../Utility/NotificationBar';

const Energy = () => {
  const [energyCostPerUnit, setEnergyCostPerUnit] = useState('');
  const [generatorFuelCost, setGeneratorFuelCost] = useState('');
  const [tariffList, setTariffList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  useEffect(() => {
    loadTariffs();
  }, []);

  const loadTariffs = () => {
    EnergyTariffView(
      (dataObject) => setTariffList(dataObject?.data || []),
      () => {}
    );
  };

  const resetForm = () => {
    setEnergyCostPerUnit('');
    setGeneratorFuelCost('');
    setEditingId(null);
  };

  const handelclick = () => {
    if (!energyCostPerUnit) {
      setNotification({ status: true, type: 'error', message: 'Energy Cost Per Unit is required' });
      return;
    }

    const payload = {
      energyCostPerUnit,
      generatorFuelCostPerLtr: generatorFuelCost || null,
    };

    if (editingId) {
      EnergyTariffUpdate({ id: editingId, ...payload }, handelscusses, handelexception);
    } else {
      AddEnergyTariff(payload, handelscusses, handelexception);
    }
  };

  const handelscusses = (dataObject) => {
    setNotification({
      status: true,
      type: 'success',
      message: dataObject.message,
    });
    resetForm();
    loadTariffs();
  }

  const handelexception = (errorObject, errorMessage) => {
    setNotification({ status: true, type: 'error', message: errorMessage || 'Something went wrong' });
  }

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  const handleEditRow = (row) => {
    setEditingId(row.id);
    setEnergyCostPerUnit(row.energyCostPerUnit);
    setGeneratorFuelCost(row.generatorFuelCostPerLtr ?? '');
  };

  const handleDeleteRow = (row) => {
    EnergyTariffDelete({ id: row.id }, () => {
      setNotification({ status: true, type: 'success', message: 'Tariff deleted successfully' });
      if (editingId === row.id) resetForm();
      loadTariffs();
    }, handelexception);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, backgroundColor: '#f8f8ff', border: '1px solid #e0e0e0', fontFamily: 'Roboto Slab', padding: 2.5, color: '#000000' }} >
        {editingId ? 'Edit Energy Tariff' : 'Add Energy Tariff'}
      </Typography>
      <Card sx={{ borderRadius: 0, padding: '25px' }} >
        <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={2} width={{ lg: "50%", md: '100%' }} alignItems={'center'} >
            <Grid item lg={6} md={6} container justifyContent='flex-start'>
              <Typography>Energy Cost Per Unit</Typography>
            </Grid>
            <Grid item lg={6} md={6} container justifyContent="center">
              <TextField
                id="energy-cost-per-unit-input"
                label="Energy Cost Per Unit"
                variant="outlined"
                type='number'
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
                id="generator-fuel-cost-input"
                label="Generator Fuel Cost"
                variant="outlined"
                type='number'
                value={generatorFuelCost}
                onChange={(e) => {
                  setGeneratorFuelCost(e.target.value);
                }}
              />
            </Grid>
            <Grid item lg={12} md={12} container justifyContent="center" gap={2}>
              <Button variant="contained" sx={{ backgroundColor: "#051622", color: "#ffff" }} onClick={handelclick}>
                {editingId ? 'Update' : 'Add'}
              </Button>
              {editingId && (
                <Button variant="outlined" onClick={resetForm}>Cancel</Button>
              )}
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

      <Typography variant="h6" component="div" sx={{ flexGrow: 1, backgroundColor: '#f8f8ff', border: '1px solid #e0e0e0', borderTop: 'none', fontFamily: 'Roboto Slab', padding: 2.5, color: '#000000' }} >
        Tariff History
      </Typography>
      <Card sx={{ borderRadius: 0, padding: '25px' }}>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Energy Cost Per Unit</TableCell>
                <TableCell>Generator Fuel Cost Per Ltr</TableCell>
                <TableCell>Effective From</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tariffList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No tariff configured yet</TableCell>
                </TableRow>
              )}
              {tariffList.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.energyCostPerUnit}</TableCell>
                  <TableCell>{row.generatorFuelCostPerLtr ?? '—'}</TableCell>
                  <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEditRow(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteRow(row)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Energy;
