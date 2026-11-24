import React from 'react'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import TransferAsset from './TransferAsset';
import AddDepartmentList from './Department/AddDepartmentList';
import SectionList from './Section/SectionList';
import AssetTypeList from './AssetType/AssetTypeList';
import AssetGroupList from './AssetGroup/AssetGroupList';
import VendorList from './AddVendor/VendorList';
import MstrAssetList from './MstrAssetList/MstrAssetList';
import AssetList from './AddAsset/AssetList';
import TransferList from './Transferasset/TransferList';


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

const Asset = () => {

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
export default Asset;
