import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import AmcServiceTab from './AmcService/AmcServiceTab';
import CertificateTab from './CertificateAmc/CertificateTab';
import WarrentyDueList from './Warrenty/WarrentyDueList';

function TabPanel(props) {
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
          <Box sx={{ p: 1 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
  );
}
  
  TabPanel.propTypes = {
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


  const AMCTab = () => {
    
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Grid container>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Box >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example"
              variant='scrollable'
              visibleScrollbar={true}
              allowScrollButtonsMobile
              style={{overflow: 'auto',
                  // width:'89vw'
              }}>
              <Tab label="AMC Service" {...a11yProps(0)} />
              <Tab label="Certificate" {...a11yProps(1)} />
              <Tab label="Warranty" {...a11yProps(2)} />
              {/* <Tab label="Insurance" {...a11yProps(3)} /> */}
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
          <AmcServiceTab />
          </TabPanel>
          <TabPanel value={value} index={1}>
          <CertificateTab />
          </TabPanel>
          <TabPanel value={value} index={2}>
          <WarrentyDueList />
          </TabPanel>
          {/* <TabPanel value={value} index={3}>
          <AmcInsurenceTab />
          </TabPanel> */}
        </Box>
      </Grid>
    </Grid>
  )
}

export default AMCTab
