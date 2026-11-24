import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { EnergyMonitoring } from './EnergyMonitoring';
import { GetPlantTabLists } from '../../Services/NodeJsApiServices';
import { Typography } from '@mui/material';

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
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
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

const EnergyMonitoringTab = () => {
    const [value, setValue] = React.useState(0);
    const [plantTabList, setPlantTabList] = useState([]);
    const [plantName, setPlantName] = useState('')
    // const [feederName, setFeederName] = useState('');


    const handleChange = (event, newValue) => {
        console.log("newValuenewValuenewValue", newValue)
        console.log("newValuenewValuenewValue", event.target)
        setValue(newValue);
    };

    const callBackPlantName = (value) => {
        setPlantName(value);
    }

    const tabList = [
        {
            id: 1,
            tanName: "Plant A"
        },
        {
            id: 1,
            tanName: "Plant B"
        },
        {
            id: 1,
            tanName: "Plant C"
        },
        {
            id: 1,
            tanName: "Plant D"
        },
    ]

    useEffect(() => {
        GetPlantTabLists(handleTabListSuccess, handleTabListException)
    }, [])

    const handleTabListSuccess = (dataObject) => {
        setPlantTabList(dataObject.data);
    }
    const handleTabListException = () => { }

    return (
        <Box sx={{ width: '100%', height: '100%', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1000 }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Incomer" {...a11yProps(0)} />
                    {plantTabList && plantTabList.map((tab, index) => (
                        <Tab label={tab.plantName} {...a11yProps(index + 1)} />
                    ))}
                    {/* <Tab label="Plant B" {...a11yProps(2)} />
                    <Tab label="Plant C" {...a11yProps(3)} /> */}
                </Tabs>
            </Box>
            <Box sx={{ position: 'sticky', top: 49, backgroundColor: '#f0f0f0', zIndex: 1000, paddingTop: '10px', paddingBottom: '3px' }}>
                <h5 style={{ textTransform: 'uppercase', textAlign: 'center' }}>{plantName === 'incomer' ? "Energy Monitoring Dashboard" : plantName}</h5>
            </Box>
            <Box sx={{ height: 'calc(100vh - 48px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <CustomTabPanel value={value} index={0}>
                    <EnergyMonitoring
                        tabPanelName='incomer'
                        tabList={plantTabList}
                        setValue={setValue}
                        callBackPlantName={callBackPlantName}
                    />
                </CustomTabPanel>
                {plantTabList && plantTabList.map((tab, index) => (
                    <CustomTabPanel value={value} index={index + 1}>
                        <EnergyMonitoring
                            tabPanelName={tab.plantName}
                            tabList={plantTabList}
                            setValue={setValue}
                            plantId={tab.id}
                            callBackPlantName={callBackPlantName}
                            // FeederName={tab.feederName}
                        />
                    </CustomTabPanel>
                ))}
                {}
            </Box>
        </Box>
    );
}
export default EnergyMonitoringTab;
