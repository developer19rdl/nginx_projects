import React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VendorAdd from './VendorAdd';
import { VendorView } from './VendorView';
import VendorAddType from './VendorAddType';
import { VendorTypeView } from './VendorTypeView';






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

const AddVendortype = () => {

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
                    <Tab icon={<AddIcon />} iconPosition="start" style={{ color: 'white' }} label="Add" {...a11yProps(0)} />
                    <Tab icon={<VisibilityIcon />} iconPosition="start" style={{ color: 'white' }} label="View" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <VendorAddType/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
             <VendorTypeView/>
            </CustomTabPanel>
        </Box>
    )
}

export default AddVendortype;
