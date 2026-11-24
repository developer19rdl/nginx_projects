import React from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import AssetList from '../Maintenance_Models/Asset/AddAsset/AssetList';
import AddDepartmentList from '../Maintenance_Models/Asset/Department/AddDepartmentList';
import SectionList from '../Maintenance_Models/Asset/Section/SectionList';
import AssetTypeList from '../Maintenance_Models/Asset/AssetType/AssetTypeList';
import AssetGroupList from '../Maintenance_Models/Asset/AssetGroup/AssetGroupList';
import TransferList from '../Maintenance_Models/Asset/Transferasset/TransferList';
import MstrAssetList from '../Maintenance_Models/Asset/MstrAssetList/MstrAssetList';
import VendorList from '../Maintenance_Models/Asset/AddVendor/VendorList';


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

const AssetComponent = () => {

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
                    <Tab label="ADD ASSET" {...a11yProps(0)} />
                    <Tab label="DEPARTMENT" {...a11yProps(1)} />
                    <Tab label="SECTION" {...a11yProps(2)} />
                    <Tab label="ASSET TYPE" {...a11yProps(3)} />
                    <Tab label="ASSET GROUP" {...a11yProps(4)} />
                    <Tab label="TRANSFER ASSET" {...a11yProps(5)} />
                    <Tab label="MASTER ASSET LIST" {...a11yProps(6)} />
                    <Tab label="ADD VENDOR" {...a11yProps(7)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
               <AssetList/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <AddDepartmentList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <SectionList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
               <AssetTypeList/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              <AssetGroupList/>
            </CustomTabPanel>   
            <CustomTabPanel value={value} index={5}>
             <TransferList/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={6}>
             <MstrAssetList/>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={7}>
              <VendorList/>
            </CustomTabPanel>
        </Box>
    )
}
export default AssetComponent;
