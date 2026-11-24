import {
  Button, Dialog, DialogContent, DialogTitle, TextField, Grid, DialogActions,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import NotificationBar from '../../Notification/NotificationBar.js';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import PlantModel from './PlantModel.js';
import DistruibutorsModel from './DistruibutorsModel.js';
import FeederSubDistr from './FeederSubDistr.js';
// import AddArea from './AddArea';
// import AddRegionLocation from './AddLocation';
// import AddWeavershala from './AddWeavershala';


function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const AddLocArea = ({ locAreaOpen, setLocAreaOpen, isAddButton, meterData, setRefreshData, }) => {
  console.log("meterData", meterData)
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const [plantId, setPlantId] = useState('');
  const [distributerId, setDistributerId] = useState('');

  const handlePlantAndDistributerChange = (newPlantId, newDistributerId) => {
    setPlantId(newPlantId);
    setDistributerId(newDistributerId);
  };


  const [openNotification, setNotification] = useState({
    status: false,
    type: 'error',
    message: '',
  });

  const handleCloseMenu = () => {
    setLocAreaOpen(false);
  }

  const handleClose = () => {
    setNotification({
      status: false,
      type: '',
      message: '',
    });
  };

  const handleSubmit = () => {

  }

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: '100%' } }}
      maxWidth="lg"
      open={locAreaOpen}
    >
      <DialogTitle style={{ background: '#f8f8ff', color: 'black' }}>
        Manage Plant
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ width: '98%', minheight: '700px', marginLeft: '1%', marginTop: '1%' }}>
            <Paper elevation={3} >
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="Incomer" {...a11yProps(0)} />
                  <Tab label="Distributors" {...a11yProps(1)} />
                  <Tab label="Sub Distributor/feeder" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <CustomTabPanel value={value} index={0}>
                <PlantModel
                  meterData={meterData}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <DistruibutorsModel
                  meterData={meterData}
                  onChange={handlePlantAndDistributerChange}
                />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={2}>
                <FeederSubDistr
                  meterData={meterData}
                  // editData={meterData}
                  plantId={plantId}
                  setPlantId={setPlantId} // Make sure this is passed correctly
                  distributerId={distributerId}
                  setDistributerId={setDistributerId}
                />
              </CustomTabPanel>



            </Paper>
          </Box>

          <DialogActions style={{ marginTop: '5px' }}>

            <Button onClick={handleCloseMenu} style={{ background: '#f8f8ff', color: 'black' }}>
              Cancel
            </Button>
          </DialogActions>

        </form>
      </DialogContent>

      <NotificationBar
        handleClose={handleClose}
        notificationContent={openNotification.message}
        openNotification={openNotification.status}
        type={openNotification.type}
      />
    </Dialog>
  )
}

export default AddLocArea