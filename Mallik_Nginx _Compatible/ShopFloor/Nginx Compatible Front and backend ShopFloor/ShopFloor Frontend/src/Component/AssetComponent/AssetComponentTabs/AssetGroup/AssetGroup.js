import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { ROOT_CYCLE } from "../../../Cycle";
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const AssetGroup = () => {

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ bgcolor: 'background.paper', width: '100%' }} className="MachineBoxTopContainer">
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
                    <Tab icon={<AddIcon />} iconPosition="start" style={{ color: 'white', width: '250px' }} label="Add Group" {...a11yProps(0)} />
                    <Tab icon={<VisibilityIcon />} iconPosition="start" style={{ color: 'white' }} label="View" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <ROOT_CYCLE.ASSET_GROUP_ASSET_GROUP_ADD_CYCLE />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.ASSET_GROUP_ASSET_GROUP_VIEW_CYCLE />
            </CustomTabPanel>
        </Box>
    )
}

export default AssetGroup;