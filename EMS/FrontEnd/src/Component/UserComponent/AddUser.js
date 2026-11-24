import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SubAddUser from './SubUserComponent/SubAddUser';
import SubUserGroup from './SubUserComponent/SubUserGroup';
import SubAddOperator from './SubUserComponent/SubAddOperator';
import SubAddDepartment from './SubUserComponent/SubAddDepartment';
import SubAddDesignation from './SubUserComponent/SubAddDesignation';
import AddUserResult from './SubUserComponent/AddUserResult';
import AddOperatorResult from './SubUserComponent/AddOperatorResult';
import AddRoleResult from './SubUserComponent/AddRoleResult';
import AssignRoleResult from './SubUserComponent/AssignRoleResult';
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

export default function AddUser() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="secondary"
                    aria-label="secondary tabs example"
                    variant="scrollable" // Make tabs scrollable
                    scrollButtons="auto" // Automatically show scroll buttons when needed

                >
                    <Tab label="ADD USER" {...a11yProps(0)} />
                    {/* <Tab label="USER GROUP" {...a11yProps(1)} /> */}
                    {/* <Tab label="ADD OPERATOR" {...a11yProps(1)} /> */}
                    {/* <Tab label="ADD DEPARTMENT" {...a11yProps(2)} /> */}
                    {/* <Tab label="ADD DESIGNATION" {...a11yProps(4)} /> */}
                    <Tab label="ADD ROLE" {...a11yProps(1)} />
                    <Tab label="ADD ASSIGN ROLE" {...a11yProps(2)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <AddUserResult />
            </CustomTabPanel>
            {/* <CustomTabPanel value={value} index={1}>
                <SubUserGroup />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={1}>
                <AddOperatorResult />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={2}>
                <SubAddDepartment />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={4}>
                <SubAddDesignation />
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={1}>
                <AddRoleResult />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AssignRoleResult />
            </CustomTabPanel>
        </Box>
    );
}