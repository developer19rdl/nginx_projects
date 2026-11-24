import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { ROOT_CYCLE } from '../Cycle';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

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

const Certificate = () => {

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <Typography variant='h5' marginLeft={2} marginTop={2}>Add Certificate / Inspection</Typography>
            <Box sx={{ bgcolor: 'background.paper' }} margin={2} className="MachineBoxTopContainer">
                <Box sx={{ bgcolor: '#1976d2', borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-start' }}>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                        sx={{
                            "& .MuiTabs-indicator": {
                                backgroundColor: 'white', // Change to the color you want
                            },
                        }}
                    >
                        <Tab icon={<AddIcon />} iconPosition="start" style={{ color: 'white' }} label="Add" {...a11yProps(0)} />
                        <Tab icon={<VisibilityIcon />} iconPosition="start" style={{ color: 'white' }} label="View" {...a11yProps(1)} />
                        <Tab icon={<BuildIcon />} iconPosition="start" style={{ color: 'white' }} label="Inspection" {...a11yProps(2)} />
                        <Tab icon={<HourglassBottomIcon />} iconPosition="start" style={{ color: 'white' }} label="Inspection Due" {...a11yProps(3)} />
                    </Tabs>
                </Box>
                <CustomTabPanel value={value} index={0}>
                    <ROOT_CYCLE.CERTIFICATE_ADD_CERTIFICATE_CYCLE />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <ROOT_CYCLE.CERTIFICATE_VIEW_CERTIFICATE_CYCLE />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <ROOT_CYCLE.CERTIFICATE_INSPECTION_CYCLE />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                    <ROOT_CYCLE.CERTIFICATE_INSPECTION_DUE_CYCLE />
                </CustomTabPanel>
            </Box>
        </>
    )
}

export default Certificate;
