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
import AddAssignResult from './SubUserComponent/AddAssignResult';
import { useState } from 'react';
import { useEffect } from 'react';
import AssignHelperResult from '../AssignHelper/AssignHelperResult';
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
    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        setPermissions(userDetails?.userDetails?.accessibleModules)
        // console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", userDetails.userDetails.accessibleModules)
    }, [])
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
                    aria-label="secondary tabs example"
                    variant="scrollable" // Make tabs scrollable
                    scrollButtons="auto" // Automatically show scroll buttons when needed
                    indicatorColor="primary"
                    sx={{
                        '.MuiTabs-indicator': {
                            backgroundColor: '#DC3545', // Tab line color (e.g., red)
                        },
                    }}

                >
                    {permissions.includes("Add User") && (

                        <Tab label="ADD USER" {...a11yProps(0)}
                            sx={{
                                color: '#000000', // Inactive tab color (e.g., black)
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: '#DC3545', // Active tab color (e.g., red)
                                },
                            }}
                        />)}
                    {permissions.includes("Add Operator") && (

                        <Tab label="ADD OPERATOR" {...a11yProps(1)}
                            sx={{
                                color: '#000000', // Inactive tab color (e.g., black)
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: '#DC3545', // Active tab color (e.g., red)
                                },
                            }} />
                    )}
                    {/* {permissions.includes("Add Assign Helper") && ( */}

                    <Tab label="Add Assign Helper" {...a11yProps(2)}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }} />
                    {/* )} */}
                    {permissions.includes("Add Role") && (

                        <Tab label="ADD Role" {...a11yProps(3)}
                            sx={{
                                color: '#000000', // Inactive tab color (e.g., black)
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: '#DC3545', // Active tab color (e.g., red)
                                },
                            }} />
                    )}
                    {permissions.includes("Add Assign role") && (

                        <Tab label="ADD Assign Role" {...a11yProps(4)}
                            sx={{
                                color: '#000000', // Inactive tab color (e.g., black)
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: '#DC3545', // Active tab color (e.g., red)
                                },
                            }} />
                    )}
                </Tabs>
            </Box>
            {permissions.includes("Add User") && (

                <CustomTabPanel value={value} index={0}>
                    <AddUserResult />
                </CustomTabPanel>)}
            {/* <CustomTabPanel value={value} index={1}>
                <SubUserGroup />
            </CustomTabPanel> */}
            <CustomTabPanel value={value} index={1}>
                <AddOperatorResult />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
                <AssignHelperResult />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
                <AddRoleResult />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
                <AddAssignResult />
            </CustomTabPanel>
        </Box>
    );
}