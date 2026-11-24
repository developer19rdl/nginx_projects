import React from 'react'
import './CorrelationDataAnalytics.css'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { ROOT_CYCLE } from "../Cycle";

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

const CorrelationDataAnalytics = () => {

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
                    <Tab label="COMPRESSOR" {...a11yProps(0)} />
                    <Tab label="ENERGY" {...a11yProps(1)} />
                    <Tab label="SCRAP" {...a11yProps(2)} />
                    <Tab label="DEMAND/ACTUAL" {...a11yProps(3)} />
                    <Tab label="FORCASTING" {...a11yProps(4)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ROOT_CYCLE.CORRELATION_DATA_COMPRESSOR_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.CORRELATION_DATA_ANALYTICS_ENERGY_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <ROOT_CYCLE.CORRELATION_DATA_ANALYTICS_SCRAP_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <ROOT_CYCLE.CORRELATION_DATA_DEMAND_ACTUAL_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
                <ROOT_CYCLE.CORRELATION_DATA_FOR_CASTING_CYCLE />
            </CustomTabPanel>
        </Box>
    )
}
export default CorrelationDataAnalytics;
