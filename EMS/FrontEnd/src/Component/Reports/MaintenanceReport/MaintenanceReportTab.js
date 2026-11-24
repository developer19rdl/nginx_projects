import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import FaultMetric from './FaultMetric';
// import FaultMetric from './FaultMetric';

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


  const MaintenanceReportTab = () => {
    
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
              }}>
              <Tab label="Fault Metric" {...a11yProps(0)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <FaultMetric />
          </TabPanel>
          <TabPanel value={value} index={1}>

          </TabPanel>
        </Box>
      </Grid>
    </Grid>
  )
}

export default MaintenanceReportTab
