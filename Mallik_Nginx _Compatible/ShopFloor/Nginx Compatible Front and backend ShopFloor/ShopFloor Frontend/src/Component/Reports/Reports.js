import React, { useEffect, useState } from "react";
import './Reports.css';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import { ROOT_CYCLE } from "../Cycle";
import FaultMetric from './MaintenanceReport/FaultMetric'
import WeldingWire from "./ReportTabPages/WeldingWireKg/WeldingWire";

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
    const [value, setValue] = React.useState(10);
    const [permissions, setPermissions] = useState([]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        const userDetails = JSON.parse(sessionStorage.getItem("userDetails"));
        setPermissions(userDetails?.userDetails?.accessibleModules)
        console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn", userDetails?.userDetails?.accessibleModules)
    }, [])

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
                    {/* {permissions.includes("Oee") && ( */}
                    {/* <Tab label="OEE" {...a11yProps(0)}
                        disabled={permissions.includes("Oee") ? false : true}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    /> */}
                    {/* )} */}

                    {/* {permissions.includes("Production") && ( */}
                    <Tab label="PRODUCTION" {...a11yProps(0)}
                        disabled={permissions.includes("Production") ? false : true}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                      <Tab label="PRODUCTION IMPACT ANALYSIS" {...a11yProps(1)}
                            sx={{
                                color: '#000000', // Inactive tab color (e.g., black)
                                fontWeight: 'bold',
                                '&.Mui-selected': {
                                    color: '#DC3545', // Active tab color (e.g., red)
                                },
                            }}
                        />
                          <Tab label="DOWN TIME & IDLE TIME ANALYSIS" {...a11yProps(2)}

                                sx={{
                                    color: '#000000', // Inactive tab color (e.g., black)
                                    fontWeight: 'bold',
                                    '&.Mui-selected': {
                                        color: '#DC3545', // Active tab color (e.g., red)
                                    },
                                }}
                            />
                    {/* )} */}
                   {/* {permissions.includes("Operator Log") && ( */}
                    <Tab label="OPERATOR LOG" {...a11yProps(3)}
                        disabled={permissions.includes("Operator Log") ? false : true}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />
                    {/* )} */}

                    {/* {permissions.includes("Alert") && ( */}
                    {/* <Tab label="ALERT" {...a11yProps(5)}
                        disabled={permissions.includes("Alert") ? false : true}
                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    /> */}
                 
                    <Tab label="Welding Wire Consumption" {...a11yProps(4)}

                        sx={{
                            color: '#000000', // Inactive tab color (e.g., black)
                            fontWeight: 'bold',
                            '&.Mui-selected': {
                                color: '#DC3545', // Active tab color (e.g., red)
                            },
                        }}
                    />

                  
                    {/* )} */}

                </Tabs>



            </Box>
            {/* {permissions.includes("Energy") && (
                <CustomTabPanel value={value} index={0}>
                    <ROOT_CYCLE.ENERGY_CYCLE />
                </CustomTabPanel>
            )} */}

            {/* {permissions.includes("Generator Usage") && (
                <CustomTabPanel value={value} index={1}>
                    <ROOT_CYCLE.GENERATOR_USAGE_CYCLE />
                </CustomTabPanel>
            )} */}
            {/* <CustomTabPanel value={value} index={1}>
                <ROOT_CYCLE.GAS_CYCLE />
            </CustomTabPanel> */}
            {/* <CustomTabPanel value={value} index={2}>
                <ROOT_CYCLE.POWDER_CONSUMPTION_CYCLE />
            </CustomTabPanel> */}
            {/* {permissions.includes("Oee") && (
                <CustomTabPanel value={value} index={0}>
                    <ROOT_CYCLE.OEE_CYCLE />
                </CustomTabPanel>
            )} */}
            {/* <CustomTabPanel value={value} index={4}>
                <ROOT_CYCLE.SCRAP_CYCLE />
            </CustomTabPanel> */}
            {permissions.includes("Production") && (
                <CustomTabPanel value={value} index={0}>
                    <ROOT_CYCLE.PRODUCTION_CYCLE />
                </CustomTabPanel>
            )}
                <CustomTabPanel value={value} index={1}>
                    <ROOT_CYCLE.OVER_TIME_COST_IMPACT_ANALYSIS />
                </CustomTabPanel>

                <CustomTabPanel value={value} index={2}>
                    <ROOT_CYCLE.IDLE_TIME_ANALYSIS_MANUFACTURING />
                </CustomTabPanel>
            {permissions.includes("Operator Log") && (
                <CustomTabPanel value={value} index={3}>
                    <ROOT_CYCLE.OPERATOR_LOG_CYCLE />
                </CustomTabPanel>
            )}
            {/* {permissions.includes("Alert") && (
                <CustomTabPanel value={value} index={5}>
                    <ROOT_CYCLE.ALERT_CYCLE />
                </CustomTabPanel>
            )} */}
            {/* <CustomTabPanel value={value} index={8}>
                <ROOT_CYCLE.FAULT_METRIC_CYCLE />
            </CustomTabPanel> */}
          
            {/* <CustomTabPanel value={value} index={10}>
                <ROOT_CYCLE.BIOMETRIC_LOG_CYCLE />
            </CustomTabPanel> */}
            {/* {permissions.includes("Fault Metrics") && (
                <CustomTabPanel value={value} index={8}>
                    <FaultMetric />
                </CustomTabPanel>
            )} */}
            <CustomTabPanel value={value} index={4}>
                <WeldingWire />
            </CustomTabPanel>
        </Box>
    );
}
export default Reports;