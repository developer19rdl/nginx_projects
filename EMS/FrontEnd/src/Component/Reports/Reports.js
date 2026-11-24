import React from "react";
import './Reports.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { ROOT_CYCLE } from "../Cycle";
import FaultMetric from "./MaintenanceReport/FaultMetric";

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

const Reports = () => {
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
                >
                    <Tab label="ENERGY " {...a11yProps(0)} />
                    <Tab label="Building Wise Energy" {...a11yProps(1)} />
                    {/* <Tab label="GAS" {...a11yProps(1)} /> */}
                    {/* <Tab label="POWDER CONSUMPTION" {...a11yProps(2)} /> */}
                    {/* <Tab label="OEE" {...a11yProps(1)} /> */}
                    {/* <Tab label="SCRAP" {...a11yProps(4)} /> */}
                    {/* <Tab label="PRODUCTION" {...a11yProps(2)} /> */}
                    {/* <Tab label="OPERATOR LOG" {...a11yProps(3)} /> */}
                    <Tab label="WATER" {...a11yProps(2)} />
                    <Tab label="ALERT" {...a11yProps(3)} />
                    {/* <Tab label="FAULT METRIC" {...a11yProps(8)} /> */}
                    {/* <Tab label="GENERATOR USAGE" {...a11yProps(3)} /> */}
                    <Tab label="ENERGY HEAT MAP" {...a11yProps(4)} />
                    <Tab label="SENSOR REPORT" {...a11yProps(5)} />
                    <Tab label="ENVIRONMENTAL REPORT" {...a11yProps(6)} />
                    {/* <Tab label="FAULT METRIC" {...a11yProps(6)} /> */}
                    {/* <Tab label="BIOMETRIC LOG" {...a11yProps(10)} /> */}
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ROOT_CYCLE.ENERGY_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.Energy_BUILDING_WISE_CYCLE />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.GAS_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={2}>
                <ROOT_CYCLE.POWDER_CONSUMPTION_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.OEE_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={4}>
                <ROOT_CYCLE.SCRAP_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={2}>
                <ROOT_CYCLE.PRODUCTION_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={3}>
                <ROOT_CYCLE.OPERATOR_LOG_CYCLE />
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={2}>
                <ROOT_CYCLE.WATER_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <ROOT_CYCLE.ALERT_CYCLE />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={8}>
                <ROOT_CYCLE.FAULT_METRIC_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={3}>
                <ROOT_CYCLE.GENERATOR_USAGE_CYCLE />
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={4}>
                <ROOT_CYCLE.ENERGY_HEAT_MAP_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
                <ROOT_CYCLE.SENSOR_REPORT_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
                <ROOT_CYCLE.ENVIRONMENTAL_REPORT_CYCLE />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={10}>
                <ROOT_CYCLE.BIOMETRIC_LOG_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={6}>
                <FaultMetric />
            </CustomTabPanel> */}
        </Box>
    );
}
export default Reports;