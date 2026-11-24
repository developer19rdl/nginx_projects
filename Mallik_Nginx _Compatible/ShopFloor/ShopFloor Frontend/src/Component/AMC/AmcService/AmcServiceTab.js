import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import AmcServiceList from './AmcServiceList';
import AmcServiceDue from './AmcServiceDue';
import AmcRenevel from '../AmcRenevel';
// import AmcServiceList from './AmcServiceList';
// import AmcServiceDue from './AmcServiceDue';
// import AmcRenevel from '../AmcRenevel';

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


  const AmcServiceTab = () => {
    
  const [value, setValue] = React.useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };    
  return (
    <Grid container>
      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Box >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="secondary tabs example"
                    variant="scrollable" // Make tabs scrollable
                    scrollButtons="auto" // Automatically show scroll buttons when needed
                    indicatorColor="primary"
                    sx={{
                        '.MuiTabs-indicator': {
                            backgroundColor: '#DC3545', // Tab line color (e.g., red)
                        },
                    }}

                >
              <Tab label="AMC Service Add" {...a11yProps(0)} 
               sx={{
                color: '#000000', // Inactive tab color (e.g., black)
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: '#DC3545', // Active tab color (e.g., red)
                },
            }}
              />
              <Tab label="Service Due " {...a11yProps(1)} 
               sx={{
                color: '#000000', // Inactive tab color (e.g., black)
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: '#DC3545', // Active tab color (e.g., red)
                },
            }}
              />
              <Tab label="Amc Renewal " {...a11yProps(2)} 
               sx={{
                color: '#000000', // Inactive tab color (e.g., black)
                fontWeight: 'bold',
                '&.Mui-selected': {
                    color: '#DC3545', // Active tab color (e.g., red)
                },
            }}
              />
              
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
          <AmcServiceList />
          </TabPanel>
          <TabPanel value={value} index={1}>
          <AmcServiceDue/>
          </TabPanel>
          <TabPanel value={value} index={2}>
          <AmcRenevel/>
          </TabPanel>
        </Box>
      </Grid>
    </Grid>
  )
}

export default AmcServiceTab
