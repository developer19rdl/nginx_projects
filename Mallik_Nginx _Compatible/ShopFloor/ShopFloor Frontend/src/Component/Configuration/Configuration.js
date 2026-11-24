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

const Configuration = () => {

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
                    <Tab label="UNIT MASTER" {...a11yProps(0)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="PRODUCTION TYPE" {...a11yProps(1)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="MACHINE" {...a11yProps(2)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="CREATE EVENT" {...a11yProps(3)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="SCHEDULE EVENT" {...a11yProps(4)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="SERVER" {...a11yProps(6)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="TOOLS" {...a11yProps(7)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="CONSUMABLE" {...a11yProps(8)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="Welding Meter Settings" {...a11yProps(9)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                  
                
                    {/* <Tab label="FAILURE METRIC TARGET" {...a11yProps(12)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    /> */}
                    <Tab label="OEE PARAMETERS" {...a11yProps(12)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    <Tab label="UPLOAD LOGO" {...a11yProps(13)}
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
                <UnitMaster />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <CapacityMeasureType />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Machine />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <CreateEvent />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
                <ScheduleEvent />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
                <Server />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
                < Tools />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={7}>
                <ConsumableList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={8}>
                <WeldCalcList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={9}>
                <AddOeeParameters />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={10}>
                <UploadLogo />
            </CustomTabPanel>
        </Box>
    )
}
export default Configuration;
