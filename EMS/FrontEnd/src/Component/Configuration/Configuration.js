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

import Energy from './ConfigTabPages/Energy/Energy';

import UploadLogo from './ConfigTabPages/UploadLogo/UploadLogo';
import UploadVideo from './ConfigTabPages/UploadVideo/UploadVideo';

import AlertConfigList from './ConfigTabPages/AlertConfig/AlertConfigList';
import SmsConfigList from './ConfigTabPages/SmsConfig/SmsConfigList';
import RegionResult from '../EMSBuildings/RegionResult';
import CategoryMaster from '../EMSCategory/CategoryMaster';
import MeterCategoryMaster from '../MachineParameterAllocation/MeterAllocation/MeterCategoryMaster/MeterCategoryMaster';
import MeterTypeMaster from '../MachineParameterAllocation/MeterAllocation/MeterTypeMaster/MeterTypeMaster';
import EnergyReportEmail from './ConfigTabPages/EnergyReportEmail/EnergyReportEmail';
import WaterReportEmail from './ConfigTabPages/WaterReportEmail/WaterReportEmail';

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
                >
                    <Tab label="UNIT MASTER" {...a11yProps(0)} />
                    <Tab label="PRODUCTION TYPE" {...a11yProps(1)} />
                    <Tab label="DEPARTMENT" {...a11yProps(2)} />
                    <Tab label="MACHINE" {...a11yProps(3)} />
                    <Tab label="ENERGY" {...a11yProps(4)} />
                    <Tab label="EMAIL CONFIGURATIONS" {...a11yProps(5)} />
                    <Tab label="Regions" {...a11yProps(6)} />
                    <Tab label="Category" {...a11yProps(7)} />
                    <Tab label="UPLOAD LOGO" {...a11yProps(8)} />
                    <Tab label="UPLOAD VIDEO" {...a11yProps(9)} />
                    <Tab label="METER CATEGORY" {...a11yProps(10)} />
                    <Tab label="METER TYPE" {...a11yProps(11)} />
                    <Tab label="EMAIL REPORT" {...a11yProps(12)} />
                    <Tab label="WATER EMAIL REPORT" {...a11yProps(13)} />
                    <Tab label="SMS CONFIGURATIONS" {...a11yProps(14)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <UnitMaster />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <CapacityMeasureType />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <Department />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <Machine />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
                <Energy />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
                <AlertConfigList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
                <RegionResult />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={7}>
                <CategoryMaster />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={8}>
                <UploadLogo />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={9}>
                <UploadVideo />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={10}>
                <MeterCategoryMaster />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={11}>
                <MeterTypeMaster />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={12}>
                <EnergyReportEmail />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={13}>
                <WaterReportEmail />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={14}>
                <SmsConfigList />
            </CustomTabPanel>
        </Box>
    )
}
export default Configuration;
