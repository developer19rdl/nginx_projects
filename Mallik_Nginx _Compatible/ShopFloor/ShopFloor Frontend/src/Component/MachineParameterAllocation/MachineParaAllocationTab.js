import React from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import EdgeDevice from './EdgeDevice/EdgeDevice';
import MachineParameterAllocation from './MachineAllocation/MachineParameterAllocation';
import DeviceCategory from './DeviceCategory/DeviceCategory';
import SensorCategory from './SensorCategory/SensorCategory';
import AddSensor from './AddSensor/AddSensor';
import SensorDeploy from './SensorDeploy/SensorDeploy';
import { MeterAllocationResults } from './MeterAllocation/MeterAllocationResults';
import { MachineAllocationResults } from './MachineAllocationNew/MachineAllocationResults';
import { TagsResults } from './Tags/TagsResults';



// import MeterAllocationResults from './MeterAllocation/MeterAllocationResults';
// MachineAllocationResults

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
                <Box sx={{ p: 3 }}>
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

const MachineParaAllocationTab = () => {

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', maxWidth: { xs: 320, sm: '100%' }, display: 'flex', justifyContent: 'center' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    indicatorColor="primary"
                    sx={{
                        '.MuiTabs-indicator': {
                            backgroundColor: '#DC3545', // Tab line color (e.g., red)
                        },
                    }}
                >
                    <Tab label="DEVICE CATEGORY" {...a11yProps(0)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    />
                    {/* <Tab label="SENSOR CATEGORY" {...a11yProps(1)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    />
                    <Tab label="ADD SENSOR" {...a11yProps(2)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    /> */}
                    <Tab label="EDGE DEVICE" {...a11yProps(1)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    />
                    <Tab label="Add Tag" {...a11yProps(2)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    />
                    <Tab label="Tag ALLOCATION" {...a11yProps(3)} 
                      sx={{
                        color: '#000000', // Inactive tab color (e.g., black)
                        fontWeight: 'bold',
                        '&.Mui-selected': {
                            color: '#DC3545', // Active tab color (e.g., red)
                        },
                    }}
                    />
                    <Tab label="Meter ALLOCATION" {...a11yProps(4)} 
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
            <CustomTabPanel value={value} index={0}>
                <DeviceCategory />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={1}>
                <SensorCategory />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AddSensor />
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={1}>
                <EdgeDevice />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <TagsResults />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <MachineAllocationResults />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
                <MeterAllocationResults />
            </CustomTabPanel>
        </Box>
    )
}
export default MachineParaAllocationTab;
