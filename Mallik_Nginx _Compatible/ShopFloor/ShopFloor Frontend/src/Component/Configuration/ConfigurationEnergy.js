import React from 'react'
// import './Configuration.css'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import UnitMaster from './ConfigTabPages/UnitMaster/UnitMaster';
import CapacityMeasureType from './ConfigTabPages/CapacityMeasureType/CapacityMeasureType';
import Department from './ConfigTabPages/Department/Department';
import Machine from './ConfigTabPages/Machine/Machine';
import ScheduleEvent from './ConfigTabPages/ScheduleEvent/ScheduleEvent';
import CreateEvent from './ConfigTabPages/CreateEvent/CreateEvent';
import Energy from './ConfigTabPages/Energy/Energy';
import Server from './ConfigTabPages/Server/Server';
import Tools from './ConfigTabPages/Tools/Tools';
import AddSensors from './ConfigTabPages/AddSensors/AddSensors';
import AddOeeParameters from './ConfigTabPages/AddOeeParameters/AddOeeParameters';
import UploadLogo from './ConfigTabPages/UploadLogo/UploadLogo';
import SetAlertList from './ConfigTabPages/SetAlert/SetAlertList';
import FailureMetricTargetList from './ConfigTabPages/FailureMetricTarget/FailureMetricTargetList';
import AlertConfigList from './ConfigTabPages/AlertConfig/AlertConfigList';
import ConsumableList from './ConfigTabPages/Consumable/ConsumableList';
import WeldCalcList from './ConfigTabPages/WeldingCalc/WeldCalcList';

// import { ROOT_CYCLE } from "../Cycle";

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

const ConfigurationEnergy = () => {

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
                   
                    <Tab label="ENERGY" {...a11yProps(0)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                       
                    <Tab label="SET ALERT" {...a11yProps(1)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="ALERT CONFIGURATIONS" {...a11yProps(2)}
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
                <Energy />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                {/* <SetAlert/> */}
                <SetAlertList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AlertConfigList />
            </CustomTabPanel>
        </Box>
    )
}
export default ConfigurationEnergy;
