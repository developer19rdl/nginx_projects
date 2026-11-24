// import React, { useState } from "react";
// import {
//     Box,
//     Tabs,
//     Tab,
//     Typography,
//     Paper,
// } from "@mui/material";
// import CancelInvoice from "./CancelInvoice";
// import ExportCancelInvoice from "./ExportCancelInvoice";

// function TabPanel({ children, value, index }) {
//     return (
//         <div hidden={value !== index}>
//             {value === index && (
//                 <Box sx={{ p: 3 }}>
//                     {children}
//                 </Box>
//             )}
//         </div>
//     );
// }

// export default function CancelMaster() {
//     const [tabValue, setTabValue] = useState(0);

//     const handleChange = (event, newValue) => {
//         setTabValue(newValue);
//     };

//     return (
//         <Box sx={{ width: "100%", p: 2 }}>
//             {/* <Paper elevation={2}> */}
//             <Tabs
//                 value={tabValue}
//                 onChange={handleChange}
//                 indicatorColor="primary"
//                 textColor="primary"
//                 variant="scrollable"
//                 scrollButtons="auto"
//             >
//                 <Tab label="Cancel Sales Invoice" />
//                 <Tab label="Cancel Export Sales Invoice" />
//             </Tabs>

//             <TabPanel value={tabValue} index={0}>
//                 <CancelInvoice />
//             </TabPanel>

//             <TabPanel value={tabValue} index={1}>
//                 <ExportCancelInvoice />
//             </TabPanel>

//             {/* </Paper> */}
//         </Box>
//     );
// }



import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CancelInvoice from "./CancelInvoice";
import ExportCancelInvoice from "./ExportCancelInvoice";
import ApplicationStore from '../../../Utility/localStorageUtil';

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
                <Box sx={{ p: 1 }}>
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

const MachinePlanningTab = () => {

    const { userDetails } = ApplicationStore().getStorage('userDetails');
    const [value, setValue] = React.useState(userDetails.userRole === "ExportCancelInvoice" ? 1 : 0);

    // const machinePermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "CancelInvoice");
    // const AssemblyPermission = userDetails?.groupRights?.filter((data) => data?.menu?.toLowerCase() === "ExportCancelInvoice");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                {/* <Tabs value={machinePermission[0]?.viewData === 1 ? 0 : AssemblyPermission[0]?.viewData === 1 ? 1 : value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Cancel Sales Invoice" {...a11yProps(0)} disabled={machinePermission[0]?.viewData === 0} />
                    <Tab label="Cancel Export Invoice" {...a11yProps(1)} disabled={AssemblyPermission[0]?.viewData === 0} />
                </Tabs> */}
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Cancel Sales Invoice" {...a11yProps(0)} />
                    <Tab label="Cancel Export Invoice" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0} >
                <CancelInvoice />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                <ExportCancelInvoice />
            </CustomTabPanel>
        </Box>
    );
}
export default MachinePlanningTab;

