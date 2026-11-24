import {
    Button, Dialog, DialogContent, DialogTitle, TextField, Grid, DialogActions,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import NotificationBar from '../../Utility/NotificationBar';
import AddRegionLocation from './AddRegionLocation';
import AddArea from './AddArea';
import AddBuildingArea from './AddBuildingArea';
// import AddWeavershala from './AddWeavershala';


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
                <Box sx={{ p: 2 }}>
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

const AddLocArea = ({ locAreaOpen, setLocAreaOpen, isAddButton, editData, setRefreshData, }) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


    const [openNotification, setNotification] = useState({
        status: false,
        type: 'error',
        message: '',
    });

    const handleCloseMenu = () => {
        setLocAreaOpen(false);
    }

    const handleClose = () => {
        setNotification({
            status: false,
            type: '',
            message: '',
        });
    };

    const handleSubmit = () => {

    }

    return (
        <Dialog
            sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: '95%' } }}
            maxWidth="xl"
            open={locAreaOpen}
        >
            <DialogTitle style={{ color: 'black' }}>
                Add Location and Area
            </DialogTitle>
            <DialogContent>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ width: '98%', minheight: '400px', marginLeft: '1%', marginTop: '0px' }}>
                        {/* <Paper elevation={3} > */}
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                                <Tab label="Add Location" {...a11yProps(0)} />
                                <Tab label="Add Area" {...a11yProps(1)} />
                                <Tab label="Add Building" {...a11yProps(2)} />
                            </Tabs>
                        </Box>
                        <CustomTabPanel value={value} index={0}>
                            <AddRegionLocation
                                editData={editData}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={1}>
                            <AddArea
                                editData={editData}
                            />
                        </CustomTabPanel>
                        <CustomTabPanel value={value} index={2}>
                            <AddBuildingArea
                                editData={editData}
                            />
                        </CustomTabPanel>


                        {/* </Paper> */}
                    </Box>

                    <DialogActions style={{ marginTop: '2px' }}>

                        <Button onClick={handleCloseMenu} style={{ background: '#e6e3da', color: 'black' }}>
                            Cancel
                        </Button>
                    </DialogActions>

                </form>
            </DialogContent>

            <NotificationBar
                handleClose={handleClose}
                notificationContent={openNotification.message}
                openNotification={openNotification.status}
                type={openNotification.type}
            />
        </Dialog>
    )
}

export default AddLocArea